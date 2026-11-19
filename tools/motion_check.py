#!/usr/bin/env python3
"""3D 动作校准工具（无需肉眼）：用无头 Chrome 加载 docs/golf3d.js，量化检查一个动作是否符合标准。
用法：
  python3 tools/motion_check.py metrics swing        # 节奏、发力顺序、击球接触、头位置、重心、各位置的“杆身/手臂仰角”
  python3 tools/motion_check.py frames swing face    # 把每个关键位置渲染成图并拼成总览图 → tools/out/<动作>_<视角>.jpg（视角 face|dtl|top）
动作名见 docs/golf3d.js 的 MOTIONS：swing / driver / putt / chip / pitch。
依赖：macOS 的 Google Chrome、Pillow（仅 frames）。"""
import json, re, subprocess, sys, tempfile, os
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent; DOCS = ROOT / "docs"
CH = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
GL = ["--headless=new", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--hide-scrollbars"]
HEAD = f'<!doctype html><meta charset=utf-8><pre id=o></pre><div id=h style="width:700px"></div><script src="file://{DOCS}/three.min.js"></script><script src="file://{DOCS}/golf3d.js"></script>'

def page(body):
    f = Path(tempfile.mkdtemp()) / "p.html"; f.write_text(HEAD + "<script>" + body + "</script>"); return f

METRICS = """
const key=%KEY%;const v=GolfViewer.mount(document.getElementById('h'),key,{polish:false});v.playing=false;
const m=v.m,D=m.dur,ti=m.impactT,N=1600,R=180/Math.PI,ser=[];
for(let i=0;i<=N;i++){const t=i/N,s=v.solve(t),f=s.f;ser.push({t,hip:f.hipT,sh:f.shT,a:f.a,head:s.head.clone(),hc:s.N.clone().add(s.spineUp.clone().multiplyScalar(0.21)),Lsh:s.Lsh.distanceTo(s.hand),wt:f.wt});}
const rate=k=>ser.map((r,i)=>i?{t:r.t,v:Math.abs(r[k]-ser[i-1][k])/((r.t-ser[i-1].t)*D)}:{t:0,v:0});
const pk=(arr,lo,hi)=>arr.filter(r=>r.t>=lo&&r.t<=hi).reduce((a,b)=>b.v>a.v?b:a,{v:0,t:0});
// 杆顶（后摆终点）：优先用 topT，否则取击球前 |α| 最大的时刻
let tTop=m.topT; if(!tTop){let b=0;for(const r of ser){if(r.t<ti&&Math.abs(r.a)>Math.abs(ser[b].a))b=ser.indexOf(r);}tTop=ser[b].t;}
const hs=ser.map((r,i)=>i?{t:r.t,v:r.head.distanceTo(ser[i-1].head)/((r.t-ser[i-1].t)*D)}:{t:0,v:0});
const lo=tTop,hi=Math.min(1,ti+0.12),ph=pk(rate('hip'),lo,hi),pt=pk(rate('sh'),lo,hi),pa=pk(rate('a'),lo,hi);
const at=t=>ser[Math.round(t*N)];const near=hs.filter(r=>Math.abs(r.t-ti)<0.04).map(r=>r.v),pkv=Math.max(...hs.filter(r=>Math.abs(r.t-ti)<0.12).map(r=>r.v));
const defs=[];for(const k of m.keys){if(defs.length&&defs[defs.length-1][0]===k.L)continue;const s=v.solve(k.t),arm=s.hand.clone().sub(s.Lsh);defs.push([k.L,(k.t*D).toFixed(2),(Math.asin(arm.y/arm.length())*R).toFixed(0),(Math.asin(s.d.y)*R).toFixed(0),s.d.x.toFixed(2),(k.wt!=null?k.wt:'')]);}
document.getElementById('o').textContent=JSON.stringify({name:m.name,dur:D,topS:(tTop*D).toFixed(2),impactS:(ti*D).toFixed(2),downS:((ti-tTop)*D).toFixed(2),ratio:(tTop/(ti-tTop)).toFixed(2),
 peaks:{pelvis:[ph.v.toFixed(0),(ph.t*D).toFixed(2)],thorax:[pt.v.toFixed(0),(pt.t*D).toFixed(2)],club:[pa.v.toFixed(0),(pa.t*D).toFixed(2)]},
 headSpeedImpact:hs[Math.round(ti*N)].v.toFixed(1),minNearImpact:Math.min(...near).toFixed(1),peakNearImpact:pkv.toFixed(1),
 miss:v.solve(ti).head.distanceTo(v.ballPos).toFixed(4),reach:Math.max(...ser.map(r=>r.Lsh)).toFixed(3),
 headX:[at(0).hc.x,at(tTop).hc.x,at(ti).hc.x].map(x=>x.toFixed(3)),headY:[at(0).hc.y,at(ti).hc.y,Math.max(...ser.filter(r=>r.t<=ti).map(r=>r.hc.y))].map(x=>x.toFixed(3)),
 topHipShoulder:[at(tTop).hip.toFixed(0),at(tTop).sh.toFixed(0)],impHipShoulder:[at(ti).hip.toFixed(0),at(ti).sh.toFixed(0)],defs});
"""

def metrics(key):
    f = page(METRICS.replace("%KEY%", json.dumps(key)))
    out = subprocess.run([CH, *GL, "--virtual-time-budget=9000", "--dump-dom", f"file://{f}"], capture_output=True, text=True).stdout
    m = re.search(r'<pre id="o">(.*?)</pre>', out, re.S)
    if not m: sys.exit("没有取到结果（Chrome 未运行或脚本报错）")
    d = json.loads(m.group(1).replace("&quot;", '"'))
    print(f"== {d['name']} ==  总时长 {d['dur']} s")
    print(f"节奏：后摆 {d['topS']} s，下杆 {d['downS']} s，比值 {d['ratio']} : 1，击球在 {d['impactS']} s")
    p = d["peaks"]; print(f"发力峰值（°/s @秒）：骨盆 {p['pelvis']} → 胸廓 {p['thorax']} → 球杆角 {p['club']}")
    print(f"击球：杆头离球 {d['miss']} m；击球时杆头速度 {d['headSpeedImpact']} m/s；击球前后最低/峰值 {d['minNearImpact']}/{d['peakNearImpact']}")
    print(f"杆顶 髋/肩转角 {d['topHipShoulder']}；击球 髋/肩 {d['impHipShoulder']}；肩到手最大距离 {d['reach']} m")
    print(f"头 x（准备/杆顶/击球，球在 0）{d['headX']}；头高（准备/击球/击球前最高）{d['headY']}")
    print("位置                 秒    左臂仰角  杆身仰角  杆头x   前脚重心")
    for r in d["defs"]: print(f"{r[0]:<18}{r[1]:>6}  {r[2]:>6}°  {r[3]:>6}°  {r[4]:>6}   {r[5]}")

def frames(key, cam):
    from PIL import Image, ImageDraw
    out = ROOT / "tools" / "out"; out.mkdir(exist_ok=True, parents=True)
    f = page(f"const v=GolfViewer.mount(document.getElementById('h'),{json.dumps(key)},{{polish:false}});document.getElementById('o').textContent=JSON.stringify(v.m.keys.map(k=>[k.L,k.t]));")
    o = subprocess.run([CH, *GL, "--virtual-time-budget=5000", "--dump-dom", f"file://{f}"], capture_output=True, text=True).stdout
    keys = json.loads(re.search(r'<pre id="o">(.*?)</pre>', o, re.S).group(1).replace("&quot;", '"')); seen, items = set(), []
    for L, t in keys:
        if L not in seen: seen.add(L); items.append((L, t))
    ims = []
    for L, t in items:
        p = page(f"const v=GolfViewer.mount(document.getElementById('h'),{json.dumps(key)},{{polish:false}});v.playing=false;v.setCam({json.dumps(cam)});v.setT({t});")
        png = out / f"_{key}_{cam}_{len(ims)}.png"
        subprocess.run([CH, *GL, "--window-size=720,480", "--virtual-time-budget=3000", f"--screenshot={png}", f"file://{p}"], capture_output=True)
        im = Image.open(png).convert("RGB").crop((0, 0, 700, 440)).resize((350, 220)); d = ImageDraw.Draw(im); d.rectangle([0, 0, 120, 16], fill="black"); d.text((4, 3), L, fill="white"); ims.append(im); png.unlink()
    cols = 5; rows = (len(ims) + cols - 1) // cols; S = Image.new("RGB", (350 * cols, 220 * rows), "white")
    for i, im in enumerate(ims): S.paste(im, ((i % cols) * 350, (i // cols) * 220))
    dest = out / f"{key}_{cam}.jpg"; S.save(dest, quality=88); print("已生成", dest)

if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "metrics": metrics(sys.argv[2])
    elif len(sys.argv) >= 4 and sys.argv[1] == "frames": frames(sys.argv[2], sys.argv[3])
    else: print(__doc__)
