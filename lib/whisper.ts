import { CaptionSegment, SourceLanguage, WordTiming } from "@/types";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SOURCE_LANG_MAP: Record<SourceLanguage, string> = {
  urdu: "ur",
  hinglish: "ur",
  english: "en",
  auto: "",
};

export async function transcribeAudio(
  videoBuffer: Buffer,
  fileName: string,
  sourceLanguage: SourceLanguage = "urdu"
): Promise<CaptionSegment[]> {
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

  const langCode = SOURCE_LANG_MAP[sourceLanguage];
  if (langCode) {
    formData.append("language", langCode);
  }

  console.log("[Whisper] Calling Groq API, language:", langCode || "auto");

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

  const wordTimings: WordTiming[] = [];
  if (data.words && Array.isArray(data.words)) {
    for (const w of data.words) {
      wordTimings.push({
        word: w.word,
        start: w.start,
        end: w.end,
      });
    }
  }

  if (wordTimings.length === 0) {
    const words = fullText.split(/\s+/).filter(Boolean);
    const timePerWord = duration / Math.max(words.length, 1);
    for (let i = 0; i < words.length; i++) {
      wordTimings.push({
        word: words[i],
        start: i * timePerWord,
        end: (i + 1) * timePerWord,
      });
    }
  }

  const chunks = createSmartChunks(wordTimings, duration);

  console.log("[Whisper] Created", chunks.length, "caption chunks with word timings");
  return chunks;
}

const MAX_CHARS_PER_LINE = 40;
const PUNCTUATION_BREAK = /[،,\.!\?؛]/;

function createSmartChunks(words: WordTiming[], duration: number): CaptionSegment[] {
  if (words.length === 0) return [];

  const chunks: CaptionSegment[] = [];
  let currentWords: WordTiming[] = [];
  let currentText = "";

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const potentialText = currentText ? `${currentText} ${w.word}` : w.word;

    const shouldBreak =
      (currentText.length > 0 && potentialText.length >= MAX_CHARS_PER_LINE) ||
      (currentText.length > 0 && PUNCTUATION_BREAK.test(w.word)) ||
      i === words.length - 1;

    if (shouldBreak) {
      if (currentWords.length > 0) {
        const lastWord = currentWords[currentWords.length - 1];
        const text = currentText || w.word;

        if (i === words.length - 1 && !currentText) {
          currentWords.push(w);
        }

        chunks.push({
          id: String(chunks.length + 1),
          start: currentWords[0].start,
          end: currentWords[currentWords.length - 1].end,
          text: text,
          words: currentWords.map((cw) => ({ ...cw })),
        });
      } else {
        chunks.push({
          id: String(chunks.length + 1),
          start: w.start,
          end: w.end,
          text: w.word,
          words: [{ ...w }],
        });
      }

      currentWords = [];
      currentText = "";
    } else {
      currentWords.push(w);
      currentText = potentialText;
    }
  }

  return chunks;
}
