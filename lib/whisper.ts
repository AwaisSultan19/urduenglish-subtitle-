import { CaptionSegment } from "@/types";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function transcribeAudio(videoBuffer: Buffer, fileName: string): Promise<CaptionSegment[]> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set. Get one free at https://console.groq.com/keys");
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "mp4";
  const mimeMap: Record<string, string> = {
    mp4: "audio/mp4", webm: "audio/webm", mov: "video/quicktime",
    mp3: "audio/mpeg", wav: "audio/wav", m4a: "audio/mp4",
  };
  const mime = mimeMap[ext] || "audio/mp4";

  const blob = new Blob([new Uint8Array(videoBuffer)], { type: mime });
  const safeName = `audio.${ext}`;
  const file = new File([blob], safeName, { type: mime });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "verbose_json");
  formData.append("timestamp_granularities[]", "segment");
  formData.append("language", "ur");

  console.log("[Whisper] Calling Groq API...");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  });

  console.log("[Whisper] Response status:", res.status);

  if (!res.ok) {
    const err = await res.text();
    console.error("[Whisper] API error:", res.status, err);
    throw new Error(`Transcription failed (${res.status}): ${err}`);
  }

  const data = await res.json();

  if (data.segments) {
    return data.segments.map((seg: { id: number; start: number; end: number; text: string }) => ({
      id: String(seg.id),
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
    }));
  }

  if (data.text) {
    return [{ id: "1", start: 0, end: 10, text: data.text.trim() }];
  }

  throw new Error("Unexpected response format");
}
