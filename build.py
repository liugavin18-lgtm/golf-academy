"""把 content.py + videos.py 生成静态站 docs/（GitHub Pages 用）。运行：python build.py"""
import json, os
from content import PLATFORMS, ANIM, vlinks
from curriculum import LEVELS
from glossary import G
from faq import F
from animations import BY_LESSON
COACH_MOTION = {'swing-basic': 'swing', 'irons': 'swing', 'tempo': 'swing', 'driver': 'swing', 'putting': 'putt', 'chipping': 'chip', 'pitching': 'pitch', 'short-game-adv': 'pitch'}

def coach_for(lid):
    m = COACH_MOTION.get(lid)
    if not m: return None
    views = {}
    for vk in ('face', 'dtl'):
        fs = sorted(f for f in os.listdir('docs/coach') if f.startswith(m + '_') and f.endswith('_%s.jpg' % vk)) if os.path.isdir('docs/coach') else []
        if fs: views[vk] = ['coach/' + f for f in fs]
    if not views: return None
    note = {'driver': '动作示范为铁杆的完整挥杆，原理相同。一号木的区别：站得更宽、球放在左脚内侧并放在球钉上，在最低点之后向上扫过球。', 'tempo': '节奏用 3:1：上杆数三拍，下杆一拍。可以对着下面的分解动作，默数“1—2—3—打”。', 'short-game-adv': '这里以 9 点钟摆幅的高抛球为例；7:30、10:30 摆幅的动作相同，只是后摆更小或更大。'}.get(lid, '')
    return dict(motion=m, views=views, note=note, steps=[dict(l=l, n=n) for l, n in NOTES[m]])

A3D = {'swing-basic': 'swing', 'irons': 'swing', 'tempo': 'swing', 'driver': 'driver', 'putting': 'putt', 'chipping': 'chip', 'pitching': 'pitch', 'short-game-adv': 'pitch'}
from narration import N
from narration2 import N2
N.update(N2)
from coach_notes import NOTES
from videos import V
levels = []
for lv in LEVELS:
    levels.append(dict(id=lv["id"], name=lv["name"], desc=lv["desc"], lessons=[dict(
        id=l["id"], title=l["title"], summary=l["summary"], body=l["body"], anim=BY_LESSON.get(l["id"], l["anim"]), a3d=A3D.get(l["id"], ""), coach=coach_for(l["id"]),
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
