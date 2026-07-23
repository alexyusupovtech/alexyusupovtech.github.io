// ============================================================
// Auto-discovers media files dropped into the assets folders.
// Runs at build time (and on every dev reload), so dropping a file
// into a folder makes it appear on the site — no code changes needed.
// ============================================================
import fs from "node:fs";
import path from "node:path";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogv"]);

export type MediaItem = {
  src: string;
  type: "image" | "video";
  name: string;
};

function listDir(absDir: string, urlBase: string): MediaItem[] {
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(absDir);
  } catch {
    return []; // folder missing/empty — that's fine
  }
  return entries
    .filter((f) => !f.startsWith("_") && !f.startsWith(".")) // skip readme/marker + hidden
    .map((f) => ({ f, ext: path.extname(f).toLowerCase() }))
    .filter(({ ext }) => IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext))
    .sort((a, b) => a.f.localeCompare(b.f, undefined, { numeric: true, sensitivity: "base" }))
    .map(({ f, ext }) => ({
      src: `${urlBase}/${encodeURIComponent(f)}`,
      type: VIDEO_EXT.has(ext) ? ("video" as const) : ("image" as const),
      name: f.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
    }));
}

/** All media for a discipline, e.g. getWorkMedia("Graphic-Design"). */
export function getWorkMedia(folder: string): MediaItem[] {
  return listDir(path.join(process.cwd(), "assets", "work", folder), `/work/${folder}`);
}

/** First video in assets/hero, used as the splash background. */
export function getHeroVideo(): string | null {
  const items = listDir(path.join(process.cwd(), "assets", "hero"), "/hero");
  return items.find((i) => i.type === "video")?.src ?? null;
}

/** First image in assets/brand, used as the top-left profile/logo. */
export function getProfileImage(): string | null {
  const items = listDir(path.join(process.cwd(), "assets", "brand"), "/brand");
  return items.find((i) => i.type === "image")?.src ?? null;
}

/** First image in assets/bg, used as the full-page starfield background. */
export function getBackgroundImage(): string | null {
  const items = listDir(path.join(process.cwd(), "assets", "bg"), "/bg");
  return items.find((i) => i.type === "image")?.src ?? null;
}

export type YouTubeItem = { id: string; title: string };

function parseYouTubeId(s: string): string | null {
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/live\/([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Reads assets/work/<folder>/videos.txt — one YouTube link per line
 * (optionally "Title | https://youtu.be/..."). Lines starting with # are ignored.
 */
export function getYouTubeVideos(folder: string): YouTubeItem[] {
  const file = path.join(process.cwd(), "assets", "work", folder, "videos.txt");
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return [];
  }
  const items: YouTubeItem[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    let title = "";
    let urlPart = line;
    if (line.includes("|")) {
      const [t, ...rest] = line.split("|");
      title = t.trim();
      urlPart = rest.join("|").trim();
    }
    const id = parseYouTubeId(urlPart);
    if (id) items.push({ id, title });
  }
  return items;
}
