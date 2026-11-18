"""课程内容。规则按 2023 版 R&A/USGA 高尔夫规则整理；具体以官方规则书为准。"""
from urllib.parse import quote
from videos import V

PLATFORMS = [
    ("哔哩哔哩 Bilibili", "https://search.bilibili.com/all?keyword={q}", "中文教学最多，适合入门与系统课"),
    ("YouTube", "https://www.youtube.com/results?search_query={q}", "英文名师：Rick Shiels、Golf Sidekick、Me and My Golf、Danny Maude"),
    ("抖音", "https://www.douyin.com/search/{q}", "短视频，适合碎片化看技巧点评"),
    ("小红书", "https://www.xiaohongshu.com/search_result?keyword={q}", "球友经验、下场攻略、装备选购"),
    ("PGA 官方", "https://www.pga.com/search?q={q}", "PGA 教学文章"),
    ("R&A 规则", "https://www.randa.org/search?q={q}", "官方规则与解释（英文）"),
]

def vlinks(kw):
    return [(n, u.format(q=quote(kw)), d) for n, u, d in PLATFORMS]

ANIM = {}
ANIM["swing"] = """<svg viewBox="0 0 400 260" class="anim"><rect width="400" height="260" fill="#eaf4ec"/>
<line x1="0" y1="225" x2="400" y2="225" stroke="#4a8c5c" stroke-width="3"/>
<circle cx="200" cy="60" r="14" fill="#c9a37a"/><line x1="200" y1="74" x2="200" y2="150" stroke="#1a4f7a" stroke-width="10" stroke-linecap="round"/>
<line x1="200" y1="150" x2="178" y2="225" stroke="#1a4f7a" stroke-width="9"/><line x1="200" y1="150" x2="222" y2="225" stroke="#1a4f7a" stroke-width="9"/>
<g><animateTransform attributeName="transform" type="rotate" values="0 200 100;-120 200 100;-120 200 100;0 200 100;60 200 100;60 200 100;0 200 100" keyTimes="0;.3;.38;.62;.85;.92;1" dur="5s" repeatCount="indefinite"/>
<line x1="200" y1="100" x2="200" y2="215" stroke="#333" stroke-width="3"/><rect x="190" y="210" width="22" height="9" fill="#555"/></g>
<circle cx="200" cy="222" r="6" fill="#fff" stroke="#999"/>
<text x="10" y="22" font-size="13" fill="#333">准备 → 上杆 → 顶点 → 下杆 → 击球 → 收杆</text></svg>"""
ANIM["putt"] = """<svg viewBox="0 0 400 200" class="anim"><rect width="400" height="200" fill="#d9eed8"/>
<ellipse cx="320" cy="170" rx="12" ry="4" fill="#222"/><circle cx="130" cy="165" r="7" fill="#fff" stroke="#999"/>
<g><animateTransform attributeName="transform" type="rotate" values="-18 130 40;18 130 40;-18 130 40" dur="2.4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" keyTimes="0;.5;1"/>
<line x1="130" y1="40" x2="130" y2="165" stroke="#333" stroke-width="4"/><rect x="118" y="160" width="30" height="8" fill="#555"/></g>
<circle cx="130" cy="40" r="5" fill="#1a4f7a"/>
<text x="10" y="22" font-size="13" fill="#333">推杆像钟摆：肩膀带动，手腕锁定，前后摆幅相等</text></svg>"""
ANIM["flight"] = """<svg viewBox="0 0 400 200" class="anim"><rect width="400" height="200" fill="#e6f1fa"/>
<rect y="170" width="400" height="30" fill="#7fbf8a"/>
<path d="M30 170 C120 -10 280 -10 370 170" fill="none" stroke="#bbb" stroke-dasharray="4 4"/>
<circle r="7" fill="#fff" stroke="#999"><animateMotion dur="3s" repeatCount="indefinite" path="M30 170 C120 -10 280 -10 370 170"/></circle>
<text x="10" y="22" font-size="13" fill="#333">球飞行轨迹：起飞角度 + 旋转 决定落点与滚动</text></svg>"""
ANIM["course"] = """<svg viewBox="0 0 400 200" class="anim"><rect width="400" height="200" fill="#9fd1a4"/>
<path d="M20 100 C120 60 260 140 360 90" stroke="#5fae6b" stroke-width="46" fill="none" stroke-linecap="round"/>
<rect x="8" y="88" width="26" height="24" fill="#e8d9a8"/><text x="8" y="130" font-size="11">发球台</text>
<ellipse cx="365" cy="90" rx="26" ry="20" fill="#3f9a50"/><circle cx="368" cy="88" r="3" fill="#222"/><text x="338" y="125" font-size="11">果岭</text>
<ellipse cx="300" cy="125" rx="20" ry="11" fill="#f2e5b5"/><text x="283" y="150" font-size="11">沙坑</text>
<ellipse cx="170" cy="150" rx="35" ry="16" fill="#6ab0e0"/><text x="140" y="176" font-size="11">罚区(水)</text>
<text x="150" y="60" font-size="11">长草 Rough</text><text x="120" y="108" font-size="11" fill="#fff">球道 Fairway</text>
<rect x="0" y="0" width="400" height="200" fill="none" stroke="#c00" stroke-width="3" stroke-dasharray="1 0" opacity="0"/></svg>"""

def L(id, title, summary, body, kw, anim=None, minutes=8):
    return dict(id=id, title=title, summary=summary, body=body, kw=kw, anim=ANIM.get(anim, ""), minutes=minutes)

LEVELS = [
 dict(id="l1", name="第一阶段 · 小白入门", desc="先搞懂这项运动、装备和最基本的姿势", lessons=[
  L("what-is-golf","高尔夫是什么：18 洞与计分","用最少的杆数把球打进 18 个洞",
"""<p>高尔夫是用球杆把球依次打进 <b>18 个洞</b>的运动，<b>总杆数越少越好</b>。每个洞有一个<b>标准杆（Par）</b>：3、4 或 5 杆。一场标准 18 洞通常 Par 72 左右。</p>
<ul><li><b>Par 3</b>：短洞，一杆上果岭、两推进洞为标准杆。</li><li><b>Par 4 / Par 5</b>：中长洞，分别约 3 杆、4 杆上果岭 + 2 推。</li>
<li><b>Birdie</b>：少一杆；<b>Eagle</b>：少两杆；<b>Bogey</b>：多一杆；<b>Double Bogey</b>：多两杆。</li></ul>
<p>新手目标：<b>不要追求标准杆</b>，先做到每洞不丢球、不超过「Par + 3」，并且玩得开心。</p>""","高尔夫入门 零基础 规则 计分",None,6),
  L("equipment","装备：14 支杆与必备用品","认识球杆家族，新手不必买满",
"""<p>规则最多带 <b>14 支球杆</b>。常见分类：</p>
<ul><li><b>木杆/一号木（Driver）</b>：发球台开球，最远。</li><li><b>球道木、混合杆（Hybrid）</b>：长距离，比长铁杆好打，<b>新手强烈推荐</b>。</li>
<li><b>铁杆 5–9 号</b>：数字越大杆面越躺、球越高越近。</li><li><b>挖起杆 PW/GW/SW/LW</b>：短距离、切球、沙坑。</li><li><b>推杆（Putter）</b>：果岭上用。</li></ul>
<p><b>新手初期</b>：一套 8–10 支的入门半套杆即可（Driver/3 号木或混合杆/7 号铁/9 号铁/PW/SW/推杆）。其他：高尔夫手套、球钉、球标、果岭修复叉、带软钉的高尔夫鞋、多备几颗球。</p>""","高尔夫球杆 新手装备 怎么选",None,7),
  L("grip","握杆 Grip","一切动作的起点：杆面方向由它决定",
"""<ol><li>左手（右手持杆者）手指握杆，杆柄斜过手指根部，不是握在掌心。</li><li>左拇指贴在杆柄右侧偏顶。</li><li>右手小指叠在左手食指上（<b>重叠式</b>），或相扣（<b>互锁式</b>，手小者常用）。</li>
<li>两手的 <b>V 形</b>（拇指与食指形成的 V）都指向<b>右肩/下巴</b>附近。</li><li>力度：像握一支牙膏——<b>不让牙膏挤出来</b>，约 4–5 分力。</li></ol>
<p>常见错误：握太紧（手臂僵硬、挥不动）；V 形指向左肩（弱握，容易右曲）。</p>""","高尔夫 握杆 教学 新手",None,6),
  L("stance","站姿与瞄准","稳定的基础：站对，才能挥对",
"""<ul><li><b>脚宽</b>：约与肩同宽（长杆更宽、短杆略窄）。</li><li><b>髋部前倾</b>、背部挺直，膝盖微弯，手臂自然下垂。</li><li><b>球位</b>：短铁在站位中间，越长越靠前，一号木在左脚内侧对面。</li>
<li><b>瞄准</b>：先站在球后看目标，选一个<b>近处的参照物</b>（球前一米的草痕），让杆面先对准，再摆脚、髋、肩<b>平行于目标线</b>。</li></ul>
<p>练习技巧：在地上放两根杆，一根指向目标，一根平行于脚尖，练「铁轨式」站位。</p>""","高尔夫 站姿 瞄准 教学",None,6),
 ]),
 dict(id="l2", name="第二阶段 · 击球基础", desc="挥杆、推杆、切杆、沙坑四大基本功", lessons=[
  L("swing-basic","完整挥杆的五个阶段","先学会节奏，再追求速度",
"""<p>下面动画展示完整挥杆。记住 <b>3:1 节奏</b>——上杆用 3 拍，下杆 1 拍。</p>
<ol><li><b>准备</b>：握杆站姿正确，身体放松。</li><li><b>上杆</b>：肩带动手臂，重心略向右，左肩转到下巴下。</li><li><b>顶点</b>：杆身大致与地面平行，左臂较直。</li>
<li><b>下杆</b>：先转髋，重心移向左脚，手臂跟随。</li><li><b>击球与收杆</b>：击球后胸口朝向目标，重心 90% 在左脚，保持平衡 3 秒。</li></ol>
<p>要点：<b>身体转动带动手臂</b>，而不是用手去“打”球；眼睛看球后方一点。</p>""","高尔夫 挥杆 基础 慢动作 教学","swing",10),
  L("putting","推杆 Putting","一半的杆数都在果岭上",
"""<ul><li>握杆：<b>反握</b>或常规握，握压比挥杆更轻。</li><li>站姿：眼睛在球的正上方或略内侧，手臂与肩膀形成<b>五边形</b>，一起摆动。</li><li>摆动：像钟摆，<b>肩膀</b>推动，手腕不动，<b>后摆与前摆等长</b>控制距离。</li>
<li>距离感：在练习果岭练<b>3 步、6 步、9 步</b>的摆幅。</li><li>读线：站在球后看坡度，<b>低的一侧</b>即球会拐向的方向。</li></ul>
<p>新手常见错误：<b>推短</b>。宁可推过洞 30–40 厘米，也不要停在洞前。</p>""","高尔夫 推杆 教学 距离控制","putt",8),
  L("chipping","切杆 Chipping","在果岭边用短杆把球送上果岭滚向洞",
"""<ul><li>站位<b>稍窄、偏开放</b>，球靠近右脚，<b>重心 60% 在左脚</b>。</li><li>手比球先到——杆柄略向目标前倾。</li><li>动作如<b>放大的推杆</b>，手腕不翻，轻轻“刷”过草面。</li>
<li>选杆：<b>落点近、滚动多</b>用 8/9 铁；<b>要飞过障碍</b>才用挖起杆。</li></ul>
<p>口诀：<b>低飞快滚比高飞更稳</b>。</p>""","高尔夫 切杆 chip 教学",None,7),
  L("bunker","沙坑球 Bunker","打沙，不是打球",
"""<ul><li>身体<b>扭入沙中</b>站稳，球位偏前，杆面<b>开放</b>。</li><li>瞄准球后<b>约 5 厘米</b>的沙面，让杆底先入沙，<b>沙带着球飞出</b>。</li><li>比平时更<b>满的挥杆</b>，收杆要完整，别减速。</li>
<li>规则：<b>击球前不得触沙</b>（球杆不能碰沙面）；击球后用耙子把沙整平。</li></ul>""","高尔夫 沙坑球 教学",None,7),
  L("ball-flight","球路与常见失误","看懂球飞行的方向，就知道哪里出了问题",
"""<ul><li><b>Slice / 右曲</b>：外-内路径，杆面开放，多见于新手。解法：弱握改强握、先顺目标线挥。</li><li><b>Hook / 左曲</b>：内-外路径，杆面关闭。</li>
<li><b>Topping / 削球</b>：击球位置偏高，抬头。保持眼睛在球上。</li><li><b>Fat / 重击</b>：先打到地。重心不到左脚。</li></ul>
<p>规律：<b>杆面指向决定初始方向，杆面与路径之差决定曲线</b>。</p>""","高尔夫 球路 slice 右曲 纠正","flight",8),
 ]),
 dict(id="l3", name="第三阶段 · 规则与礼仪", desc="下场前必须懂的规则与球场礼节", lessons=[
  L("etiquette","球场礼仪","礼仪是高尔夫的灵魂",
"""<ul><li><b>安全第一</b>：挥杆前确认周围无人；击出危险球要大喊 <b>“Fore!”</b>。</li><li><b>保持安静</b>：他人击球时站在其侧后方，不说话、不走动。</li>
<li><b>爱护球场</b>：修复<b>切草痕（divot）</b>、推平沙坑、修果岭球痕；果岭上不要拖脚走。</li><li><b>保持速度</b>：<b>Ready Golf</b>——准备好就先打；找球不超过 3 分钟；每洞约 12–13 分钟。</li>
<li><b>着装</b>：有领上衣、长/短裤或裙，穿高尔夫鞋；手机静音。</li><li><b>让后组</b>：落后一洞以上或后组等候，邀请后组先过。</li></ul>""","高尔夫 球场礼仪 新手必看",None,7),
  L("rules","基本规则速览","最常用的 8 条",
"""<ol><li><b>14 支杆</b>上限，超过每洞罚 2 杆（最多 4 杆）。</li><li><b>球必须按原样打</b>（Play it as it lies），不能随便移动球。</li><li><b>OB（界外）</b>：罚 1 杆，回原处重打（距离罚杆）。不确定时先打<b>暂定球</b>。</li>
<li><b>罚区（红/黄线）</b>：罚 1 杆，可在入口处后方延长线上、或原击球处重打（红线另可侧向救济）。</li><li><b>无法打的球</b>：除水中外任何位置，罚 1 杆处理。</li>
<li><b>找球</b>限时 3 分钟。</li><li><b>抛球（Drop）</b>：<b>膝盖高度</b>松手，落入救济区。</li><li><b>果岭上</b>：可标记并拿起球擦拭；推杆时旗杆可留在洞里。</li></ol>
<p>新手最稳的原则：<b>不确定怎么处理，就多打一个暂定球，并和同伴讨论</b>。具体条文请对照官方规则书。</p>""","高尔夫 规则 罚杆 OB 罚区",None,10),
 ]),
 dict(id="l4", name="第四阶段 · 球场与下场", desc="认识球场，下场前后的完整流程", lessons=[
  L("course-know","球场构成","18 洞里有什么",
"""<p>看动画认识每个区域：</p>
<ul><li><b>发球台 Tee Box</b>：开球区，有黑/蓝/白/红/金等不同颜色，代表距离。</li><li><b>球道 Fairway</b>：修剪整齐的主路径。</li><li><b>长草 Rough</b>：球道两侧，阻力大。</li>
<li><b>沙坑 Bunker</b>、<b>罚区 Penalty Area</b>、<b>界外 OB（白桩）</b>。</li><li><b>果岭 Green</b>：洞所在的区域，草最短。</li></ul>
<p>标识：<b>红桩/红线</b>＝罚区，<b>黄桩</b>＝罚区，<b>白桩</b>＝界外，<b>蓝桩</b>＝维修地。</p>""","高尔夫球场 构成 球道 果岭 罚区","course",6),
  L("first-round","第一次下场完整流程","从停车到离场",
"""<ol><li><b>提前 45–60 分钟到</b>：报到、换鞋、寄存。</li><li><b>热身 15 分钟</b>：伸展、挥空杆、练习果岭推几个。</li><li><b>确认发球台</b>：新手选<b>最前面的发球台</b>。</li>
<li>选杆：开球不一定用一号木，<b>能稳定上球道的杆才是好杆</b>。</li><li>记分：球童或同伴记，正式比赛由<b>同组球友</b>互相记分。</li><li>打完每洞：<b>放好旗杆、先离开果岭</b>再记分。</li>
<li>结束：与同伴握手，<b>感谢球童/同伴</b>，清点自己的球杆。</li></ol>
<p>新手小提醒：<b>不要逞强，每洞「最多 Par+3 就捡球」</b>，跟上节奏比杆数重要。</p>""","高尔夫 第一次下场 新手 流程",None,8),
  L("course-strategy","球场策略入门","用脑子打，比用力气更有效",
"""<ul><li>先看<b>危险区</b>（水、OB、沙坑），把球打向<b>安全一侧</b>。</li><li><b>目标到点而不是到洞</b>：选一个自己能稳定打到的距离点。</li><li>风：顺风少一号杆，逆风多一号杆，侧风瞄风的上风侧。</li>
<li>果岭：永远<b>瞄果岭中心</b>，不要追旗。</li><li>失误后：优先<b>回到球道</b>，别想一杆补回来。</li></ul>""","高尔夫 球场策略 管理 course management",None,7),
 ]),
 dict(id="l5", name="第五阶段 · 练习方法", desc="每周怎么练才进步最快", lessons=[
  L("practice-plan","每周练习计划","质量 > 数量",
"""<p>建议每周 2–3 次，每次 60 分钟：</p>
<table><tr><th>时长</th><th>内容</th></tr><tr><td>10 分钟</td><td>热身 + 慢动作挥杆</td></tr><tr><td>20 分钟</td><td><b>短杆</b>：推杆、切杆（占时间 60%）</td></tr>
<tr><td>20 分钟</td><td>铁杆/混合杆：<b>7 号铁为主</b></td></tr><tr><td>10 分钟</td><td>一号木 + 模拟实战</td></tr></table>
<p><b>训练方法</b>：每球都有目标；每 10 球换杆换目标；记录命中率；用手机拍<b>正面和侧面</b>视频自查。</p>""","高尔夫 练习 计划 练习场",None,6),
  L("drills","10 个常用练习动作","在家也能练",
"""<ol><li><b>毛巾夹腋下</b>：保持手臂与身体同步转动。</li><li><b>地面放杆</b>：校准瞄准与球位。</li><li><b>脚并拢挥杆</b>：练平衡与节奏。</li><li><b>分段上杆（L 到 L）</b>：手臂水平到水平小幅挥杆。</li>
<li><b>推杆过门</b>：两个球钉做成小门，球通过门。</li><li><b>闭眼挥杆</b>：练节奏与重心。</li><li><b>切杆 20 球</b>：目标圈 1 米内记分。</li><li><b>9 洞游戏</b>：练习场随机目标模拟下场。</li>
<li><b>家用推杆垫</b>：每天 5 分钟。</li><li><b>慢动作 + 录像</b>：每周回顾一次。</li></ol>""","高尔夫 练习 drills 在家练习",None,8),
 ]),
 dict(id="l6", name="第六阶段 · 进阶与高阶", desc="从“能打”到“打得好”", lessons=[
  L("shotshaping","控制球路：左曲、右曲、高低球","主动造球路",
"""<ul><li><b>Fade（右曲）</b>：杆面略开放、路径略偏左。</li><li><b>Draw（左曲）</b>：杆面略关闭、路径略偏右。</li><li><b>低飞球</b>：球放后、手前压、减少收杆。</li><li><b>高飞球</b>：球放前、略开杆面、完整收杆。</li></ul>
<p>先<b>固定一种球路</b>，再学第二种；比赛时用你最熟的那种。</p>""","高尔夫 球路控制 draw fade 进阶",None,8),
  L("short-game-adv","短杆进阶：Pitch、Lob 与落点控制","把挖起杆练成武器",
"""<ul><li>建立<b>距离矩阵</b>：用 SW/GW/PW 在 30/40/50/60 码以钟面（7、9、11 点）摆幅记录距离。</li><li><b>Pitch</b>：球落点占 70%，滚动占 30%。</li><li><b>Lob</b>：开杆面，重心稍后，需练习与风险管理。</li>
<li>点位：每次在草地上选<b>落点</b>而不是洞。</li></ul>""","高尔夫 挖起杆 距离控制 pitch lob",None,8),
  L("mental","心理与赛场管理","高水平球手的分水岭",
"""<ul><li><b>击球前例行程序</b>：看→选→想象→挥杆，每次一致。</li><li>接受失误，<b>只关注下一杆</b>。</li><li>记录<b>统计</b>：上球道率、GIR（标准杆上果岭率）、推杆数。</li><li>设定<b>过程目标</b>（如“不超过 36 推”）而非结果目标。</li></ul>
<p>进阶路径：每年降低 5–8 杆；<b>差点（Handicap）</b>是衡量水平的标准。</p>""","高尔夫 心理 差点 handicap 比赛",None,7),
 ]),
]

def all_lessons():
    return [l for lv in LEVELS for l in lv["lessons"]]

def find_lesson(lid):
    for l in all_lessons():
        if l["id"] == lid:
            l = dict(l); l["links"] = vlinks(l["kw"]); l["videos"] = V.get(lid, []); return l
