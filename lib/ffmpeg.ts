import { CaptionSegment, CaptionStyleConfig } from "@/types";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

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

function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function buildForceStyle(style: CaptionStyleConfig): string {
  const r = parseInt(style.color.slice(1, 3), 16);
  const g = parseInt(style.color.slice(3, 5), 16);
  const b = parseInt(style.color.slice(5, 7), 16);
  const assColor = `^&H00${b.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${r.toString(16).padStart(2, "0")}`.toUpperCase();

  const fontSize = Math.round(style.fontSize * 1.5);
  const fontName = "Arial";

  const posMap: Record<string, string> = {
    top: "6",
    center: "5",
    bottom: "2",
  };
  const alignment = posMap[style.position] || "2";

  return `FontSize=${fontSize},FontName=${fontName},PrimaryColour=${assColor},Alignment=${alignment},MarginV=30,Outline=2,Shadow=1`;
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
  const batPath = join(tmpDir, `ffmpeg_${id}.bat`);

  try {
    const srtContent = await generateSrt(segments, true);
    await writeFile(srtPath, srtContent, "utf-8");

    const videoRes = await fetch(videoUrl, {
      signal: AbortSignal.timeout(120000),
    });
    if (!videoRes.ok) throw new Error("Failed to download video from storage");
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    await writeFile(inputPath, videoBuffer);

    const srtForwardSlash = srtPath.replace(/\\/g, "/").replace(/:/g, "\\:");
    const forceStyle = buildForceStyle(style);
    const filter = `subtitles='${srtForwardSlash}':force_style='${forceStyle}'`;

    const batLine = `"${FFMPEG_PATH}" -y -i "${inputPath}" -vf "${filter}" -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "${outputPath}"`;

    await writeFile(batPath, batLine, "ascii");
    await execAsync(`cmd /c "${batPath}"`, { timeout: 300000 });

    const outputBuffer = await readFile(outputPath);
    return outputBuffer;
  } finally {
    for (const f of [inputPath, srtPath, outputPath, batPath]) {
      await unlink(f).catch(() => {});
    }
  }
}

export { formatSrtTime as formatTime };
