# 高尔夫学堂 · 交接说明（新会话先读这个）

线上：https://liugavin18-lgtm.github.io/golf-academy/　仓库：`liugavin18-lgtm/golf-academy`（公开，GitHub Pages，发布目录 `docs/`）

## 1. 一句话
给零基础学员的高尔夫学习站（中文）：94 节课 + 语音讲解 + 常见问答 + 术语表 + 全站搜索 + 记分计算器 + 3D 动作演示。
登录与进度走 Supabase（项目 ref `terdvoufgjxokhkkfeek`，网址 `https://terdvoufgjxokhkkfeek.supabase.co`）。**前端只用 `docs/config.js` 里公开的 anon key；绝对不要使用、读取或保存 `service_role` 密钥。** 学员由自己注册，没有管理员；要看学员名单只能在 Supabase 控制台。

## 2. 目录
- `docs/` 网站（发布内容）：`index.html`、`app.js`（单页应用）、`golf3d.js`（3D 引擎）、`three.min.js`、`supabase.js`（自带，不依赖海外 CDN）、`data.js`（由构建生成）、`audio/*.m4a`、`style.css`、`config.js`
- 课程内容（Python）：`curriculum_a/b/c.py`（原 52 节）、`curriculum_d1/d2.py`（新增 42 节，含程序计算的记分示例）、`curriculum.py`（拼装）、`content.py`（辅助）
- `glossary.py`（119 条名词）、`faq.py`（86 条问答）、`videos.py`（视频清单，**页面上已关闭**）、`animations.py`（旧 2D 动图）
- `narration.py` / `narration2.py`：每节课的语音讲稿；`make_audio.py`：用本机 F5「晓晓」合成（需要本机 `~/tts`，免费离线）
- `build.py`：生成 `docs/data.js` 并给 `index.html` 的脚本加版本号（防缓存）
- `tools/motion_check.py`：**3D 动作量化校准工具**（见第 4 节）；`tools/ingest_swing.py`：把真实挥杆视频整理成分解图（未使用）
- `_local/`：本机私有备份（已 `.gitignore`，不在仓库里；新会话拿不到，也不需要）

## 3. 构建与发布
```bash
python3 build.py                      # 改了课程/语音/3D 之后都要跑
git add -A && git commit -m "..." && git push origin main
# Pages 约 1 分钟生效：轮询 https://liugavin18-lgtm.github.io/golf-academy/index.html 里是否出现新的 app.js?v=xxxx
```
改语音：`python3 make_audio.py <课程id>`（只重做指定的，约 40 秒/节；不带参数只补缺的）。
验证线上请用内置浏览器打开页面后用 `javascript_tool` 取数；本机 `localhost` 在内置浏览器里打不开。

## 4. 3D 引擎（`docs/golf3d.js`）
- 坐标：球在原点；目标方向 +x；球手面向 +z；y 向上。右手持杆者。
- 球杆沿“挥杆平面”转动，用一个角 α 表示（0=准备；90=杆身平行且杆头在手后；约 180=杆近竖直；约 266=杆顶且指向目标；负值=击球后）。
- 动作 = 关键帧数组（`MOTIONS.<名>.keys`），字段：`t`（0–1，总长 `dur` 秒）、`sh`（骨盆平移）、`hipT`/`shT`（髋/肩转，上杆为正）、`tilt`（前倾）、`sb`（侧弯）、`hl/hu/hf`（双手相对准备姿势的偏移）、`a`（α）、`wt`（前脚重心 0–1）。插值用单调三次（PCHIP），不会过冲。
- `solve(t)`：由关键帧算全身姿势；手臂/腿用两段 IK；击球时刻用一个平滑小偏移（`impErr`）让杆头正好经过球（不要把杆头“钉”在球上，那会造成击球处停顿）。
- **手臂长度含手掌**：`BODY.upper=0.31, fore=0.38`（握杆点在手掌中心，不是手腕）。曾因为臂太短够不着球而一路用错误办法凑。
- 精修版（外观、辅助线、数据面板）只开在 `swing-basic`：`GolfViewer.mount(el, key, {polish:true})`；其它课程还是基础版。
- 播放：1 倍速 = 真实时间。

### 校准工具（每次改完动作都跑）
```bash
python3 tools/motion_check.py metrics putt     # 节奏、发力顺序、击球接触、头位置、各位置杆身/手臂仰角
python3 tools/motion_check.py frames putt dtl  # 每个关键位置渲染成图 → tools/out/putt_dtl.jpg（视角 face|dtl|top）
```
需要本机 Google Chrome；`frames` 还需要 Pillow。

## 5. “标准动作”工作流（用户明确要求：标准动作由你负责找到并做出来）
对每个动作：① 用 WebSearch 查标准（时间、节奏、角度、重心、位置定义），记下出处；② 把关键帧按**真实秒数**重建；③ 用 `motion_check.py metrics` 量化对照；④ `frames` 看图；⑤ 改课文，课文里加 `<details class="src">` 折叠框写“有出处的数据”和“只有教练共识、没找到量化文献的数据”，**不要假装都有出处**；⑥ 改语音讲稿并重新合成；⑦ `build.py`、推送、在线上验证。
范例见 `curriculum_a.py` 里 `swing-basic`。

## 6. 现状
**完成（标准化）：** 完整挥杆 `swing` = 标准 P1–P10，上杆 0.78 s : 下杆 0.26 s = 3.00:1；骨盆 0.94 s → 胸廓 1.01 s → 球杆 1.06 s；杆顶肩转 95°/髋转 45°；重心杆顶 30%/击球 78% 前脚；击球杆头偏差 0.0000 m；头在球后 4 cm 内、高度基本不变。
**未标准化（现在是旧版、凭估计做的）：**
- `driver`：由 `swing` 派生，只改了前倾/球位，没有单独查标准。
- `putt`：后摆:下杆≈1.04:1（需要查推杆的标准节奏）。`chip`：1.45:1。`pitch`：1.30:1。三者击球接触已修好（偏差 ≤1 mm），但节奏、摆幅、重心、杆面等都没有对照标准。
**还没有 3D：** 沙坑、低飞球/逆风、混合杆/球道木、倾斜球位（4 种）、左曲/右曲球路、站姿/瞄准/球位、握杆（需要手部模型，最难）。

## 7. 已踩过的坑（别再犯）
1. **AI 生成人物图那条路已废弃**：本机 SDXL+深度图+换脸，生成的教练图手/杆/衣着常出错（甚至肤色短裤），全部作废，没有发布。不要再走。
2. 限制手臂范围时曾写错一行（先 `hand.copy(Lsh)` 再用 `hand.clone().sub(Lsh)` 取方向，方向变零），手被放到了肩膀上。取方向要在复制之前。
3. 之前把“够不到”时往上拽肩膀，导致头在上杆中升高 10 cm。
4. Catmull-Rom 插值会让速度出现波动，已换 PCHIP。
5. 视频（YouTube）在国内不可用，用户说“暂时不做视频，以后再做”：页面上已用 `SHOW_VIDEOS=false` 关闭（`docs/app.js` 顶部），数据仍在 `videos.py`。**不要擅自重新开启或开始视频方案。**
6. 动态加载的脚本要带版本号（`app.js` 里的 `VER`），否则用户浏览器会缓存旧版。

## 8. 用户偏好
- 全程中文；对结论要诚实：量出来的、查到的、凭经验的要分开说。
- 3D 路线已定（用户说“用 3D 吧”）；不要图片/视频方案。
- 动作要“标准”：不是好看就行，要对照出处。
- 公开发布前确认（仓库是公开的）；不要提交密钥或个人信息。
- 额度敏感：按动作开新会话、小步提交，少做无用的探索。

## 9. 下一个任务：推杆标准化
先查并记录出处，再重做 `putt` 的关键帧与课文（`putting`、`putting-stroke`、`putting-speed`、`short-putt` 相关）。要查证的点（不要预设数字）：后摆与前摆的时间比、整个推杆的总时长、杆头速度/加速、肩的摆动与手腕是否固定、杆面角度在击球时的偏差对方向的影响、眼位与球位、重心分布（准备/击球）、头是否保持不动、直线式与弧形轨迹的占比。完成后同样用 `motion_check.py` 量化，补课文里的“数据来源与可信度”折叠框，更新语音，发布并线上验证。
