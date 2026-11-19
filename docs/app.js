const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LESSONS = LEVELS.flatMap(l => l.lessons);
const fail = t => { $("#app").innerHTML = `<div class="card narrow"><h1>暂时连接不上</h1><p>${t}</p><p class="muted">可以换 Wi-Fi/移动网络再试，或稍后刷新。</p></div>`; };
if (typeof supabase === "undefined") { fail("页面脚本没有加载成功。"); throw new Error("supabase-js missing"); }
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let gotAuth = false;
setTimeout(() => { if (!gotAuth) fail("无法连接到登录服务器（Supabase）。"); }, 10000);
let user = null, done = new Set(), mode = "login";
const mail = u => u.toLowerCase() + "@golf-academy.app";   // 用户名映射成内部邮箱，不会发邮件

async function loadProgress() {
  const { data } = await sb.from("progress").select("lesson");
  done = new Set((data || []).map(r => r.lesson));
}
function nav() {
  $("#nav").innerHTML = user ? `<form id="sf" class="sf" autocomplete="off"><input id="sq" placeholder="搜索名词或内容：差点、OB、slice…" aria-label="搜索"><div id="sug" class="sug hide"></div></form><a href="#/">课程</a><a href="#/glossary">术语表</a><a href="#/tools/score">记分计算器</a><a href="#/videos">视频平台</a>
    <a href="#/password">${esc(user.user_metadata?.display || "账号")}</a><button class="link" id="out">退出</button>` : "";
  if (user) { $("#out").onclick = async () => { await sb.auth.signOut(); }; initSearch(); }
}
function authView() {
  const reg = mode === "register";
  $("#app").innerHTML = `<form class="card narrow" id="f"><h1>${reg ? "注册" : "登录"}</h1>
    <label>用户名（字母、数字、下划线，2–20 位）<input name="u" required pattern="[A-Za-z0-9_]{2,20}" autocomplete="username"></label>
    ${reg ? '<label>昵称（可选）<input name="d" maxlength="20"></label>' : ""}
    <label>密码${reg ? "（至少 8 位）" : ""}<input type="password" name="p" required minlength="${reg ? 8 : 1}" autocomplete="${reg ? "new-password" : "current-password"}"></label>
    <div id="msg" class="flash hide"></div><button class="btn">${reg ? "注册并进入" : "登录"}</button>
    <p class="muted">${reg ? "已有账号？" : "没有账号？"}<a href="#" id="sw">${reg ? "去登录" : "立即注册"}</a></p></form>`;
  $("#sw").onclick = e => { e.preventDefault(); mode = reg ? "login" : "register"; authView(); };
  $("#f").onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target), m = $("#msg");
    const show = t => { m.textContent = t; m.classList.remove("hide"); };
    const email = mail(f.get("u")), password = f.get("p");
    const r = reg ? await sb.auth.signUp({ email, password, options: { data: { display: f.get("d") || f.get("u") } } })
                  : await sb.auth.signInWithPassword({ email, password });
    if (r.error) show(/already|registered/i.test(r.error.message) ? "用户名已被占用" : /invalid/i.test(r.error.message) ? "用户名或密码错误" : r.error.message);
    else if (reg && !r.data.session) show("注册成功，但服务端要求邮件确认。请联系站长关闭 Confirm email。");
  };
}
function home() {
  const total = LESSONS.length;
  $("#app").innerHTML = `<h1>从零开始学高尔夫</h1><div class="bar"><span style="width:${Math.round(done.size / total * 100)}%"></span></div>
  <p class="muted">已完成 ${done.size} / ${total} 节</p>` + LEVELS.map(lv => `<section><h2>${lv.name}</h2><p class="muted">${lv.desc}</p><div class="grid">` +
    lv.lessons.map(l => `<a class="card lesson" href="#/lesson/${l.id}"><b>${done.has(l.id) ? "✅ " : ""}${esc(l.title)}</b><span>${esc(l.summary)}</span><small>约 ${l.minutes} 分钟</small></a>`).join("") + `</div></section>`).join("");
}
function lesson(id) {
  const i = LESSONS.findIndex(l => l.id === id); if (i < 0) return location.hash = "#/";
  const l = LESSONS[i], p = LESSONS[i - 1], n = LESSONS[i + 1], d = done.has(id);
  $("#app").innerHTML = `<p><a href="#/">← 返回课程</a></p><h1>${esc(l.title)}</h1><p class="muted">${esc(l.summary)}</p>
  ${l.anim ? `<div class="card">${l.anim}</div>` : ""}<div class="card prose">${l.body}</div>
  ${l.videos.length ? "" : ""}<div class="card"><h3>📺 精选视频（YouTube）</h3>${l.videos.length ? "" : '<p class="muted">本节暂无精选视频，可用下面的平台搜索。</p>'}<div class="vgrid">${l.videos.map(v => `<a class="vcard" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt=""><span>${esc(v.t)}</span></a>`).join("")}</div>
  <p class="muted">YouTube 在中国大陆需自行解决访问问题；视频由搜索挑选，非本站原创。更多中文教学：</p>
  <ul class="links">${l.links.map(k => `<li><a href="${k.u}" target="_blank" rel="noopener noreferrer">${k.n}搜索</a> <span class="muted">${k.d}</span></li>`).join("")}</ul></div>
  <button class="btn ${d ? "gray" : ""}" id="mk">${d ? "已完成 ✓（点击取消）" : "标记为已学完"}</button>
  <p class="pager">${p ? `<a href="#/lesson/${p.id}">← ${esc(p.title)}</a>` : ""}${n ? `<a style="float:right" href="#/lesson/${n.id}">${esc(n.title)} →</a>` : ""}</p>`;
  $("#mk").onclick = async () => {
    if (d) await sb.from("progress").delete().eq("lesson", id); else await sb.from("progress").insert({ lesson: id });
    await loadProgress(); lesson(id);
  };
}
function videos() {
  $("#app").innerHTML = `<h1>学习视频平台</h1><div class="card"><ul class="links">${PLATFORMS.map(p => `<li><b>${p.n}</b> <span class="muted">${p.d}</span></li>`).join("")}</ul></div>
  <p class="muted">每节课页面里有精选视频与搜索链接。</p>` + LEVELS.map(lv => `<h2>${lv.name}</h2><ul>${lv.lessons.map(l => `<li><a href="#/lesson/${l.id}">${esc(l.title)}</a></li>`).join("")}</ul>`).join("");
}
function password() {
  $("#app").innerHTML = `<form class="card narrow" id="f"><h1>修改密码</h1><label>新密码（至少 8 位）<input type="password" name="p" minlength="8" required autocomplete="new-password"></label>
  <div id="msg" class="flash hide"></div><button class="btn">保存</button></form>`;
  $("#f").onsubmit = async e => { e.preventDefault(); const { error } = await sb.auth.updateUser({ password: new FormData(e.target).get("p") });
    const m = $("#msg"); m.textContent = error ? error.message : "密码已更新"; m.classList.remove("hide"); };
}

function calc() {
  const sample = { par: [4,4,3,5,4,4,3,4,5, 4,3,4,5,4,4,3,4,5], si: [7,1,15,3,11,5,17,9,13, 8,16,2,4,12,6,18,10,14] };
  let st; try { st = JSON.parse(localStorage.getItem("golfcalc")) } catch (e) {}
  st = st || { idx: "", slope: 113, cr: "", hcp: "", par: sample.par, si: sample.si, g: Array(18).fill("") };
  const holes = [...Array(18).keys()];
  $("#app").innerHTML = `<h1>记分计算器</h1><p class="muted">输入差点和每洞数据，自动算出总杆、净杆、积分制分数。数据只保存在你的浏览器里。</p>
  <div class="card calc"><h3>① 球场差点（WHS）</h3><div class="row">
   <input id="idx" placeholder="差点指数 Index" value="${st.idx}"><input id="slope" placeholder="Slope（默认113）" value="${st.slope}">
   <input id="cr" placeholder="Course Rating" value="${st.cr}"><input id="par" placeholder="全场 Par" value="${st.par.reduce((a, b) => a + b, 0)}" readonly></div>
   <p>球场差点：<span class="hl" id="ch">—</span>　（= Index × Slope÷113 + (CR − Par)，四舍五入）</p>
   <div class="row"><label>本场使用的让杆数（可手动改，如 95% 或比洞赛差）：<input id="hcp" style="width:90px" value="${st.hcp}"></label></div></div>
  <div class="card calc" style="overflow:auto"><h3>② 逐洞记分</h3><table><tr><th>洞</th><th>Par</th><th>SI</th><th>让杆</th><th>杆数</th><th>净杆</th><th>积分</th></tr>
  ${holes.map(i => `<tr><td>${i + 1}</td><td><input class="p" data-i="${i}" value="${st.par[i]}"></td><td><input class="s" data-i="${i}" value="${st.si[i]}"></td>
   <td id="r${i}">0</td><td><input class="g" data-i="${i}" value="${st.g[i]}"></td><td id="n${i}">—</td><td id="b${i}">—</td></tr>`).join("")}</table>
   <p>总杆 <span class="hl" id="tg">0</span>　净杆 <span class="hl" id="tn">0</span>　相对标准杆（净）<span class="hl" id="tv">0</span>　积分制 <span class="hl" id="tb">0</span> 分</p>
   <p class="muted">积分：净 Par=2，Birdie=3，Eagle=4，Albatross=5，Bogey=1，双柏忌及更差=0。让杆按 SI 从小到大分配，超过 18 则第二轮继续。</p></div>
  <button class="btn gray" id="rst">清空本场杆数</button>`;
  const num = id => parseFloat($(id).value);
  const recalc = () => {
    const idx = num("#idx"), slope = num("#slope") || 113, cr = num("#cr");
    const par = [...document.querySelectorAll(".p")].map(e => +e.value || 0), si = [...document.querySelectorAll(".s")].map(e => +e.value || 0);
    const tp = par.reduce((a, b) => a + b, 0); $("#par").value = tp;
    let ch = "—"; if (!isNaN(idx) && !isNaN(cr)) { ch = Math.round(idx * slope / 113 + (cr - tp)); }
    $("#ch").textContent = ch;
    let hcp = $("#hcp").value === "" ? (ch === "—" ? 0 : ch) : Math.round(num("#hcp")) || 0;
    const g = [...document.querySelectorAll(".g")].map(e => e.value === "" ? null : +e.value);
    let tg = 0, tn = 0, tb = 0, tv = 0;
    holes.forEach(i => {
      const base = Math.floor(hcp / 18), extra = hcp % 18, r = Math.max(0, base + (si[i] >= 1 && si[i] <= extra ? 1 : 0));
      $("#r" + i).textContent = r;
      if (g[i] == null) { $("#n" + i).textContent = "—"; $("#b" + i).textContent = "—"; return; }
      const n = g[i] - r, d = n - par[i], b = Math.max(0, 2 - d);
      tg += g[i]; tn += n; tv += d; tb += b; $("#n" + i).textContent = n; $("#b" + i).textContent = b;
    });
    $("#tg").textContent = tg; $("#tn").textContent = tn; $("#tv").textContent = (tv > 0 ? "+" : "") + tv; $("#tb").textContent = tb;
    try { localStorage.setItem("golfcalc", JSON.stringify({ idx: $("#idx").value, slope: $("#slope").value, cr: $("#cr").value, hcp: $("#hcp").value, par, si, g: g.map(x => x ?? "") })); } catch (e) {}
  };
  document.querySelectorAll(".calc input").forEach(e => e.addEventListener("input", recalc));
  $("#rst").onclick = () => { document.querySelectorAll(".g").forEach(e => e.value = ""); recalc(); };
  recalc();
}


/* ---------- 搜索与术语表 ---------- */
const strip = h => h.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const LTEXT = LESSONS.map(l => { const t = strip(l.title + " " + l.summary + " " + l.body); return { l, t, tl: t.toLowerCase() }; });
const lessonById = id => LESSONS.find(l => l.id === id);
function searchGlossary(q) {
  const ws = q.toLowerCase().split(/\s+/).filter(Boolean); if (!ws.length) return [];
  const full = q.toLowerCase().trim();
  return GLOSSARY.map(g => {
    const hay = (g.cn + " " + g.en + " " + g.al + " " + g.d).toLowerCase();
    if (!ws.every(w => hay.includes(w))) return null;
    const cn = g.cn.toLowerCase(), en = g.en.toLowerCase(), al = g.al.toLowerCase();
    const s = (cn === full || en === full) ? 100 : (cn.includes(full) || en.includes(full)) ? 60 : al.includes(full) ? 40 : ws.some(w => cn.includes(w) || en.includes(w)) ? 30 : 10;
    return { g, s };
  }).filter(Boolean).sort((a, b) => b.s - a.s).map(x => x.g);
}
function searchLessons(q) {
  const ws = q.toLowerCase().split(/\s+/).filter(Boolean); if (!ws.length) return [];
  return LTEXT.map(x => {
    if (!ws.every(w => x.tl.includes(w))) return null;
    const title = x.l.title.toLowerCase(); let s = 0;
    ws.forEach(w => { if (title.includes(w)) s += 50; if (x.l.summary.toLowerCase().includes(w)) s += 20; s += Math.min(10, x.tl.split(w).length - 1); });
    const i = x.tl.indexOf(ws[0]);
    const snip = x.t.slice(Math.max(0, i - 30), i + 90);
    return { l: x.l, s, snip: (i > 30 ? "…" : "") + snip + "…" };
  }).filter(Boolean).sort((a, b) => b.s - a.s);
}
function mark(text, q) {
  let h = esc(text);
  q.split(/\s+/).filter(Boolean).forEach(w => { try { h = h.replace(new RegExp("(" + esc(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi"), "<mark>$1</mark>"); } catch (e) {} });
  return h;
}
function initSearch() {
  const inp = $("#sq"), sug = $("#sug"), form = $("#sf"); if (!inp) return;
  const hideSug = () => sug.classList.add("hide");
  inp.addEventListener("input", () => {
    const q = inp.value.trim(); if (!q) return hideSug();
    const r = searchGlossary(q).slice(0, 6);
    sug.innerHTML = r.map(g => `<a href="#/search/${encodeURIComponent(g.cn)}"><b>${esc(g.cn)}</b> <span class="muted">${esc(g.en)}</span><br><span class="muted">${esc(g.d.slice(0, 40))}…</span></a>`).join("") +
      `<a href="#/search/${encodeURIComponent(q)}" class="all">搜索“${esc(q)}”的全部结果 →</a>`;
    sug.classList.remove("hide");
  });
  sug.addEventListener("click", () => { hideSug(); });
  document.addEventListener("click", e => { if (!form.contains(e.target)) hideSug(); });
  form.onsubmit = e => { e.preventDefault(); const q = inp.value.trim(); hideSug(); if (q) location.hash = "#/search/" + encodeURIComponent(q); };
}
function glossCard(g, q) {
  const ls = lessonById(g.l);
  return `<div class="card gl"><b>${q ? mark(g.cn, q) : esc(g.cn)}</b> <span class="tag">${q ? mark(g.en, q) : esc(g.en)}</span>
    <p>${q ? mark(g.d, q) : esc(g.d)}</p>${ls ? `<a href="#/lesson/${ls.id}">相关课程：${esc(ls.title)} →</a>` : ""}</div>`;
}
function searchPage(q) {
  const inp = $("#sq"); if (inp && document.activeElement !== inp) inp.value = q;
  const g = searchGlossary(q), l = searchLessons(q);
  $("#app").innerHTML = `<h1>搜索：${esc(q)}</h1>
  <h2>名词解释 <span class="tag">${g.length}</span></h2>${g.length ? g.map(x => glossCard(x, q)).join("") : '<p class="muted">没有匹配的名词。</p>'}
  <h2>课程内容 <span class="tag">${l.length}</span></h2>${l.length ? l.slice(0, 20).map(x => `<a class="card lesson" href="#/lesson/${x.l.id}"><b>${mark(x.l.title, q)}</b><span>${mark(x.snip, q)}</span></a>`).join("") : '<p class="muted">没有匹配的课程内容。</p>'}
  ${!g.length && !l.length ? '<div class="card"><p>没找到“' + esc(q) + '”。可以换个说法（中文或英文都行），或者看看 <a href="#/glossary">完整术语表</a>。</p></div>' : ""}`;
}
function glossaryPage() {
  $("#app").innerHTML = `<h1>术语表</h1><p class="muted">共 ${GLOSSARY.length} 个名词。上方搜索栏可以直接查。</p>
  <input id="gf" placeholder="在术语表里筛选…" style="margin:8px 0 12px"><div id="gl">${GLOSSARY.map(g => glossCard(g)).join("")}</div>`;
  $("#gf").oninput = e => { const q = e.target.value.trim(); $("#gl").innerHTML = (q ? searchGlossary(q) : GLOSSARY).map(g => glossCard(g, q)).join(""); };
}

function route() {
  if (!user) return authView();
  const h = location.hash.replace(/^#\/?/, "");
  if (h.startsWith("lesson/")) lesson(h.slice(7)); else if (h === "videos") videos(); else if (h === "tools/score") calc(); else if (h.startsWith("search/")) searchPage(decodeURIComponent(h.slice(7))); else if (h === "glossary") glossaryPage(); else if (h === "password") password(); else home();
}
sb.auth.onAuthStateChange((_e, s) => {
  gotAuth = true;
  user = s?.user || null;
  // 不能在回调里直接 await 其他 Supabase 请求（会互相等待卡死），所以放到下一个事件循环
  setTimeout(async () => {
    try { if (user) await loadProgress(); } catch (e) {}
    nav(); route();
  }, 0);
});
window.addEventListener("hashchange", route);
