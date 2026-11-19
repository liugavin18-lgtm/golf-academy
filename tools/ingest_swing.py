"""把一段真实的挥杆视频，整理成站内“逐帧分解”图。两步：
  1) 预览：python3 ingest_swing.py preview 视频.mp4 [--start 秒] [--end 秒] [--n 40]
     → 生成 preview/ 下的编号帧 + contact.jpg 总览图，用来挑出 10 个关键位置（准备、上杆腰高、手臂平行、杆顶、转换、下杆腰高、击球、送杆、随挥、收杆）
  2) 入库：python3 ingest_swing.py pick 视频.mp4 --motion swing --view face --frames 0.1,1.2,... [--crop x:y:w:h]
     → 按给定秒数截帧，裁成 3:4，缩到 720x960，存为 docs/coach/swing_01_face.jpg … （网站会自动识别并显示成可切换的分解图）
动作名：swing / putt / chip / pitch；视角：face（正面）/ dtl（背面）。只对有使用权、且画面人物已同意公开的素材使用。"""
import argparse, subprocess, sys, os, json
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parent.parent
def dur(v):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", v], capture_output=True, text=True); return float(r.stdout.strip())
def grab(v, t, out):
    t = max(0.0, min(t, dur(v) - 0.08))   # 避免取到视频末尾之外
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t:.3f}", "-i", v, "-frames:v", "1", "-q:v", "2", "-pix_fmt", "yuvj420p", "-strict", "unofficial", str(out)], check=True)
def preview(a):
    d = Path("preview"); d.mkdir(exist_ok=True); [f.unlink() for f in d.glob("*.jpg")]
    t0, t1 = a.start, a.end or dur(a.video); ts = [t0 + (t1 - t0) * i / (a.n - 1) for i in range(a.n)]
    ims = []
    for i, t in enumerate(ts):
        p = d / f"{i:02d}_{t:.2f}s.jpg"; grab(a.video, t, p); ims.append((t, Image.open(p).convert("RGB")))
    w, h = ims[0][1].size; s = 320 / w; tw, th = 320, int(h * s); cols = 8; rows = (len(ims) + cols - 1) // cols
    from PIL import ImageDraw
    S = Image.new("RGB", (tw * cols, th * rows), "white"); dr = ImageDraw.Draw(S)
    for i, (t, im) in enumerate(ims):
        S.paste(im.resize((tw, th)), ((i % cols) * tw, (i // cols) * th)); dr.rectangle([(i % cols) * tw, (i // cols) * th, (i % cols) * tw + 92, (i // cols) * th + 16], fill="black"); dr.text(((i % cols) * tw + 3, (i // cols) * th + 2), f"{t:.2f}s", fill="white")
    S.save("contact.jpg", quality=88); print("已生成 contact.jpg 和 preview/，共", len(ims), "帧，视频时长 %.2fs" % dur(a.video))
def pick(a):
    out = ROOT / "docs" / "coach"; out.mkdir(parents=True, exist_ok=True); tmp = Path("preview"); tmp.mkdir(exist_ok=True)
    for i, t in enumerate([float(x) for x in a.frames.split(",")], 1):
        p = tmp / "pick.jpg"; grab(a.video, t, p); im = Image.open(p).convert("RGB"); W, H = im.size
        if a.crop: x, y, w, h = [int(float(v)) for v in a.crop.split(":")]
        else: h = H; w = int(H * 3 / 4); x = (W - w) // 2; y = 0
        im = im.crop((x, y, x + w, y + h)); im.thumbnail((720, 960)); im.save(out / f"{a.motion}_{i:02d}_{a.view}.jpg", quality=86, optimize=True); print("已保存", f"{a.motion}_{i:02d}_{a.view}.jpg")
if __name__ == "__main__":
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest="cmd", required=True)
    p1 = sp.add_parser("preview"); p1.add_argument("video"); p1.add_argument("--start", type=float, default=0); p1.add_argument("--end", type=float); p1.add_argument("--n", type=int, default=40)
    p2 = sp.add_parser("pick"); p2.add_argument("video"); p2.add_argument("--motion", required=True); p2.add_argument("--view", required=True, choices=["face", "dtl"]); p2.add_argument("--frames", required=True); p2.add_argument("--crop")
    a = ap.parse_args(); (preview if a.cmd == "preview" else pick)(a)
