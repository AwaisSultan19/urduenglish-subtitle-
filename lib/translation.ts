import { CaptionSegment, TargetLanguage } from "@/types";

const LANGUAGE_MAP: Record<TargetLanguage, string> = {
  english: "en",
  "roman-urdu": "ur-Latn",
  urdu: "ur",
};

function isUrdu(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function isEnglish(text: string): boolean {
  return /[a-zA-Z]/.test(text);
}

function containsMixedLanguages(text: string): boolean {
  return isUrdu(text) && isEnglish(text);
}

function splitByLanguage(text: string): { text: string; lang: "ur" | "en" }[] {
  const segments: { text: string; lang: "ur" | "en" }[] = [];
  const words = text.split(/\s+/);

  let currentChunk = "";
  let currentLang: "ur" | "en" | null = null;

  for (const word of words) {
    const wordLang = isUrdu(word) ? "ur" : "en";

    if (currentLang === null || wordLang === currentLang) {
      currentChunk = currentChunk ? `${currentChunk} ${word}` : word;
      currentLang = wordLang;
    } else {
      if (currentChunk) {
        segments.push({ text: currentChunk, lang: currentLang });
      }
      currentChunk = word;
      currentLang = wordLang;
    }
  }

  if (currentChunk) {
    segments.push({ text: currentChunk, lang: currentLang! });
  }

  return segments;
}

export async function translateSegments(
  segments: CaptionSegment[],
  targetLanguage: TargetLanguage
): Promise<CaptionSegment[]> {
  const targetLang = LANGUAGE_MAP[targetLanguage];

  if (targetLanguage === "urdu") {
    return segments.map((seg) => ({ ...seg, translatedText: seg.text }));
  }

  const results: CaptionSegment[] = [];

  for (const seg of segments) {
    if (!containsMixedLanguages(seg.text)) {
      const translated = await translateText(seg.text, "ur", targetLang);
      results.push({ ...seg, translatedText: translated });
    } else {
      const parts = splitByLanguage(seg.text);
      const translatedParts: string[] = [];

      for (const part of parts) {
        if (part.lang === "en" && targetLanguage === "english") {
          translatedParts.push(part.text);
        } else if (part.lang === "ur") {
          const translated = await translateText(part.text, "ur", targetLang);
          translatedParts.push(translated);
        } else {
          const translated = await translateText(part.text, part.lang, targetLang);
          translatedParts.push(translated);
        }
      }

      results.push({ ...seg, translatedText: translatedParts.join(" ") });
    }
  }

  return results;
}

async function translateText(text: string, from: string, to: string): Promise<string> {
  if (from === to) return text;

  const url = "https://translate.googleapis.com/translate_a/single";
  const params = new URLSearchParams({
    client: "gtx",
    sl: from,
    tl: to,
    dt: "t",
    q: text,
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) return text;

    const data = await response.json();
    return data[0].map((item: [string]) => item[0]).join("");
  } catch {
    return text;
  }
}
