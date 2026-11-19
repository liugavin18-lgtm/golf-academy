"""把 content.py + videos.py 生成静态站 docs/（GitHub Pages 用）。运行：python build.py"""
import json, os
from content import PLATFORMS, ANIM, vlinks
from curriculum import LEVELS
from glossary import G
from faq import F
from animations import BY_LESSON
A3D = {'swing-basic': 'swing', 'irons': 'swing', 'tempo': 'swing', 'driver': 'driver', 'putting': 'putt', 'chipping': 'chip', 'pitching': 'pitch', 'short-game-adv': 'pitch'}
from narration import N
from videos import V
levels = []
for lv in LEVELS:
    levels.append(dict(id=lv["id"], name=lv["name"], desc=lv["desc"], lessons=[dict(
        id=l["id"], title=l["title"], summary=l["summary"], body=l["body"], anim=BY_LESSON.get(l["id"], l["anim"]), a3d=A3D.get(l["id"], ""),
        audio=("audio/%s.m4a" % l["id"]) if os.path.exists("docs/audio/%s.m4a" % l["id"]) else "", script=N.get(l["id"], ""), minutes=l["minutes"],
        videos=[dict(id=i, t=t) for i, t in V.get(l["id"], [])],
        links=[dict(n=n, u=u, d=d) for n, u, d in (vlinks(l["kw"])[:1] + vlinks(l["kw"])[3:4])]) for l in lv["lessons"]]))
os.makedirs("docs", exist_ok=True)
open("docs/data.js", "w").write("window.LEVELS=" + json.dumps(levels, ensure_ascii=False) +
    ";\nwindow.GLOSSARY=" + json.dumps([dict(cn=a, en=e, d=d, al=al, l=l) for a, e, d, al, l in G], ensure_ascii=False) + ";\nwindow.FAQ=" + json.dumps([dict(c=c, q=q, a=a, k=k, l=l) for c, q, a, k, l in F], ensure_ascii=False) + ";\nwindow.PLATFORMS=" + json.dumps([dict(n=n, d=d) for n, _, d in PLATFORMS], ensure_ascii=False) + ";")
print("lessons:", sum(len(l["lessons"]) for l in levels))

# 给 index.html 的资源加版本号，避免浏览器缓存旧脚本
import re, time
_p = "docs/index.html"; _s = open(_p).read(); _v = time.strftime("%Y%m%d%H%M%S")
_s = re.sub(r'<script src="(config|data|app)\.js[^"]*">', lambda m: f'<script src="{m.group(1)}.js?v={_v}">', _s)
_s = re.sub(r'<link rel="stylesheet" href="style\.css[^"]*">', f'<link rel="stylesheet" href="style.css?v={_v}">', _s)
open(_p, "w").write(_s)
