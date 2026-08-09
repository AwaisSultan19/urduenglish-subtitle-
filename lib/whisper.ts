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
  const file = new File([blob], `audio.${ext}`, { type: mime });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", "whisper-large-v3");
  formData.append("response_format", "verbose_json");
  formData.append("language", "ur");

  console.log("[Whisper] Calling Groq API...");

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
    body: formData,
  });

  console.log("[Whisper] Response status:", res.status);

  if (!res.ok) {
    const err = await res.text();
    console.error("[Whisper] API error:", res.status, err);
    throw new Error(`Transcription failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  const duration = data.duration || 10;
  const fullText = data.text?.trim() || "";

  console.log("[Whisper] Duration:", duration, "Text length:", fullText.length);

  // Split into phrases (2-4 words each) for word-by-word appearance
  const words = fullText.split(/\s+/).filter(Boolean);
  const phraseSize = 3; // 3 words per caption
  const chunks: CaptionSegment[] = [];

  // Calculate time per word based on total duration
  const timePerWord = duration / Math.max(words.length, 1);

  for (let i = 0; i < words.length; i += phraseSize) {
    const phraseWords = words.slice(i, i + phraseSize);
    const start = i * timePerWord;
    const end = Math.min((i + phraseSize) * timePerWord, duration);

    chunks.push({
      id: String(chunks.length + 1),
      start,
      end,
      text: phraseWords.join(" "),
    });
  }

  console.log("[Whisper] Created", chunks.length, "caption chunks");
  return chunks;
}
