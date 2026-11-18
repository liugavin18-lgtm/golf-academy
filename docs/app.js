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
  $("#nav").innerHTML = user ? `<a href="#/">课程</a><a href="#/videos">视频平台</a>
    <a href="#/password">${esc(user.user_metadata?.display || "账号")}</a><button class="link" id="out">退出</button>` : "";
  if (user) $("#out").onclick = async () => { await sb.auth.signOut(); };
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
  <div class="card"><h3>📺 精选视频（YouTube）</h3><div class="vgrid">${l.videos.map(v => `<a class="vcard" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt=""><span>${esc(v.t)}</span></a>`).join("")}</div>
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
function route() {
  if (!user) return authView();
  const h = location.hash.replace(/^#\/?/, "");
  if (h.startsWith("lesson/")) lesson(h.slice(7)); else if (h === "videos") videos(); else if (h === "password") password(); else home();
}
sb.auth.onAuthStateChange(async (_e, s) => {
  gotAuth = true;
  user = s?.user || null; if (user) await loadProgress(); nav(); route();
});
window.addEventListener("hashchange", route);
