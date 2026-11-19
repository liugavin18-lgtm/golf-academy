"""用本地 F5-TTS（MLX）「晓晓」音色，把 narration.py 里的讲稿合成为 docs/audio/<课程id>.m4a。
运行：python3 make_audio.py            生成所有还没有的（可断点续跑）
      python3 make_audio.py grip tempo 只生成指定课程（强制重做）
      TTS_ENGINE=say python3 make_audio.py   没有 F5 时用系统语音兜底
免费、离线、数据不出本机。"""
import os, subprocess, sys, tempfile, time
from pathlib import Path
from narration import N
ROOT = Path(__file__).resolve().parent
OUT = ROOT / "docs" / "audio"
TTS_HOME = Path(os.environ.get("TTS_HOME", "~/tts")).expanduser()
TTS_PY = TTS_HOME / "bin" / "tts.py"
VOICE = Path(os.environ.get("TTS_VOICE", TTS_HOME / "voices" / "female_xiaoxiao.wav")).expanduser()
ENGINE = os.environ.get("TTS_ENGINE") or ("f5" if TTS_PY.exists() and VOICE.exists() else "say")

def synth_f5(txt, wav):
    env = {k: v for k, v in os.environ.items() if k.lower() not in ("http_proxy", "https_proxy", "all_proxy")}
    env.update(HF_HUB_OFFLINE="1", TRANSFORMERS_OFFLINE="1", HF_DATASETS_OFFLINE="1")
    subprocess.run(["python3", str(TTS_PY), "--engine", "f5mlx", "--text-file", str(txt), "--voice", str(VOICE), "--out", str(wav)],
                   check=True, capture_output=True, text=True, env=env)

def synth_say(txt, wav):
    subprocess.run(["say", "-v", "Tingting", "-r", "165", "-f", str(txt), "-o", str(wav)], check=True)

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[1:])
    print(f"引擎：{ENGINE}", flush=True)
    todo = [k for k in N if (k in only if only else not (OUT / f"{k}.m4a").exists())]
    for i, k in enumerate(todo, 1):
        t0 = time.time(); target = OUT / f"{k}.m4a"
        with tempfile.TemporaryDirectory() as d:
            src = Path(d) / "in.txt"; src.write_text(N[k], encoding="utf-8"); wav = Path(d) / "a.wav"
            (synth_f5 if ENGINE == "f5" else synth_say)(src, wav)
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-af", "loudnorm=I=-16:TP=-1.5", "-ac", "1", "-ar", "24000",
                            "-c:a", "aac", "-b:a", "48k", "-movflags", "+faststart", str(target)], check=True)
        sec = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(target)],
                                   capture_output=True, text=True).stdout.strip())
        print(f"[{i}/{len(todo)}] {k}  {sec:5.1f}秒  {target.stat().st_size/1024:.0f}KB  用时 {time.time()-t0:.0f}秒", flush=True)

if __name__ == "__main__":
    main()
