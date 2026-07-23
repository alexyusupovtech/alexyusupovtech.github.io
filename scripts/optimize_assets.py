#!/usr/bin/env python3
"""
Optimize whatever you've dropped into the asset folders so the site stays fast
and every file "just works" — regardless of name, size, or format.

What it does (idempotent — safe to run as often as you like):
  • Videos  -> web-friendly H.264 / yuv420p MP4, +faststart, compressed.
  • Images  -> WebP, downscaled if huge. (SVGs and GIFs are left as-is.)
  • Filenames -> only cleaned when they contain spaces/symbols that can break
                 in a browser (clean names are left exactly as they are).
Already-optimized files are skipped, so re-runs are quick.

Run it with:  npm run optimize
Needs: Python + Pillow, and ffmpeg on PATH (both already installed).
"""
import json
import os
import re
import subprocess
import sys
from shutil import which

try:
    from PIL import Image
except ImportError:
    print("Pillow is not installed. Run:  py -m pip install pillow")
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")

RASTER_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff", ".avif"}
LEAVE_ALONE = {".svg", ".gif"}  # served as-is (vector / animated)
VIDEO_EXT = {".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v", ".ogv", ".wmv", ".flv"}

MAX_IMG_W = 3840
IMG_QUALITY = 82
IMG_HEAVY_BYTES = 1_200_000
VIDEO_MAX_MB = 45  # only re-compress videos bigger than this (avoids re-encoding already-web-sized clips every run)
VIDEO_CRF = 24


def clean_stem(stem):
    """Keep letters/digits/_/-/. as-is; turn everything else (spaces, symbols,
    non-ASCII) into hyphens. Preserves case so URLs stay predictable."""
    s = re.sub(r"[^A-Za-z0-9\-_.]+", "-", stem)
    s = re.sub(r"-+", "-", s).strip("-._")
    return s or "asset"


def path_eq(a, b):
    return os.path.normcase(os.path.abspath(a)) == os.path.normcase(os.path.abspath(b))


def unique_path(folder, stem, ext, exclude=None):
    cand = os.path.join(folder, stem + ext)
    i = 2
    while os.path.exists(cand) and not (exclude and path_eq(cand, exclude)):
        cand = os.path.join(folder, f"{stem}-{i}{ext}")
        i += 1
    return cand


def try_fs(fn, *a):
    try:
        fn(*a)
        return True
    except OSError as e:
        print(f"    ! could not update a file (in use? OneDrive sync?): {e}")
        return False


def clean_name(path, folder, ext):
    """Rename only if the current name actually needs cleaning."""
    base = os.path.basename(path)
    stem = os.path.splitext(base)[0]
    want_stem = clean_stem(stem)
    if want_stem + ext == base:
        return path  # already clean — leave it alone
    target = unique_path(folder, want_stem, ext, exclude=path)
    if try_fs(os.rename, path, target):
        print(f"    renamed  {base}  ->  {os.path.basename(target)}")
        return target
    return path


def probe_video(path):
    if not which("ffprobe"):
        return None, None
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=codec_name,pix_fmt", "-of", "json", path],
            capture_output=True, text=True)
        st = json.loads(out.stdout)["streams"][0]
        return st.get("codec_name"), st.get("pix_fmt")
    except Exception:
        return None, None


def optimize_image(path, folder):
    base = os.path.basename(path)
    stem, ext = os.path.splitext(base)
    ext = ext.lower()
    size = os.path.getsize(path)
    converted = None
    target = unique_path(folder, clean_stem(stem), ".webp", exclude=path)
    try:
        with Image.open(path) as im0:
            w, h = im0.size
            need_resize = w > MAX_IMG_W
            already_ok = (ext == ".webp" and not need_resize and size <= IMG_HEAVY_BYTES)
            if not already_ok:
                im = im0.convert("RGBA") if im0.mode in ("P", "RGBA", "LA") else im0.convert("RGB")
                if need_resize:
                    im = im.resize((MAX_IMG_W, round(h * MAX_IMG_W / w)), Image.LANCZOS)
                converted = target + ".tmp"
                im.save(converted, "WEBP", quality=IMG_QUALITY, method=6)
    except Exception as e:
        print(f"    ! skip (can't read): {base} ({e})")
        return
    if converted is None:
        clean_name(path, folder, ".webp")  # already optimized; just tidy the name
        return
    if not path_eq(path, target):
        try_fs(os.remove, path)
    if try_fs(os.replace, converted, target):
        print(f"    image    {base}  ->  {os.path.basename(target)}  "
              f"({size/1024/1024:.2f}MB -> {os.path.getsize(target)/1024/1024:.2f}MB)")


def optimize_video(path, folder):
    base = os.path.basename(path)
    stem, ext = os.path.splitext(base)
    ext = ext.lower()
    size_mb = os.path.getsize(path) / 1024 / 1024
    codec, pix = probe_video(path)
    if codec == "h264" and pix == "yuv420p" and size_mb <= VIDEO_MAX_MB:
        clean_name(path, folder, ".mp4")  # already fine
        return
    if not which("ffmpeg"):
        print(f"    ! ffmpeg not found — leaving {base} as-is")
        clean_name(path, folder, ext)
        return
    target = unique_path(folder, clean_stem(stem), ".mp4", exclude=path)
    tmp = target + ".tmp.mp4"
    r = subprocess.run(
        ["ffmpeg", "-y", "-i", path, "-c:v", "libx264", "-preset", "medium",
         "-crf", str(VIDEO_CRF), "-pix_fmt", "yuv420p", "-movflags", "+faststart",
         "-c:a", "aac", "-b:a", "128k", tmp],
        capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(tmp):
        print(f"    ! transcode failed: {base}")
        return
    if not path_eq(path, target):
        try_fs(os.remove, path)
    if try_fs(os.replace, tmp, target):
        print(f"    video    {base}  ->  {os.path.basename(target)}  "
              f"({size_mb:.1f}MB -> {os.path.getsize(target)/1024/1024:.1f}MB)")


def target_dirs():
    dirs = []
    for name in ("hero", "brand", "bg"):
        p = os.path.join(ASSETS, name)
        if os.path.isdir(p):
            dirs.append(p)
    work = os.path.join(ASSETS, "work")
    if os.path.isdir(work):
        for d in sorted(os.listdir(work)):
            fp = os.path.join(work, d)
            if os.path.isdir(fp):
                dirs.append(fp)
    return dirs


def main():
    if not which("ffmpeg"):
        print("Note: ffmpeg not on PATH — videos will be left untouched.\n")
    for folder in target_dirs():
        entries = [f for f in sorted(os.listdir(folder)) if not f.startswith(("_", "."))]
        media = [f for f in entries
                 if os.path.splitext(f)[1].lower() in RASTER_EXT | VIDEO_EXT | LEAVE_ALONE]
        if not media:
            continue
        print(f"[{os.path.relpath(folder, ROOT)}]")
        for f in media:
            path = os.path.join(folder, f)
            ext = os.path.splitext(f)[1].lower()
            if ext in VIDEO_EXT:
                optimize_video(path, folder)
            elif ext in LEAVE_ALONE:
                clean_name(path, folder, ext)
            else:
                optimize_image(path, folder)
    print("\nDone. Refresh the site to see changes.")


if __name__ == "__main__":
    main()
