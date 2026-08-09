import { CaptionSegment, CaptionStyleConfig } from "@/types";

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

export { formatSrtTime as formatTime };
