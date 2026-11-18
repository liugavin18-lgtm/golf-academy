"""把 content.py + videos.py 生成静态站 docs/（GitHub Pages 用）。运行：python build.py"""
import json, os
from content import LEVELS, PLATFORMS, ANIM, vlinks
from videos import V
levels = []
for lv in LEVELS:
    levels.append(dict(id=lv["id"], name=lv["name"], desc=lv["desc"], lessons=[dict(
        id=l["id"], title=l["title"], summary=l["summary"], body=l["body"], anim=l["anim"], minutes=l["minutes"],
        videos=[dict(id=i, t=t) for i, t in V.get(l["id"], [])],
        links=[dict(n=n, u=u, d=d) for n, u, d in (vlinks(l["kw"])[:1] + vlinks(l["kw"])[3:4])]) for l in lv["lessons"]]))
os.makedirs("docs", exist_ok=True)
open("docs/data.js", "w").write("window.LEVELS=" + json.dumps(levels, ensure_ascii=False) +
    ";\nwindow.PLATFORMS=" + json.dumps([dict(n=n, d=d) for n, _, d in PLATFORMS], ensure_ascii=False) + ";")
print("lessons:", sum(len(l["lessons"]) for l in levels))
