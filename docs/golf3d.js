/* 高尔夫 3D 动作演示：人体骨架 + 双骨骼 IK + 挥杆平面。
   坐标：球在原点；目标方向 +x；球手面向 +z（右手持杆者，目标在其左侧）；y 向上。
   球杆沿“挥杆平面”转动：d(α) = cosα·(−m) + sinα·(−x)，m = (0, sinφ, −cosφ)（平面斜向上、向球手身后）。
   α：0 = 准备；90 = 上杆腰高(杆水平、杆头在后)；180≈杆竖直；270 = 杆顶(杆指向目标)；负值 = 随挥/收杆。 */
(function () {
  const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), D2R = Math.PI / 180;
  const BODY = { upper: 0.31, fore: 0.38, thigh: 0.44, shin: 0.44, torso: 0.55, hipW: 0.20, shW: 0.39, ankleY: 0.07 };

  /* ---------- 数学辅助 ---------- */
  function ik2(a, target, l1, l2, pole) {
    const ab = target.clone().sub(a); let dist = ab.length();
    const maxR = (l1 + l2) * 0.999; if (dist > maxR) dist = maxR; if (dist < 0.05) dist = 0.05;
    const dir = ab.normalize();
    const x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(l1 * l1 - x * x, 0));
    let pp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir)));
    if (pp.lengthSq() < 1e-6) pp = V(0, -1, 0); pp.normalize();
    const mid = a.clone().add(dir.clone().multiplyScalar(x)).add(pp.multiplyScalar(h));
    return { mid, end: a.clone().add(dir.multiplyScalar(dist)) };
  }
  // 单调三次 Hermite 插值（PCHIP）：不过冲，关键帧时间可不等距
  function sample(keys, f, t) {
    const n = keys.length, g = k => (f in k ? k[f] : 0); let i = 0; while (i < n - 2 && t > keys[i + 1].t) i++;
    const y = j => g(keys[Math.min(Math.max(j, 0), n - 1)]), tt = j => keys[Math.min(Math.max(j, 0), n - 1)].t;
    const slope = j => { const dt = tt(j + 1) - tt(j); return dt > 1e-9 ? (y(j + 1) - y(j)) / dt : 0; };
    const deriv = j => {
      if (j <= 0) return slope(0); if (j >= n - 1) return slope(n - 2);
      const d0 = slope(j - 1), d1 = slope(j); if (d0 * d1 <= 0) return 0;
      const h0 = tt(j) - tt(j - 1), h1 = tt(j + 1) - tt(j), w1 = 2 * h1 + h0, w2 = h1 + 2 * h0; return (w1 + w2) / (w1 / d0 + w2 / d1);
    };
    const t1 = keys[i].t, t2 = keys[i + 1].t, h = t2 - t1 || 1, u = Math.min(Math.max((t - t1) / h, 0), 1), u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * y(i) + (u3 - 2 * u2 + u) * h * deriv(i) + (-2 * u3 + 3 * u2) * y(i + 1) + (u3 - u2) * h * deriv(i + 1);
  }

  /* ---------- 动作定义 ----------
     关键帧字段：sh 骨盆向目标平移(m)、hipT 髋转、shT 肩转（上杆为正）、tilt 前倾、sb 侧弯（背离目标为正）、
     hl/hu/hf 双手相对准备姿势的偏移（胸腔坐标：左/上/前）、a 球杆平面角、w 击球对准权重(1=杆头必须在球上)。 */
  const MOTIONS = {
    swing: {
      name: "完整挥杆（7 号铁）· P1–P10", club: { len: 0.85, phi: 62, kind: "iron" }, tilt0: 38, dur: 1.6, topT: 0.4875, impactT: 0.65, ballLift: 0.035, tempoNote: "上杆 0.78 秒 : 下杆 0.26 秒 ≈ 3 : 1",
      keys: [
        { t: 0.0000, L: "P1 准备", sh: 0, hipT: 0, shT: 0, tilt: 38, sb: 3, wt: 0.5, hl: 0, hu: 0, hf: 0, a: 3, w: 0 },
        { t: 0.1750, L: "P2 上杆杆身平行", sh: -0.01, hipT: 16, shT: 36, tilt: 38, sb: 3, wt: 0.45, hl: 0, hu: 0.16, hf: 0.08, a: 90, w: 0 },
        { t: 0.3250, L: "P3 上杆手臂平行", sh: -0.03, hipT: 30, shT: 68, tilt: 38, sb: 3.5, wt: 0.37, hl: -0.04, hu: 0.44, hf: 0.06, a: 150, w: 0 },
        { t: 0.4875, L: "P4 杆顶", sh: -0.04, hipT: 45, shT: 95, tilt: 38, sb: 4, wt: 0.3, hl: -0.12, hu: 0.86, hf: -0.09, a: 266, w: 0 },
        { t: 0.5625, L: "P5 下杆手臂平行", sh: 0.01, hipT: 18, shT: 70, tilt: 38, sb: 7, wt: 0.5, hl: -0.06, hu: 0.46, hf: 0.1, a: 175, w: 0 },
        { t: 0.6125, L: "P6 下杆杆身平行", sh: 0.06, hipT: -20, shT: 30, tilt: 38, sb: 12, wt: 0.66, hl: -0.02, hu: 0.24, hf: 0.11, a: 91, w: 0 },
        { t: 0.6500, L: "P7 击球", sh: 0.08, hipT: -33, shT: -8, tilt: 38, sb: 15, wt: 0.78, hl: 0, hu: 0, hf: 0, a: 8, w: 0 },
        { t: 0.6937, L: "P8 送杆杆身平行", sh: 0.11, hipT: -45, shT: -40, tilt: 37, sb: 13, wt: 0.86, hl: 0, hu: 0.24, hf: 0.09, a: -90, w: 0 },
        { t: 0.7500, L: "P9 送杆手臂平行", sh: 0.15, hipT: -58, shT: -78, tilt: 33, sb: 8, wt: 0.92, hl: 0.05, hu: 0.42, hf: 0.01, a: -150, w: 0 },
        { t: 0.9125, L: "P10 收杆", sh: 0.2, hipT: -72, shT: -108, tilt: 22, sb: 0, wt: 0.97, hl: 0, hu: 0.8, hf: -0.09, a: -232, w: 0 },
        { t: 1.0000, L: "P10 收杆", sh: 0.2, hipT: -72, shT: -108, tilt: 22, sb: 0, wt: 0.97, hl: 0, hu: 0.8, hf: -0.09, a: -232, w: 0 },
      ],
      notes: {
        "P1 准备": "髋部前倾、背平直、膝微弯；双手自然下垂；重心 50:50；球在站位中间偏前。",
        "P2 上杆杆身平行": "杆身与地面平行，杆头在手的正后方、杆面朝上；肩膀带着手臂一起转，不是单用手拿起来。",
        "P3 上杆手臂平行": "左臂与地面平行；肩转约 70°、髋转约 30°；重心逐渐移向后脚内侧。",
        "P4 杆顶": "肩转约 90–100°、髋转约 45°（肩转约为髋转的两倍）；左臂较直；重心约 70–80% 在后脚；头基本不动。",
        "P5 下杆手臂平行": "下杆由下肢先启动：重心已移向前脚、髋先转；手腕保持折叠角度，手臂随后被带下来。",
        "P6 下杆杆身平行": "杆身再次与地面平行；髋已打开约 20°，肩膀还在后面，形成‘拉伸’；杆头速度快速上升。",
        "P7 击球": "髋打开约 30–35°，肩接近方正；重心约 75–80% 在前脚；手略领先于球；杆头在最低点之前先碰球；头在球后。",
        "P8 送杆杆身平行": "杆身再次平行于地面、指向目标方向；手臂向目标伸展，胸口转向目标；头开始抬起。",
        "P9 送杆手臂平行": "左臂与地面平行；身体继续转，重心几乎全在前脚；头转向目标。",
        "P10 收杆": "胸口朝向目标，重心 90% 以上在前脚，后脚跟抬起，手在前耳旁；保持平衡站稳 3 秒。",
      },
    },
    driver: {
      name: "一号木开球（P1–P10）", club: { len: 1.03, phi: 54, kind: "driver" }, tilt0: 35, dur: 1.65, topT: 0.4875, impactT: 0.65, ballLift: 0.09, ballX: 0.0, tempoNote: "上杆约 0.8 秒 : 下杆约 0.27 秒 ≈ 3 : 1",
      keys: null, base: "swing",
      tweak: { tiltAdj: -3, sh: -0.04, a: { 90: 92, 150: 154, 266: 274, "-232": -240 } },
      notes: null,
    },
    putt: {
      name: "推杆（肩摆钟摆）", headFollow: 6, club: { len: 0.76, phi: 70, kind: "putter" }, tilt0: 42, dur: 1.3, topT: 0.4615, impactT: 0.6923, ballLift: 0.021, roll: true, stance: 0.13, tempoNote: "后摆 0.60 秒 : 前摆 0.30 秒 ≈ 2 : 1（Blast Motion 巡回赛范围 0.57–0.63 / 0.29–0.31）",
      keys: [
        { t: 0.0000, L: "1 准备", sh: 0, hipT: 0, shT: 0, tilt: 42, sb: 0, wt: 0.5, hl: 0, hu: 0, hf: 0, a: 0, w: 1 },
        { t: 0.4615, L: "2 后摆", sh: 0, hipT: 0, shT: 0, tilt: 42, sb: 0, wt: 0.5, hl: 0, hu: 0.0, hf: 0.0, a: 26, w: 0 },
        { t: 0.6923, L: "3 击球", sh: 0, hipT: 0, shT: 0, tilt: 42, sb: 0, wt: 0.5, hl: 0, hu: 0, hf: 0, a: 0, w: 1 },
        { t: 0.9231, L: "4 送杆", sh: 0, hipT: 0, shT: 0, tilt: 42, sb: 0, wt: 0.5, hl: 0, hu: 0, hf: 0, a: -26, w: 0 },
        { t: 1.0000, L: "4 送杆", sh: 0, hipT: 0, shT: 0, tilt: 42, sb: 0, wt: 0.5, hl: 0, hu: 0, hf: 0, a: -26, w: 0 },
      ],
      notes: {
        "1 准备": "眼睛在球正上方，肩膀、手臂、杆形成稳定的‘五边形’；握压很轻。",
        "2 后摆": "只用肩膀摆动，手腕不动；后摆的长度决定距离，约 0.6 秒。",
        "3 击球": "杆面方正地过球，头保持不动。",
        "4 送杆": "送杆长度与后摆相近；前摆时间约是后摆的一半（2:1），顺势加速通过球，不要在击球处突然发力或减速。",
      },
    },
    chip: {
      name: "切杆 Chip", headFollow: 22, club: { len: 0.74, phi: 66, kind: "wedge" }, tilt0: 40, dur: 1.45, impactT: 0.52, ballLift: 0.021, roll: true, shiftBall: 0.12, runout: true, stance: 0.12,
      keys: [
        { t: 0.00, L: "1 准备", sh: 0.07, hipT: -10, shT: -6, tilt: 40, sb: 0, hl: 0, hu: 0, hf: 0, a: 4, w: 1 },
        { t: 0.30, L: "2 后摆", sh: 0.07, hipT: -6, shT: 8, tilt: 40, sb: 4, hl: 0, hu: 0.04, hf: 0.0, a: 34, w: 0 },
        { t: 0.40, L: "2 后摆", sh: 0.07, hipT: -6, shT: 8, tilt: 40, sb: 4, hl: 0, hu: 0.04, hf: 0.0, a: 34, w: 0 },
        { t: 0.52, L: "3 击球", sh: 0.08, hipT: -12, shT: -8, tilt: 40, sb: 3, hl: 0, hu: 0, hf: 0, a: 6, w: 1 },
        { t: 0.72, L: "4 送杆", sh: 0.08, hipT: -16, shT: -20, tilt: 39, sb: 0, hl: 0, hu: 0.05, hf: 0.0, a: -32, w: 0 },
        { t: 1.00, L: "4 送杆", sh: 0.08, hipT: -16, shT: -20, tilt: 39, sb: 0, hl: 0, hu: 0.05, hf: 0.0, a: -32, w: 0 },
      ],
      notes: {
        "1 准备": "双脚并拢偏窄、身体略朝目标打开；球靠近右脚；重心约六成在左脚。",
        "2 后摆": "动作很小，像放大的推杆；手腕不翻。",
        "3 击球": "手领先杆头，向下轻刷过球，重心不变。",
        "4 送杆": "手臂向目标送出，杆头不超过手；球低飞落地后向洞滚动。",
      },
    },
    pitch: {
      name: "高抛球 Pitch（9 点钟）", headFollow: 45, club: { len: 0.74, phi: 64, kind: "wedge" }, tilt0: 41, dur: 1.55, impactT: 0.55, ballLift: 0.021, shiftBall: 0.05, stance: 0.16,
      keys: [
        { t: 0.00, L: "1 准备", sh: 0.04, hipT: -6, shT: -4, tilt: 41, sb: 2, hl: 0, hu: 0, hf: 0, a: 3, w: 1 },
        { t: 0.30, L: "2 后摆到 9 点", sh: 0.02, hipT: 10, shT: 34, tilt: 41, sb: 4, hl: 0, hu: 0.28, hf: 0.05, a: 92, w: 0 },
        { t: 0.40, L: "2 后摆到 9 点", sh: 0.02, hipT: 10, shT: 34, tilt: 41, sb: 4, hl: 0, hu: 0.28, hf: 0.05, a: 92, w: 0 },
        { t: 0.55, L: "3 击球", sh: 0.08, hipT: -18, shT: -6, tilt: 41, sb: 5, hl: 0, hu: 0, hf: 0, a: 7, w: 1 },
        { t: 0.75, L: "4 送杆到 3 点", sh: 0.10, hipT: -30, shT: -34, tilt: 39, sb: 3, hl: 0.02, hu: 0.28, hf: 0.04, a: -92, w: 0 },
        { t: 1.00, L: "4 送杆到 3 点", sh: 0.10, hipT: -30, shT: -34, tilt: 39, sb: 3, hl: 0.02, hu: 0.28, hf: 0.04, a: -92, w: 0 },
      ],
      notes: {
        "1 准备": "站姿略窄，球放中间，手略领先，重心偏左脚。",
        "2 后摆到 9 点": "双手摆到‘9 点钟’（腰高），用同一个节奏；手腕保持稳定。",
        "3 击球": "送杆和后摆一样长，千万别在击球处减速。",
        "4 送杆到 3 点": "对称摆到‘3 点钟’。摆幅大小决定距离，不是用力。",
      },
    },
  };
  // 复用：driver 在 swing 关键帧上微调
  (function () {
    const b = MOTIONS.swing, d = MOTIONS.driver;
    d.keys = b.keys.map(k => Object.assign({}, k, { tilt: k.tilt + d.tweak.tiltAdj }));
    d.notes = Object.assign({}, b.notes, { "1 准备": "球放在左脚内侧，站得更宽；球 tee 高度约半个球露在杆头上方。", "7 击球": "一号木在最低点之后、向上扫过球；重心约六成在左脚。" });
  })();

  /* ---------- 渲染器 ---------- */
  class Viewer {
    constructor(el, motionKey, opts) {
      this.polish = !!(opts && opts.polish); this.overlays = true;
      this.el = el; this.key = motionKey; this.m = MOTIONS[motionKey]; this.t = 0; this.playing = true; this.speed = 0.5; this.cam = "face";
      this.drag = null; this.yaw = 0; this.pitch = 0; this.hold = 0;
      this.build();
    }
    build() {
      const el = this.el, m = this.m;
      el.innerHTML = `<div class="g3d"><div class="g3d-cv"></div>
        <div class="g3d-cap"><b class="g3d-ph"></b><span class="g3d-tx"></span></div>
        <div class="g3d-ctl"><button class="g3d-play">⏸ 暂停</button>
          <input class="g3d-seek" type="range" min="0" max="1000" value="0">
          <span class="g3d-sp"><button data-s="1">1×</button><button data-s="0.5" class="on">0.5×</button><button data-s="0.25">0.25×</button></span>
          <span class="g3d-cm"><button data-c="face" class="on">正面</button><button data-c="dtl">背面</button><button data-c="top">俯视</button></span>${this.polish ? '<span class="g3d-ov"><button data-ov="1" class="on">辅助线</button></span>' : ""}</div>
        <div class="g3d-chips"></div></div>`;
      this.cv = el.querySelector(".g3d-cv");
      const w = this.cv.clientWidth || 600, h = Math.round(w * 0.62);
      try { this.r = new T.WebGLRenderer({ antialias: true, alpha: false }); } catch (e) { el.innerHTML = '<p class="muted">此浏览器不支持 3D 演示。</p>'; this.dead = true; return; }
      this.r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); this.r.setSize(w, h); this.r.shadowMap.enabled = true; this.r.shadowMap.type = T.PCFSoftShadowMap;
      this.cv.appendChild(this.r.domElement); this.r.domElement.style.cssText = "width:100%;height:auto;border-radius:10px;touch-action:none;cursor:grab";
      this.scene = new T.Scene(); this.scene.background = new T.Color(0xcfe8f7); this.scene.fog = new T.Fog(0xcfe8f7, 14, 30);
      this.camera = new T.PerspectiveCamera(32, w / h, 0.1, 60);
      this.scene.add(new T.HemisphereLight(0xffffff, 0x6aa86f, 0.85));
      const sun = new T.DirectionalLight(0xffffff, 0.9); sun.position.set(-2.5, 5, 3); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
      Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 14 }); this.scene.add(sun);
      this.buildScene(); this.buildBody(); if (this.polish) this.upgrade(); this.bind(); this.setCam("face"); this.updateChips(); this.setT(0);
      this.last = performance.now(); this.loop = this.loop.bind(this); requestAnimationFrame(this.loop);
    }
    buildScene() {
      const g = new T.Mesh(new T.PlaneGeometry(40, 40), new T.MeshStandardMaterial({ color: 0x69b56f, roughness: 1 })); g.rotation.x = -Math.PI / 2; g.receiveShadow = true; this.scene.add(g);
      // 割草条纹
      const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
      for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#6fba75" : "#62ac68"; x.fillRect(0, i * 32, 256, 32); }
      const tex = new T.CanvasTexture(c); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(6, 6); g.material.map = tex;
      // 目标线
      const pts = [V(-1.2, 0.004, 0), V(5.5, 0.004, 0)]; const ln = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineDashedMaterial({ color: 0xffffff, dashSize: 0.12, gapSize: 0.1 })); ln.computeLineDistances(); this.scene.add(ln);
      const flag = new T.Group(); const pole = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 1.4, 8), new T.MeshStandardMaterial({ color: 0xeeeeee })); pole.position.y = 0.7; flag.add(pole);
      const fl = new T.Mesh(new T.PlaneGeometry(0.4, 0.26), new T.MeshStandardMaterial({ color: 0xe74c3c, side: T.DoubleSide })); fl.position.set(0.2, 1.25, 0); flag.add(fl); flag.position.set(6.2, 0, 0); this.scene.add(flag);
      this.ball = new T.Mesh(new T.SphereGeometry(0.034, 20, 16), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })); this.ball.castShadow = true; this.scene.add(this.ball);
      this.tee = new T.Mesh(new T.CylinderGeometry(0.008, 0.005, 0.06, 8), new T.MeshStandardMaterial({ color: 0xf1d9a0 })); this.tee.visible = this.m.club.kind === "driver"; this.scene.add(this.tee);
      this.trail = new T.Line(new T.BufferGeometry(), new T.LineBasicMaterial({ color: 0xffffff })); this.scene.add(this.trail);
      this.hole = new T.Mesh(new T.CircleGeometry(0.06, 20), new T.MeshBasicMaterial({ color: 0x1b2b1b })); this.hole.rotation.x = -Math.PI / 2; this.hole.position.set(this.m.roll && !this.m.runout ? 1.8 : 3.0, 0.006, 0); this.hole.visible = !!this.m.roll; this.scene.add(this.hole);
    }
    limb(r, color) { const g = new T.Group(); const cyl = new T.Mesh(new T.CylinderGeometry(r, r, 1, 14), new T.MeshStandardMaterial({ color, roughness: 0.7 })); cyl.castShadow = true; g.add(cyl);
      const s1 = new T.Mesh(new T.SphereGeometry(r, 14, 10), cyl.material), s2 = s1.clone(); s1.castShadow = s2.castShadow = true; g.add(s1, s2); g.cyl = cyl; g.s1 = s1; g.s2 = s2; this.scene.add(g); return g; }
    setLimb(g, a, b) { const d = b.clone().sub(a), l = d.length() || 1e-4; const k = g.k || 1; g.cyl.scale.set(k, l, k); g.s1.scale.setScalar(k); g.s2.scale.setScalar(k); g.cyl.position.copy(a.clone().add(b).multiplyScalar(0.5));
      g.cyl.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); g.s1.position.copy(a); g.s2.position.copy(b); }
    ell(rx, ry, rz, color) { const m = new T.Mesh(new T.SphereGeometry(1, 20, 14), new T.MeshStandardMaterial({ color, roughness: 0.75 })); m.scale.set(rx, ry, rz); m.castShadow = true; this.scene.add(m); return m; }
    buildBody() {
      const skin = 0xe0b48d, shirt = 0x2457a6, pants = 0xd9d4c6, shoe = 0x333333, cap = 0xf2f2f2, glove = 0xffffff;
      this.P = { thL: this.limb(0.078, pants), thR: this.limb(0.078, pants), shL: this.limb(0.055, pants), shR: this.limb(0.055, pants),
        uaL: this.limb(0.052, shirt), uaR: this.limb(0.052, shirt), faL: this.limb(0.042, skin), faR: this.limb(0.042, skin), neck: this.limb(0.05, skin) };
      this.torso = this.ell(0.17, 0.29, 0.105, shirt); this.pelvis = this.ell(0.16, 0.12, 0.11, pants);
      this.head = this.ell(0.095, 0.115, 0.1, skin); this.cap = this.ell(0.1, 0.07, 0.105, cap); this.visor = this.ell(0.07, 0.012, 0.09, cap);
      this.footL = new T.Mesh(new T.BoxGeometry(0.1, 0.07, 0.28), new T.MeshStandardMaterial({ color: shoe })); this.footR = this.footL.clone(); this.footL.castShadow = this.footR.castShadow = true; this.scene.add(this.footL, this.footR);
      this.hL = new T.Mesh(new T.SphereGeometry(0.05, 14, 10), new T.MeshStandardMaterial({ color: glove })); this.hR = new T.Mesh(new T.SphereGeometry(0.046, 14, 10), new T.MeshStandardMaterial({ color: skin })); this.hL.castShadow = this.hR.castShadow = true; this.scene.add(this.hL, this.hR);
      this.shaft = this.limb(0.0085, 0xb9bec4); this.grip = this.limb(0.0125, 0x222222);
      const kind = this.m.club.kind, hs = kind === "putter" ? [0.12, 0.03, 0.05] : kind === "driver" ? [0.115, 0.058, 0.105] : [0.095, 0.05, 0.022];
      this.chead = new T.Mesh(new T.BoxGeometry(hs[0], hs[1], hs[2]), new T.MeshStandardMaterial({ color: kind === "driver" ? 0x222831 : 0x9aa2aa, metalness: 0.6, roughness: 0.35 })); this.chead.castShadow = true; this.scene.add(this.chead);
      this.chead.geometry.translate(0, 0, 0);
      // 初始：由准备姿势求落脚点
      this.initStance();
    }
    // 由准备姿势确定球手位置（让杆头落在球上）与脚的位置
    initStance() {
      const m = this.m, k0 = m.keys[0]; this.base = V(0, 0.90, -0.79); this.ballPos = V(0, m.ballLift, 0);
      if (m.shiftBall) this.base.x = m.shiftBall; // 球更靠近右脚
      // 迭代两次：让 w=1 时手的位置正好使杆头在球上
      for (let i = 0; i < 3; i++) { const s = this.solve(0, true); this.base.add(V(0, 0, 0)); this.base.x += s.headErr.x; this.base.z += s.headErr.z; this.base.y += (s.headErr.y) * 0.0; }
      this.stance = m.stance || 0.19;
      const s = this.solve(0, true), pl = s.pelvis; const fy = BODY.ankleY / 2;
      this.ankL = V(pl.x + 0.02 + this.stance * 0.5 * 1.0, fy, pl.z + 0.02); this.ankR = V(pl.x + 0.02 - this.stance * 0.5 * 1.0 - 0.1, fy, pl.z + 0.0);
      this.ankL.x = pl.x + this.stance * 0.95; this.ankR.x = pl.x - this.stance * 0.95;
      this.impErr = null; this.impErr = this.solve(this.m.impactT, true, true).headErr.clone();
    }
    frame(t) { const m = this.m, k = f => sample(m.keys, f, t); return { sh: k("sh"), hipT: k("hipT"), shT: k("shT"), tilt: k("tilt"), sb: k("sb"), hl: k("hl"), hu: k("hu"), hf: k("hf"), a: k("a"), w: Math.min(Math.max(k("w"), 0), 1), wt: m.keys[0].wt != null ? k("wt") : null }; }
    // 计算姿势：返回各关节位置
    solve(t, atRest, noSnap) {
      const m = this.m, f = this.frame(t), B = BODY, phi = m.club.phi * D2R;
      const P = this.base.clone(); P.x += f.sh;
      // 脊柱：前倾 → 侧弯 → 绕脊柱扭转（肩转）
      const qTilt = new T.Quaternion().setFromAxisAngle(V(1, 0, 0), f.tilt * D2R); const qSide = new T.Quaternion().setFromAxisAngle(V(0, 0, 1), f.sb * D2R);
      const qLean = qSide.clone().multiply(qTilt); const spineUp = V(0, 1, 0).applyQuaternion(qLean);
      const qTwist = new T.Quaternion().setFromAxisAngle(spineUp, -f.shT * D2R); const qChest = qTwist.multiply(qLean);
      const N = P.clone().add(spineUp.clone().multiplyScalar(B.torso));
      const cx = V(1, 0, 0).applyQuaternion(qChest), cy = V(0, 1, 0).applyQuaternion(qChest), cz = V(0, 0, 1).applyQuaternion(qChest);
      const Lsh = N.clone().add(cx.clone().multiplyScalar(B.shW / 2)), Rsh = N.clone().sub(cx.clone().multiplyScalar(B.shW / 2));
      // 髋
      const qHip = new T.Quaternion().setFromAxisAngle(V(0, 1, 0), -f.hipT * D2R); const hx = V(1, 0, 0).applyQuaternion(qHip), hz = V(0, 0, 1).applyQuaternion(qHip);
      const Lhip = P.clone().add(hx.clone().multiplyScalar(B.hipW / 2)), Rhip = P.clone().sub(hx.clone().multiplyScalar(B.hipW / 2));
      // 球杆方向（沿挥杆平面）
      const al = f.a * D2R, mv = V(0, Math.sin(phi), -Math.cos(phi)), xv = V(1, 0, 0);
      const d = mv.clone().multiplyScalar(-Math.cos(al)).add(xv.clone().multiplyScalar(-Math.sin(al))).normalize();
      // 双手：准备姿势时的基准（胸腔坐标），其余帧在其上加偏移
      if (!this.h0) this.h0 = this.calcH0(); const h0 = this.h0;
      let hand = N.clone().add(cx.clone().multiplyScalar(h0.l + f.hl)).add(cy.clone().multiplyScalar(h0.u + f.hu)).add(cz.clone().multiplyScalar(h0.f + f.hf));
      const Lc = m.club.len;
      // 击球对准：手 = 球 − d·Lc
      // 击球对准：算出“要让杆头正好经过球，手需要偏移多少”；击球前后用一个平滑的小窗口把偏移加上，
      // 杆头不再被钉在球上，所以击球时速度连续（之前的“停顿”就来自这里）。
      const ballT = this.ballPos.clone(); const need = ballT.clone().sub(d.clone().multiplyScalar(Lc));
      const headErr = need.clone().sub(hand);
      if (!noSnap && this.impErr) { const g = Math.exp(-Math.pow((t - m.impactT) / 0.05, 2)); hand.add(this.impErr.clone().multiplyScalar(g)); }
      // 手够不到时：把手限制在手臂能伸到的范围内（不再把肩膀往上“拽”，否则头会跟着升高）
      const reach = (B.upper + B.fore) * 0.985, dd = Lsh.distanceTo(hand); this._dd0 = dd;
      if (dd > reach) { const dir = hand.clone().sub(Lsh).normalize(); hand.copy(Lsh).add(dir.multiplyScalar(reach)); }
      const head = hand.clone().add(d.clone().multiplyScalar(Lc));
      const handR = hand.clone().add(d.clone().multiplyScalar(0.11));
      // 手臂 IK（肘的指向：向下并略向外）
      const polL = V(0, -1, 0).add(cx.clone().multiplyScalar(0.55)).add(cz.clone().multiplyScalar(-0.2)), polR = V(0, -1, 0).sub(cx.clone().multiplyScalar(0.55)).add(cz.clone().multiplyScalar(-0.2));
      const aL = ik2(Lsh, hand, B.upper, B.fore, polL), aR = ik2(Rsh, handR, B.upper, B.fore, polR);
      // 腿 IK（膝向前并向外）：骨盆高度随膝弯略调整
      const full = m.club.kind === "iron" || m.club.kind === "driver";
      const prog = full ? Math.min(Math.max((t - m.impactT) / (1 - m.impactT) * 2.2, 0), 1) : 0, ep = prog * prog * (3 - 2 * prog);
      const ankRt = (this.ankR || V(P.x - 0.19, 0.035, P.z)).clone(); ankRt.x += 0.17 * ep; ankRt.y += 0.075 * ep;
      const polK = V(0, 0, 1);
      const lg = { L: ik2(Lhip, this.ankL || V(P.x + 0.19, 0.035, P.z), B.thigh, B.shin, polK.clone().add(V(0.25, 0, 0))), R: ik2(Rhip, ankRt, B.thigh, B.shin, polK.clone().add(V(-0.25, 0, 0))) };
      return { t, dd0: dd, ep, ankRt, P, pelvis: P, N, Lsh, Rsh, cx, cy, cz, Lhip, Rhip, qChest, qHip, spineUp, hand, handR, head, d, al, aL, aR, lg, Lc, headErr, f, hx, hz };
    }
    calcH0() {
      // 由准备姿势：手在 y=杆头高度 + Lc·sinφ 处，用胸腔坐标求 (l,u,f)
      const m = this.m, B = BODY, phi = m.club.phi * D2R, tilt = m.tilt0 * D2R, d0 = V(0, -Math.sin(phi), Math.cos(phi));
      const handW = this.ballPos.clone().sub(d0.clone().multiplyScalar(m.club.len));
      const Ny = this.base.y + B.torso * Math.cos(tilt), up = V(0, Math.cos(tilt), Math.sin(tilt)), fw = V(0, -Math.sin(tilt), Math.cos(tilt));
      const dy = handW.y - Ny, dz = 0.10; // 手在肩前方约 10cm
      const u = dy * up.y + dz * up.z, ff = dy * fw.y + dz * fw.z; return { l: 0, u, f: ff };
    }
    apply(s) {
      const B = BODY, P = this.P; this.setLimb(P.thL, s.Lhip, s.lg.L.mid); this.setLimb(P.shL, s.lg.L.mid, s.lg.L.end); this.setLimb(P.thR, s.Rhip, s.lg.R.mid); this.setLimb(P.shR, s.lg.R.mid, s.lg.R.end);
      this.setLimb(P.uaL, s.Lsh, s.aL.mid); this.setLimb(P.faL, s.aL.mid, s.aL.end); this.setLimb(P.uaR, s.Rsh, s.aR.mid); this.setLimb(P.faR, s.aR.mid, s.aR.end);
      // 躯干与骨盆
      const mid = s.P.clone().add(s.N).multiplyScalar(0.5); this.torso.position.copy(mid.clone().add(s.cy.clone().multiplyScalar(0.02))); this.torso.quaternion.copy(s.qChest);
      this.pelvis.position.copy(s.P); this.pelvis.quaternion.copy(s.qHip);
      // 颈与头：头部保持朝向球，不随肩转
      const neckTop = s.N.clone().add(s.spineUp.clone().multiplyScalar(0.10)); this.setLimb(P.neck, s.N, neckTop);
      const hc = s.N.clone().add(s.spineUp.clone().multiplyScalar(0.21)).add(V(0, 0, 0.03));
      // 头部朝向：上杆时略向右转，击球时回到看球，击球后抬头并转向目标（头不再一直盯着球线）
      const sm = x => { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); }, ti = this.m.impactT, ff = this.m.headFollow != null ? this.m.headFollow : 78, tp = s.t;
      let yaw, pit = 0;
      const tt = this.m.topT || 0.4 * ti / 0.64; if (tp < tt) yaw = -12 * sm(tp / tt); else if (tp < ti) yaw = -12 * (1 - sm((tp - tt) / (ti - tt))); else { const u = sm((tp - ti - 0.03) / (0.97 - ti - 0.03)); yaw = ff * u; pit = -ff * 0.26 * u; }
      const hq = new T.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw * D2R).multiply(new T.Quaternion().setFromAxisAngle(V(1, 0, 0), pit * D2R)); this._hq = hq;
      this.head.position.copy(hc); this.head.quaternion.copy(hq); this.cap.position.copy(hc.clone().add(V(0, 0.05, 0).applyQuaternion(hq))); this.cap.quaternion.copy(hq); this.visor.position.copy(hc.clone().add(V(0, 0.03, 0.1).applyQuaternion(hq))); this.visor.quaternion.copy(hq);
      // 脚
      this.footL.position.set(this.ankL.x, 0.035, this.ankL.z + 0.05); this.footR.position.set(s.ankRt.x, 0.035 + 0.05 * s.ep, s.ankRt.z + 0.05); this.footL.rotation.y = -0.35; this.footR.rotation.y = 0.12; this.footR.rotation.x = 0.85 * s.ep;
      // 手与球杆
      this.hL.position.copy(s.aL.end); this.hR.position.copy(s.aR.end);
      const gripEnd = s.hand.clone().sub(s.d.clone().multiplyScalar(0.09)); this.setLimb(this.shaft, gripEnd, s.hand.clone().add(s.d.clone().multiplyScalar(s.Lc)));
      this.setLimb(this.grip, gripEnd, s.hand.clone().add(s.d.clone().multiplyScalar(0.14)));
      // 杆头：基底 y 轴沿杆身（向上），x 轴为杆面法线（保持在平面内）
      const phi = this.m.club.phi * D2R, mv = V(0, Math.sin(phi), -Math.cos(phi)), al = s.al, nf = mv.clone().multiplyScalar(-Math.sin(al)).add(V(1, 0, 0).multiplyScalar(Math.cos(al)));
      const yl = s.d.clone().negate(), xl = nf.clone().normalize(), zl = new T.Vector3().crossVectors(xl, yl).normalize(); xl.crossVectors(yl, zl).normalize();
      const head = s.hand.clone().add(s.d.clone().multiplyScalar(s.Lc)); this.chead.position.copy(head.clone().add(yl.clone().multiplyScalar(0.015))); this.chead.setRotationFromMatrix(new T.Matrix4().makeBasis(zl, yl, xl.clone().negate()));
      this.lastHead = head; if (this.polish) this.polishUpdate(s);
    }
    // 球：击球前静止；击球后飞出/滚动
    updateBall(t) {
      const m = this.m, ti = m.impactT, b = this.ball; const p0 = this.ballPos.clone(); this.tee.position.set(p0.x, p0.y / 2 - 0.012, p0.z);
      if (t < ti) { b.position.copy(p0); this.trail.visible = false; return; }
      const s = (t - ti) / (1 - ti); this.trail.visible = true; const pts = [];
      let pos;
      if (m.roll) { // 推杆/切杆：沿地滚动（切杆先飞一小段）
        const dist = m.runout ? 3.0 : 1.8, u = Math.min(s * 1.25, 1); const e = 1 - Math.pow(1 - u, 2.2);
        const x = p0.x + dist * e, fly = m.runout ? 0.9 : 0, y = p0.y + (m.runout && e < 0.34 ? Math.sin(Math.PI * e / 0.34) * 0.32 : 0) + 0; pos = V(x, y, 0); void fly;
        for (let i = 0; i <= 24; i++) { const ee = 1 - Math.pow(1 - (Math.min(s * 1.25, 1) * i / 24), 2.2); pts.push(V(p0.x + dist * ee, p0.y + (m.runout && ee < 0.34 ? Math.sin(Math.PI * ee / 0.34) * 0.32 : 0), 0)); }
      } else { // 全挥杆：抛物线（视觉上放慢）
        const vx = 6.5, vy = 5.2, g = 9.8, tt = s * 1.25; pos = V(p0.x + vx * tt * 0.9, Math.max(p0.y + vy * tt - 0.5 * g * tt * tt, p0.y), 0.0 - 0.15 * tt);
        for (let i = 0; i <= 24; i++) { const q = tt * i / 24; pts.push(V(p0.x + vx * q * 0.9, Math.max(p0.y + vy * q - 0.5 * g * q * q, p0.y), -0.15 * q)); }
      }
      b.position.copy(pos); this.trail.geometry.setFromPoints(pts);
    }
    setT(t) { this.t = t; const s = this.solve(t); this.apply(s); this.updateBall(t); this.updateCaption(t); this.seek.value = Math.round(t * 1000); this.render(); }
    // 说明文字与阶段按钮
    updateChips() {
      const m = this.m, ch = this.el.querySelector(".g3d-chips"), seen = new Set(), labels = [];
      m.keys.forEach(k => { if (!seen.has(k.L)) { seen.add(k.L); labels.push(k); } }); ch.innerHTML = labels.map(k => `<button data-t="${k.t}">${k.L}</button>`).join("");
      ch.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; this.playing = false; this.setPlayBtn(); this.setT(parseFloat(b.dataset.t)); });
    }
    updateCaption(t) {
      const m = this.m; let best = m.keys[0], bd = 9; m.keys.forEach(k => { const d = Math.abs(k.t - t); if (d < bd) { bd = d; best = k; } });
      const ph = this.el.querySelector(".g3d-ph"), tx = this.el.querySelector(".g3d-tx"); ph.textContent = best.L + "　"; tx.textContent = (m.notes && m.notes[best.L]) || "";
      this.el.querySelectorAll(".g3d-chips button").forEach(b => b.classList.toggle("on", b.textContent === best.L));
    }
    setPlayBtn() { this.el.querySelector(".g3d-play").textContent = this.playing ? "⏸ 暂停" : "▶ 播放"; }
    setCam(c) {
      this.cam = c; this.yaw = 0; this.pitch = 0; const cams = { face: { p: V(0.15, 1.15, 3.6), l: V(0.2, 0.85, -0.5) }, dtl: { p: V(-3.9, 1.2, -0.6), l: V(0.2, 0.85, -0.45) }, top: { p: V(0.1, 4.6, -0.55), l: V(0.1, 0, -0.5) } };
      this.camSpec = cams[c]; this.camera.position.copy(this.camSpec.p); this.camera.up.set(c === "top" ? 1 : 0, c === "top" ? 0 : 1, 0); this.camera.lookAt(this.camSpec.l);
      if (c === "top") this.camera.up.set(0, 0, -1), this.camera.lookAt(this.camSpec.l);
      this.el.querySelectorAll(".g3d-cm button").forEach(b => b.classList.toggle("on", b.dataset.c === c)); if (this.seek) this.render();
    }
    orbit() { const sp = this.camSpec, c = sp.l, off = sp.p.clone().sub(c); const qy = new T.Quaternion().setFromAxisAngle(V(0, 1, 0), this.yaw), right = off.clone().cross(V(0, 1, 0)).normalize();
      const qp = new T.Quaternion().setFromAxisAngle(right, this.pitch); off.applyQuaternion(qy).applyQuaternion(qp); this.camera.position.copy(c.clone().add(off)); this.camera.lookAt(c); if (this.cam === "top") { this.camera.up.set(0, 0, -1); this.camera.lookAt(c); } }
    render() { this.orbit(); this.r.render(this.scene, this.camera); }
    bind() {
      const el = this.el; this.seek = el.querySelector(".g3d-seek");
      el.querySelector(".g3d-play").onclick = () => { this.playing = !this.playing; if (this.playing && this.t >= 1) this.t = 0; this.setPlayBtn(); };
      this.seek.oninput = () => { this.playing = false; this.setPlayBtn(); this.setT(this.seek.value / 1000); };
      el.querySelector(".g3d-sp").onclick = e => { const b = e.target.closest("button"); if (!b) return; this.speed = parseFloat(b.dataset.s); el.querySelectorAll(".g3d-sp button").forEach(x => x.classList.toggle("on", x === b)); };
      el.querySelector(".g3d-cm").onclick = e => { const b = e.target.closest("button"); if (b) this.setCam(b.dataset.c); };
      const ov = el.querySelector(".g3d-ov"); if (ov) ov.onclick = e => { const b = e.target.closest("button"); if (!b) return; this.overlays = !this.overlays; b.classList.toggle("on", this.overlays); this.setT(this.t); };
      const cv = this.r.domElement; cv.onpointerdown = e => { this.drag = { x: e.clientX, y: e.clientY, yaw: this.yaw, pitch: this.pitch }; cv.setPointerCapture(e.pointerId); cv.style.cursor = "grabbing"; };
      cv.onpointermove = e => { if (!this.drag) return; this.yaw = this.drag.yaw - (e.clientX - this.drag.x) * 0.006; this.pitch = Math.max(-0.7, Math.min(0.7, this.drag.pitch + (e.clientY - this.drag.y) * 0.004)); if (!this.playing) this.render(); };
      cv.onpointerup = () => { this.drag = null; cv.style.cursor = "grab"; };
      if (window.ResizeObserver) new ResizeObserver(() => { if (this.fixed) return; const w = this.cv.clientWidth; if (!w) return; const h = Math.round(w * 0.62); this.r.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.render(); }).observe(this.cv);
    }
    loop(now) {
      if (this.dead || !document.body.contains(this.el)) return; const dt = Math.min((now - this.last) / 1000, 0.1); this.last = now;
      if (this.playing) { if (this.t >= 1) { this.hold += dt; if (this.hold > 1.2) { this.hold = 0; this.t = 0; } } else this.t = Math.min(1, this.t + dt * this.speed / this.m.dur); this.setT(this.t); }
      requestAnimationFrame(this.loop);
    }
  }

  /* ---------- 精修版：更像真人 + 教学辅助线 + 实时数据 ---------- */
  Viewer.prototype.upgrade = function () {
    const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), sc = this.scene;
    const C = { shirt: 0xf5f7fa, trim: 0x1c3768, skin: 0xe4b995, hair: 0x15100d, shorts: 0x1f3359, sock: 0xffffff, shoe: 0xf2f2f2 };
    const mat = (c, r = 0.7) => new T.MeshStandardMaterial({ color: c, roughness: r });
    // 天空渐变 + 雾色
    const cv = document.createElement("canvas"); cv.width = 16; cv.height = 256; const g = cv.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#6fb1e6"); gr.addColorStop(0.62, "#cfe8fb"); gr.addColorStop(1, "#eaf5ff"); g.fillStyle = gr; g.fillRect(0, 0, 16, 256); sc.background = new T.CanvasTexture(cv); sc.fog = new T.Fog(0xdcecf8, 12, 30);
    // 更细腻的草地：噪点 + 割草条纹
    const gc = document.createElement("canvas"); gc.width = gc.height = 512; const x = gc.getContext("2d");
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? "#6cb872" : "#5fa966"; x.fillRect(0, i * 64, 512, 64); }
    const id = x.getImageData(0, 0, 512, 512), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 16; d[i] += n; d[i + 1] += n * 1.2; d[i + 2] += n * 0.6; } x.putImageData(id, 0, 0);
    const tex = new T.CanvasTexture(gc); tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(10, 10); tex.anisotropy = 4;
    sc.traverse(o => { if (o.isMesh && o.geometry.type === "PlaneGeometry" && o.geometry.parameters.width === 40) { o.material.map = tex; o.material.needsUpdate = true; } });
    // 远处树林（低多边形）
    const tg = new T.Group(), trunkM = mat(0x5b4331), leafM = [mat(0x3f8a4e), mat(0x4a9a58), mat(0x378247)]; let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const a = rnd() * Math.PI * 2, r = 9 + rnd() * 9, h = 2.2 + rnd() * 2.2, px = Math.cos(a) * r + 2, pz = Math.sin(a) * r - 1; if (Math.abs(pz + 0.5) < 2.2 && px > -1 && px < 8) continue;
      const t = new T.Group(); const tr = new T.Mesh(new T.CylinderGeometry(0.08, 0.12, h * 0.4, 6), trunkM); tr.position.y = h * 0.2; t.add(tr);
      for (let k = 0; k < 3; k++) { const f = new T.Mesh(new T.IcosahedronGeometry(h * (0.34 - k * 0.07), 1), leafM[(i + k) % 3]); f.position.y = h * (0.5 + k * 0.2); f.castShadow = true; t.add(f); }
      t.position.set(px, 0, pz); tg.add(t);
    }
    sc.add(tg);
    // —— 人物：衣着与比例
    const P = this.P; this.torso.visible = false;
    [P.thL, P.thR].forEach(l => { l.cyl.material.color.setHex(C.shorts); }); [P.shL, P.shR].forEach(l => { l.cyl.material.color.setHex(C.skin); });
    [P.uaL, P.uaR].forEach(l => { l.cyl.material.color.setHex(C.shirt); }); [P.faL, P.faR].forEach(l => { l.cyl.material.color.setHex(C.skin); });
    this.pelvis.material.color.setHex(C.shorts); this.head.material.color.setHex(C.skin); this.cap.material.color.setHex(0xffffff); this.visor.material.color.setHex(0xffffff);
    this.chest = this.ell(0.168, 0.2, 0.102, C.shirt); this.abd = this.ell(0.146, 0.17, 0.094, C.shirt); this.hem = this.ell(0.15, 0.05, 0.098, C.trim); this.hem.scale.set(0.152, 0.018, 0.1);
    this.collar = new T.Mesh(new T.TorusGeometry(0.066, 0.014, 8, 20), mat(C.trim, 0.6)); this.collar.castShadow = true; sc.add(this.collar);
    this.capL = new T.Mesh(new T.SphereGeometry(0.056, 14, 10), mat(C.shirt)); this.capR = this.capL.clone(); sc.add(this.capL, this.capR);
    this.hair = this.ell(0.1, 0.108, 0.106, C.hair); this.pony = [0, 1, 2, 3, 4].map(i => { const m = new T.Mesh(new T.SphereGeometry(0.04 - i * 0.0065, 12, 10), mat(C.hair, 0.5)); m.castShadow = true; sc.add(m); return m; });
    this.sockL = this.limb(0.047, C.sock); this.sockR = this.limb(0.047, C.sock);
    this.shoeL = this.ell(0.052, 0.04, 0.135, C.shoe); this.shoeR = this.ell(0.052, 0.04, 0.135, C.shoe); this.footL.visible = this.footR.visible = false;
    this.footBand = [this.ell(0.054, 0.012, 0.04, C.trim), this.ell(0.054, 0.012, 0.04, C.trim)];
    // —— 更真实的铁杆杆头（刃形挤出）
    if (this.m.club.kind === "iron" || this.m.club.kind === "wedge") {
      const sh = new T.Shape(); sh.moveTo(0, 0.004); sh.lineTo(0.092, 0); sh.quadraticCurveTo(0.104, 0.02, 0.094, 0.044); sh.lineTo(0.014, 0.052); sh.quadraticCurveTo(-0.004, 0.03, 0, 0.004);
      const ge = new T.ExtrudeGeometry(sh, { depth: 0.016, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 2 }); ge.translate(-0.05, -0.03, -0.008);
      this.chead.geometry.dispose(); this.chead.geometry = ge; this.chead.material = new T.MeshStandardMaterial({ color: 0xc4cbd2, metalness: 0.85, roughness: 0.28 });
      const hosel = new T.Mesh(new T.CylinderGeometry(0.0095, 0.0095, 0.05, 10), this.chead.material); hosel.position.set(-0.044, 0.05, 0); this.chead.add(hosel);
    }
    // —— 辅助线与挥杆平面
    this.ov = { spine: this.limb(0.009, 0xffc933), sh: this.limb(0.012, 0xff5a5a), hip: this.limb(0.012, 0x4aa8ff) };
    const phi = this.m.club.phi * Math.PI / 180, mv = V(0, Math.sin(phi), -Math.cos(phi)), b = this.ballPos.clone(), A = b.clone().add(V(-0.45, 0, 0)), B = b.clone().add(V(1.0, 0, 0)), Cc = B.clone().add(mv.clone().multiplyScalar(1.35)), Dd = A.clone().add(mv.clone().multiplyScalar(1.35));
    const pg = new T.BufferGeometry(); pg.setAttribute("position", new T.Float32BufferAttribute([A, B, Cc, A, Cc, Dd].flatMap(v => [v.x, v.y, v.z]), 3)); pg.computeVertexNormals();
    this.plane = new T.Mesh(pg, new T.MeshBasicMaterial({ color: 0xffa23e, transparent: true, opacity: 0.11, side: T.DoubleSide, depthWrite: false })); sc.add(this.plane);
    // —— 数据面板与图例
    this.hud = document.createElement("div"); this.hud.className = "g3d-hud"; this.cv.style.position = "relative"; this.cv.appendChild(this.hud);
    this.legend = document.createElement("div"); this.legend.className = "g3d-legend"; this.legend.innerHTML = '<i style="background:#ffc933"></i>脊柱 <i style="background:#ff5a5a"></i>肩线 <i style="background:#4aa8ff"></i>髋线 <i style="background:#ffa23e"></i>挥杆平面'; this.cv.appendChild(this.legend);
    this.sun = sc.children.find(o => o.isDirectionalLight); if (this.sun) { this.sun.shadow.mapSize.set(2048, 2048); this.sun.intensity = 1.0; }
  };
  Viewer.prototype.polishUpdate = function (s) {
    const T = THREE, V = (x, y, z) => new T.Vector3(x, y, z), up = s.spineUp, f = s.f;
    this.chest.position.copy(s.N.clone().sub(up.clone().multiplyScalar(0.125))); this.chest.quaternion.copy(s.qChest);
    this.abd.position.copy(s.P.clone().add(up.clone().multiplyScalar(0.16))); this.abd.quaternion.copy(s.qChest.clone().slerp(s.qHip, 0.55));
    this.hem.position.copy(s.P.clone().add(up.clone().multiplyScalar(0.06))); this.hem.quaternion.copy(s.qHip);
    this.collar.position.copy(s.N.clone().add(up.clone().multiplyScalar(0.035))); this.collar.quaternion.copy(s.qChest.clone().multiply(new T.Quaternion().setFromAxisAngle(V(1, 0, 0), Math.PI / 2)));
    this.capL.position.copy(s.Lsh); this.capR.position.copy(s.Rsh);
    const hc = this.head.position, hq = this._hq || new T.Quaternion(); this.hair.position.copy(hc.clone().add(V(0, 0.012, -0.018).applyQuaternion(hq))); this.hair.quaternion.copy(hq);
    this.pony.forEach((m, i) => m.position.copy(hc.clone().add(V(0, 0.005 - 0.027 * i, -0.098 - 0.015 * i - 0.006 * i * i).applyQuaternion(hq))));
    const sock = (limb, knee, ank) => this.setLimb(limb, ank, ank.clone().lerp(knee, 0.3)); sock(this.sockL, s.lg.L.mid, s.lg.L.end); sock(this.sockR, s.lg.R.mid, s.lg.R.end);
    [[this.shoeL, this.footL, 0], [this.shoeR, this.footR, 1]].forEach(([sh, ft, k]) => { sh.position.copy(ft.position); sh.rotation.copy(ft.rotation); sh.position.y += 0.005; this.footBand[k].position.copy(sh.position).add(V(0, 0.03, 0.02)); this.footBand[k].rotation.copy(sh.rotation); });
    // 辅助线
    const on = this.overlays; ["spine", "sh", "hip"].forEach(k => { this.ov[k].visible = on; this.ov[k].cyl.visible = on; this.ov[k].s1.visible = on; this.ov[k].s2.visible = on; }); this.plane.visible = on; if (this.legend) this.legend.style.display = on ? "" : "none";
    if (on) {
      this.setLimb(this.ov.spine, s.P.clone().sub(up.clone().multiplyScalar(0.12)), s.N.clone().add(up.clone().multiplyScalar(0.42)));
      const dx = s.cx.clone(); this.setLimb(this.ov.sh, s.Rsh.clone().sub(dx.clone().multiplyScalar(0.36)), s.Lsh.clone().add(dx.clone().multiplyScalar(0.36)));
      this.setLimb(this.ov.hip, s.Rhip.clone().sub(s.hx.clone().multiplyScalar(0.38)), s.Lhip.clone().add(s.hx.clone().multiplyScalar(0.38)));
    }
    // 数据面板（重心为示意值：由骨盆相对站位的平移估算）
    const wl = f.wt != null ? Math.round(f.wt * 100) : Math.max(5, Math.min(97, Math.round((0.5 + 2 * f.sh) * 100))), dir = v => (v >= 0 ? "背离目标" : "朝向目标");
    this.hud.innerHTML = `<b>肩转</b> ${Math.abs(Math.round(f.shT))}° <small>${dir(f.shT)}</small>　<b>髋转</b> ${Math.abs(Math.round(f.hipT))}° <small>${dir(f.hipT)}</small>　<b>前倾</b> ${Math.round(f.tilt)}°<br><b>重心</b> 后脚 ${100 - wl}% ｜ 前脚 ${wl}% <span class="g3d-wb"><i style="width:${wl}%"></i></span>${this.m.tempoNote ? `<br><b>时间</b> ${(s.t * this.m.dur).toFixed(2)} 秒 <small>${this.m.tempoNote}</small>` : ""}`;
  };

  window.GolfViewer = { mount(el, key, opts) { return new Viewer(el, key, opts); }, MOTIONS, _Viewer: Viewer };
})();
