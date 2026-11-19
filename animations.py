"""动图：全部是自绘的动画矢量图（SVG + SMIL），体积小、清晰、可缩放，也不依赖外网。
BY_LESSON 把课程 id 映射到动画。"""

def svg(body, bg="#eaf4ec", h=240):
    return f'<svg viewBox="0 0 400 {h}" class="anim" role="img"><rect width="400" height="{h}" fill="{bg}"/>{body}</svg>'

T = 'font-size="13" fill="#233"'

GRIP = svg(f'''
<line x1="200" y1="14" x2="200" y2="226" stroke="#555" stroke-width="7" stroke-linecap="round"/>
<rect x="176" y="70" width="48" height="52" rx="14" fill="#d8b48a" stroke="#a37c52" stroke-width="2"/>
<rect x="176" y="126" width="48" height="52" rx="14" fill="#cfa77c" stroke="#a37c52" stroke-width="2"/>
<g stroke="#c0392b" stroke-width="3" fill="none" stroke-linecap="round" stroke-dasharray="6 5">
<polyline points="196,92 236,58 258,50"><animate attributeName="stroke-dashoffset" values="0;-22" dur="1.2s" repeatCount="indefinite"/></polyline>
<polyline points="196,148 236,114 258,100"><animate attributeName="stroke-dashoffset" values="0;-22" dur="1.2s" repeatCount="indefinite"/></polyline></g>
<circle cx="296" cy="64" r="12" fill="#f0c36b"><animate attributeName="r" values="10;15;10" dur="1.6s" repeatCount="indefinite"/></circle>
<text x="270" y="40" {T}>右肩/下巴</text>
<text x="14" y="26" {T}>两个 V 形都指向右肩</text><text x="14" y="46" font-size="12" fill="#556">握压：十分力只用四分</text>
<text x="14" y="222" font-size="12" fill="#556">手指握杆，不是握在掌心</text>''')

STANCE = svg(f'''
<line x1="0" y1="205" x2="400" y2="205" stroke="#4a8c5c" stroke-width="3"/>
<circle cx="140" cy="52" r="15" fill="#d8b48a"/><line x1="142" y1="68" x2="130" y2="135" stroke="#1a4f7a" stroke-width="12" stroke-linecap="round"/>
<line x1="130" y1="135" x2="108" y2="205" stroke="#1a4f7a" stroke-width="10"/><line x1="130" y1="135" x2="166" y2="205" stroke="#1a4f7a" stroke-width="10"/>
<line x1="136" y1="85" x2="170" y2="150" stroke="#d8b48a" stroke-width="7" stroke-linecap="round"/>
<line x1="170" y1="150" x2="206" y2="200" stroke="#555" stroke-width="3"/>
<circle cy="199" r="6" fill="#fff" stroke="#888"><animate attributeName="cx" values="166;176;186;204;166" keyTimes="0;.25;.5;.75;1" dur="8s" repeatCount="indefinite"/></circle>
<g {T}><text x="230" y="40">球位随球杆变化：</text>
<text x="230" y="64" fill="#c0392b" opacity="1">短铁：正中间<animate attributeName="opacity" values="1;0;0;0;1" keyTimes="0;.2;.5;.8;1" dur="8s" repeatCount="indefinite"/></text>
<text x="230" y="64" fill="#c0392b" opacity="0">中铁：偏前一个球<animate attributeName="opacity" values="0;1;0;0;0" keyTimes="0;.25;.45;.7;1" dur="8s" repeatCount="indefinite"/></text>
<text x="230" y="64" fill="#c0392b" opacity="0">混合杆：再偏前<animate attributeName="opacity" values="0;0;1;0;0" keyTimes="0;.45;.5;.7;1" dur="8s" repeatCount="indefinite"/></text>
<text x="230" y="64" fill="#c0392b" opacity="0">一号木：左脚内侧<animate attributeName="opacity" values="0;0;0;1;0" keyTimes="0;.5;.7;.9;1" dur="8s" repeatCount="indefinite"/></text></g>
<text x="14" y="26" {T}>髋部前倾，背部平直，膝盖微弯</text>''')

IRONS = svg(f'''
<line x1="0" y1="210" x2="400" y2="210" stroke="#4a8c5c" stroke-width="3"/>
<circle cx="186" cy="204" r="6" fill="#fff" stroke="#888"><animateMotion dur="3.5s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;.42;.8;1" calcMode="linear" path="M0,0 C20,-90 90,-120 140,-70"/></circle>
<g><animateMotion dur="3.5s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.55;1" calcMode="linear" path="M110,60 C140,200 170,208 215,208 C250,208 280,170 300,120"/>
<rect x="-14" y="-6" width="28" height="12" rx="3" fill="#555" transform="rotate(-20)"/></g>
<ellipse cx="226" cy="211" rx="18" ry="5" fill="#8b5a2b" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.4;.45;.9;1" dur="3.5s" repeatCount="indefinite"/></ellipse>
<text x="232" y="236" font-size="12" fill="#8b5a2b">草皮痕在球的前方</text>
<text x="14" y="26" {T}>铁杆：先碰球，后碰草地（向下击球）</text>''')

DRIVER = svg(f'''
<line x1="0" y1="205" x2="400" y2="205" stroke="#4a8c5c" stroke-width="3"/>
<line x1="200" y1="205" x2="200" y2="182" stroke="#c9a36a" stroke-width="4"/>
<circle cx="200" cy="176" r="7" fill="#fff" stroke="#888"><animateMotion dur="3.5s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;.45;.85;1" path="M0,0 C30,-80 110,-130 170,-100"/></circle>
<g><animateMotion dur="3.5s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.55;1" path="M90,120 C130,200 175,200 205,178 C250,150 290,100 320,60"/>
<rect x="-18" y="-8" width="36" height="16" rx="6" fill="#444" transform="rotate(-25)"/></g>
<text x="14" y="26" {T}>一号木：球在 tee 上，在最低点之后向上扫</text>
<text x="14" y="46" font-size="12" fill="#556">tee 高度：约半个球露在杆头顶上方</text>''')

CHIP = svg(f'''
<line x1="0" y1="205" x2="400" y2="205" stroke="#4a8c5c" stroke-width="3"/>
<ellipse cx="340" cy="206" rx="13" ry="4" fill="#222"/><line x1="340" y1="206" x2="340" y2="140" stroke="#999" stroke-width="2"/><polygon points="340,140 362,148 340,156" fill="#e74c3c"/>
<circle cx="160" cy="205" r="9" fill="none" stroke="#c0392b" stroke-width="2" stroke-dasharray="3 3"><animate attributeName="r" values="7;12;7" dur="1.4s" repeatCount="indefinite"/></circle>
<text x="128" y="228" font-size="12" fill="#c0392b">落点</text>
<circle r="6" fill="#fff" stroke="#888"><animateMotion dur="3.4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;.35;1" keyTimes="0;.4;1" path="M50,199 Q105,130 160,199 L330,199"/></circle>
<text x="14" y="26" {T}>切杆：选落点，让球落地后滚向洞</text><text x="14" y="46" font-size="12" fill="#556">落点近、滚得多 → 用 7/8/9 号铁（低飞）</text>''')

PITCH = svg(f'''
<circle cx="200" cy="130" r="82" fill="#fff" stroke="#556" stroke-width="3"/>
<g stroke="#556" stroke-width="2"><line x1="200" y1="52" x2="200" y2="66"/><line x1="200" y1="194" x2="200" y2="208"/><line x1="122" y1="130" x2="136" y2="130"/><line x1="264" y1="130" x2="278" y2="130"/></g>
<g font-size="12" fill="#556" text-anchor="middle"><text x="200" y="46">12</text><text x="200" y="224">6</text><text x="110" y="134">9</text><text x="290" y="134">3</text></g>
<g stroke-width="3" stroke="#c0392b" stroke-linecap="round" opacity=".35"><line x1="200" y1="130" x2="142" y2="188"/><line x1="200" y1="130" x2="118" y2="130"/><line x1="200" y1="130" x2="142" y2="72"/></g>
<g><line x1="200" y1="130" x2="200" y2="60" stroke="#1a4f7a" stroke-width="6" stroke-linecap="round"/><circle cx="200" cy="130" r="6" fill="#1a4f7a"/>
<animateTransform attributeName="transform" type="rotate" values="225 200 130;225 200 130;270 200 130;270 200 130;315 200 130;315 200 130;225 200 130" keyTimes="0;.15;.3;.5;.65;.85;1" dur="7s" repeatCount="indefinite"/></g>
<g {T}><text x="14" y="26">钟表系统：手臂摆到几点钟，决定距离</text>
<text x="14" y="214" fill="#c0392b">7:30 短 · 9:00 中 · 10:30 长</text></g>''')

BUNKER = svg(f'''
<path d="M0,206 Q200,232 400,206 L400,240 L0,240Z" fill="#efdca8"/><line x1="0" y1="206" x2="400" y2="206" stroke="#d4bd7a" stroke-width="2"/>
<circle cx="205" cy="200" r="6" fill="#fff" stroke="#888"><animateMotion dur="3.4s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;.48;.85;1" path="M0,0 C20,-90 70,-120 110,-70"/></circle>
<g fill="#d9bf7a"><circle cx="190" cy="206" r="3"><animateMotion dur="3.4s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;.5;.8;1" path="M0,0 C10,-30 25,-40 40,-10"/></circle>
<circle cx="200" cy="206" r="4"><animateMotion dur="3.4s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;.5;.8;1" path="M0,0 C15,-45 35,-50 55,-5"/></circle>
<circle cx="180" cy="206" r="3"><animateMotion dur="3.4s" repeatCount="indefinite" keyPoints="0;0;1;1" keyTimes="0;.5;.8;1" path="M0,0 C0,-25 10,-35 25,-8"/></circle></g>
<g><animateMotion dur="3.4s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.5;1" path="M110,70 C140,160 165,214 190,218 C230,222 270,180 300,130"/>
<rect x="-18" y="-8" width="36" height="16" rx="6" fill="#444" transform="rotate(-25)"/></g>
<text x="14" y="26" {T}>沙坑球：打球后面 3–5 厘米的沙，沙带球飞出</text><text x="14" y="46" font-size="12" fill="#556">杆面打开，挥杆要满，收杆要完整</text>''')

TEMPO = svg(f'''
<rect x="20" y="80" width="270" height="44" rx="8" fill="#6fa8dc"/><rect x="290" y="80" width="90" height="44" rx="8" fill="#f0a35e"/>
<g font-size="14" fill="#fff" text-anchor="middle"><text x="155" y="108">上杆 · 三拍</text><text x="335" y="108">下杆 · 一拍</text></g>
<g stroke="#fff" stroke-width="2" opacity=".7"><line x1="110" y1="80" x2="110" y2="124"/><line x1="200" y1="80" x2="200" y2="124"/></g>
<rect y="68" width="5" height="68" fill="#c0392b"><animate attributeName="x" values="20;380" dur="4s" repeatCount="indefinite"/></rect>
<g font-size="22" fill="#233" text-anchor="middle"><text x="65" y="168">1</text><text x="155" y="168">2</text><text x="245" y="168">3</text><text x="335" y="168" fill="#c0392b">打</text></g>
<text x="14" y="30" {T}>节奏 3 : 1 —— 数 “1—2—3—打”</text><text x="14" y="212" font-size="12" fill="#556">用七成力量，脚并拢挥杆测试平衡</text>''')

GREEN = svg(f'''
<ellipse cx="200" cy="125" rx="185" ry="100" fill="#8fd19e" stroke="#4a8c5c" stroke-width="3"/>
<g fill="none" stroke="#2e7d4f" stroke-width="2" stroke-linecap="round" opacity=".6"><path d="M70,40 l20,28 m-6,-2 l6,2 l2,-7"/><path d="M150,25 l20,28 m-6,-2 l6,2 l2,-7"/><path d="M230,28 l20,28 m-6,-2 l6,2 l2,-7"/><path d="M300,55 l20,28 m-6,-2 l6,2 l2,-7"/></g>
<ellipse cx="320" cy="150" rx="9" ry="6" fill="#222"/>
<path d="M70,185 C140,60 260,60 316,146" fill="none" stroke="#e67e22" stroke-width="2" stroke-dasharray="4 4"/>
<circle cx="250" cy="82" r="8" fill="none" stroke="#c0392b" stroke-width="2"><animate attributeName="r" values="6;11;6" dur="1.4s" repeatCount="indefinite"/></circle><text x="206" y="62" font-size="12" fill="#c0392b">落点（对准它）</text>
<circle r="6" fill="#fff" stroke="#888"><animateMotion dur="3.6s" repeatCount="indefinite" path="M70,185 C140,60 260,60 316,146"/></circle>
<text x="14" y="24" {T}>读线：看坡向，选落点，让球拐进洞（箭头＝下坡方向）</text>''')

def _shape(title, a, b, la, lb):
    return svg(f'''
<line x1="200" y1="214" x2="200" y2="20" stroke="#999" stroke-width="2" stroke-dasharray="5 5"/><circle cx="200" cy="20" r="9" fill="#ffcf5a"/><text x="214" y="24" font-size="12" fill="#556">目标</text>
<path d="{a}" fill="none" stroke="#c0392b" stroke-width="3" opacity=".35"/><path d="{b}" fill="none" stroke="#1a6fb5" stroke-width="3" opacity=".35"/>
<circle r="6" fill="#c0392b"><animateMotion dur="3s" repeatCount="indefinite" path="{a}"/></circle>
<circle r="6" fill="#1a6fb5"><animateMotion dur="3s" repeatCount="indefinite" path="{b}"/></circle>
<text x="20" y="214" font-size="13" fill="#c0392b">{la}</text><text x="262" y="214" font-size="13" fill="#1a6fb5">{lb}</text>
<text x="14" y="26" {T}>{title}</text>''', bg="#eaf4ec")

SHAPE = _shape("主动球路（右手持杆者，俯视）", "M200,214 C150,150 160,70 200,26", "M200,214 C250,150 240,70 200,26", "Draw 左曲 ←", "→ Fade 右曲")
SLICE = _shape("失控的弯曲（俯视）", "M200,214 C230,140 330,90 350,36", "M200,214 C170,140 70,90 50,36", "Hook 左曲 ←（杆面关闭）", "→ Slice 右曲（杆面开放）")
SLICE = SLICE.replace('fill="#c0392b">Hook', 'fill="#1a6fb5">Hook').replace('<text x="20" y="214" font-size="13" fill="#c0392b">', '<text x="20" y="214" font-size="13" fill="#1a6fb5">')

RELIEF = svg(f'''
<ellipse cx="200" cy="105" rx="120" ry="52" fill="#9fd0f0" stroke="#d63a2f" stroke-width="3"/><text x="170" y="108" font-size="14" fill="#2a5d8a">罚区（红线）</text>
<line x1="200" y1="14" x2="200" y2="64" stroke="#999" stroke-width="2"/><polygon points="200,14 222,22 200,30" fill="#e74c3c"/>
<circle cx="200" cy="156" r="6" fill="#fff" stroke="#c0392b" stroke-width="2"/><text x="212" y="160" font-size="12" fill="#c0392b">球越线处</text>
<g stroke-width="3" fill="none" stroke-linecap="round">
<path d="M200,164 L200,228" stroke="#e67e22" stroke-dasharray="6 5"><animate attributeName="stroke-dashoffset" values="0;-22" dur="1.4s" repeatCount="indefinite"/></path>
<path d="M120,168 Q160,190 250,172" stroke="#8e44ad" stroke-dasharray="6 5"><animate attributeName="stroke-dashoffset" values="0;-22" dur="1.4s" repeatCount="indefinite"/></path></g>
<g font-size="12"><text x="206" y="226" fill="#e67e22">② 后退线（沿洞—越线点连线向后）</text><text x="20" y="196" fill="#8e44ad">③ 侧向：两个球杆长度内（红线）</text>
<text x="20" y="226" fill="#333">① 回原击球处重打</text></g>
<text x="14" y="26" {T}>罚区救济：都罚 1 杆</text>''', h=240)

MATCH = svg(f'''
<rect x="60" y="56" width="280" height="120" rx="14" fill="#233b2f"/>
<g font-size="26" text-anchor="middle" fill="#fff">
<text x="200" y="104" opacity="1">平分 A/S<animate attributeName="opacity" values="1;1;0;0;0;0;0;0;0;0;1" keyTimes="0;.18;.2;.4;.5;.6;.7;.8;.9;.98;1" dur="12s" repeatCount="indefinite"/></text>
<text x="200" y="104" opacity="0">领先 1 洞 · 1 UP<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.18;.2;.38;.4;1" dur="12s" repeatCount="indefinite"/></text>
<text x="200" y="104" opacity="0">领先 2 洞 · 2 UP<animate attributeName="opacity" values="0;0;0;1;1;0;0" keyTimes="0;.38;.4;.5;.58;.6;1" dur="12s" repeatCount="indefinite"/></text>
<text x="200" y="104" opacity="0" fill="#ffd166">多米 Dormie<animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.58;.6;.78;.8;1" dur="12s" repeatCount="indefinite"/></text>
<text x="200" y="104" opacity="0" fill="#7ee081">3 &amp; 2 获胜！<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.78;.8;.98;1" dur="12s" repeatCount="indefinite"/></text></g>
<g font-size="13" text-anchor="middle" fill="#cfe9d8"><text x="200" y="146">领先的洞数 &gt; 剩余洞数，比赛即结束</text></g>
<text x="14" y="30" {T}>比洞赛：一洞一洞比，赢洞多者胜</text>''')

def _lie(x, y, title, arrow, note):
    return f'''<g transform="translate({x},{y})"><rect width="190" height="104" rx="10" fill="#fff" opacity=".7"/>
{arrow}<text x="8" y="18" font-size="12" fill="#233">{title}</text><text x="8" y="96" font-size="11" fill="#c0392b">{note}</text></g>'''

LIES = svg(
 _lie(5, 6, "上坡：飞得高、短、偏左", '<line x1="20" y1="82" x2="170" y2="42" stroke="#4a8c5c" stroke-width="4"/><circle cx="100" cy="56" r="5" fill="#fff" stroke="#888"/><path d="M100,56 Q75,26 45,34" fill="none" stroke="#c0392b" stroke-width="3" stroke-dasharray="4 3"><animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite"/></path>', "多一号杆，目标略偏右") +
 _lie(205, 6, "下坡：飞得低、远、偏右", '<line x1="20" y1="42" x2="170" y2="82" stroke="#4a8c5c" stroke-width="4"/><circle cx="100" cy="58" r="5" fill="#fff" stroke="#888"/><path d="M100,58 Q135,40 165,50" fill="none" stroke="#c0392b" stroke-width="3" stroke-dasharray="4 3"><animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite"/></path>', "少一号杆，目标略偏左") +
 _lie(5, 124, "球高于脚：偏左", '<line x1="20" y1="82" x2="170" y2="62" stroke="#4a8c5c" stroke-width="4"/><circle cx="120" cy="50" r="5" fill="#fff" stroke="#888"/><circle cx="60" cy="72" r="4" fill="#1a4f7a"/><path d="M120,50 Q90,30 60,36" fill="none" stroke="#c0392b" stroke-width="3" stroke-dasharray="4 3"><animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite"/></path>', "握短一点，目标偏右") +
 _lie(205, 124, "球低于脚：偏右", '<line x1="20" y1="62" x2="170" y2="82" stroke="#4a8c5c" stroke-width="4"/><circle cx="130" cy="74" r="5" fill="#fff" stroke="#888"/><circle cx="62" cy="48" r="4" fill="#1a4f7a"/><path d="M130,74 Q150,50 175,54" fill="none" stroke="#c0392b" stroke-width="3" stroke-dasharray="4 3"><animate attributeName="stroke-dashoffset" values="0;-14" dur="1s" repeatCount="indefinite"/></path>', "膝盖更弯，目标偏左"),
 h=240)

BY_LESSON = {
    "grip": GRIP, "stance": STANCE, "irons": IRONS, "driver": DRIVER, "chipping": CHIP, "pitching": PITCH,
    "bunker": BUNKER, "tempo": TEMPO, "green-reading": GREEN, "shotshaping": SHAPE, "ball-flight": SLICE,
    "relief": RELIEF, "match-play": MATCH, "uneven-lies": LIES,
}
