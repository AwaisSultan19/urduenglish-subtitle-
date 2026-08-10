import { CaptionSegment, CaptionStyleConfig } from "@/types";
import { spawn } from "child_process";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const FFMPEG_PATH = process.platform === "win32"
  ? "C:\\Users\\mrawa\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0-full_build\\bin\\ffmpeg.exe"
  : "ffmpeg";

export async function generateSrt(
  segments: CaptionSegment[],
  useTranslated: boolean = true
): Promise<string> {
  return segments
    .map((seg, i) => {
      const text = useTranslated ? seg.translatedText || seg.text : seg.text;
      const start = formatSrtTime(seg.start);
      const end = formatSrtTime(seg.end);
      return `${i + 1}\n${start} --> ${end}\n${text}\n`;
    })
    .join("\n");
}

export function generateWordLevelSrt(segments: CaptionSegment[]): string {
  let counter = 1;
  const entries: string[] = [];

  for (const seg of segments) {
    const displayText = seg.translatedText || seg.text;
    const words = displayText.split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    const segDuration = seg.end - seg.start;
    const timePerWord = segDuration / words.length;

    for (let wi = 0; wi < words.length; wi++) {
      const wordStart = seg.start + wi * timePerWord;
      const wordEnd = seg.start + (wi + 1) * timePerWord;
      const accumulated = words.slice(0, wi + 1).join(" ");
      entries.push(
        `${counter}\n${formatSrtTime(wordStart)} --> ${formatSrtTime(wordEnd)}\n${accumulated}\n`
      );
      counter++;
    }
  }

  return entries.join("\n");
}

export async function generateVtt(
  segments: CaptionSegment[],
  useTranslated: boolean = true
): Promise<string> {
  const cues = segments
    .map((seg) => {
      const text = useTranslated ? seg.translatedText || seg.text : seg.text;
      const start = formatVttTime(seg.start);
      const end = formatVttTime(seg.end);
      return `${start} --> ${end}\n${text}`;
    })
    .join("\n\n");

  return `WEBVTT\n\n${cues}\n`;
}

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms)}`;
}

function formatVttTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function buildForceStyle(style: CaptionStyleConfig): string {
  const r = parseInt(style.color.slice(1, 3), 16);
  const g = parseInt(style.color.slice(3, 5), 16);
  const b = parseInt(style.color.slice(5, 7), 16);
  const assColor = `&H00${b.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${r.toString(16).padStart(2, "0")}`.toUpperCase();

  let bgR = 0, bgG = 0, bgB = 0, bgAlpha = 128;
  const bgMatch = style.backgroundColor.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (bgMatch) {
    bgR = parseInt(bgMatch[1]);
    bgG = parseInt(bgMatch[2]);
    bgB = parseInt(bgMatch[3]);
    bgAlpha = Math.round((1 - parseFloat(bgMatch[4])) * 255);
  } else if (style.backgroundColor === "transparent") {
    bgAlpha = 255;
  }
  const backColour = `&H${bgAlpha.toString(16).padStart(2, "0")}${bgB.toString(16).padStart(2, "0")}${bgG.toString(16).padStart(2, "0")}${bgR.toString(16).padStart(2, "0")}`.toUpperCase();

  const fontSize = Math.round(style.fontSize * 1.3);
  const fontName = "Arial";

  const posMap: Record<string, string> = {
    top: "6",
    center: "5",
    bottom: "2",
  };
  const alignment = posMap[style.position] || "2";

  const hasBg = style.backgroundColor !== "transparent" && bgAlpha < 255;
  const backStr = hasBg ? `,BackColour=${backColour},BorderStyle=3,OutlineColour=&H00000000,Shadow=0` : `,BorderStyle=1,OutlineColour=&H80000000,Shadow=1`;

  return `FontSize=${fontSize},FontName=${fontName},PrimaryColour=${assColor},Alignment=${alignment},MarginV=20,Outline=1${backStr}`;
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG_PATH, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    proc.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${stderr.slice(-500)}`));
    });
    proc.on("error", reject);
  });
}

export async function burnSubtitlesIntoVideo(
  videoUrl: string,
  segments: CaptionSegment[],
  style: CaptionStyleConfig
): Promise<Buffer> {
  const id = randomUUID();
  const tmpDir = tmpdir();
  const inputPath = join(tmpDir, `input_${id}.mp4`);
  const srtPath = join(tmpDir, `subs_${id}.srt`);
  const outputPath = join(tmpDir, `output_${id}.mp4`);

  try {
    const srtContent = generateWordLevelSrt(segments);
    await writeFile(srtPath, srtContent, "utf-8");

    const videoRes = await fetch(videoUrl, {
      signal: AbortSignal.timeout(120000),
    });
    if (!videoRes.ok) throw new Error("Failed to download video from storage");
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    await writeFile(inputPath, videoBuffer);

    const srtForwardSlash = srtPath.replace(/\\/g, "/").replace(/:/g, "\\:");
    const forceStyle = buildForceStyle(style);
    const vf = `subtitles='${srtForwardSlash}':force_style='${forceStyle}'`;

    await runFfmpeg([
      "-y",
      "-i", inputPath,
      "-vf", vf,
      "-c:v", "libx264",
      "-preset", "fast",
      "-crf", "23",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      outputPath,
    ]);

    const outputBuffer = await readFile(outputPath);
    return outputBuffer;
  } finally {
    for (const f of [inputPath, srtPath, outputPath]) {
      await unlink(f).catch(() => {});
    }
  }
}

export { formatSrtTime as formatTime };
