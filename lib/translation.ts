import { CaptionSegment, TargetLanguage } from "@/types";

const LANGUAGE_MAP: Record<TargetLanguage, string> = {
  english: "en",
  "roman-urdu": "ur-Latn",
  urdu: "ur",
};

export async function translateSegments(
  segments: CaptionSegment[],
  targetLanguage: TargetLanguage
): Promise<CaptionSegment[]> {
  const targetLang = LANGUAGE_MAP[targetLanguage];

  // If target is Urdu, no translation needed
  if (targetLanguage === "urdu") {
    return segments.map((seg) => ({ ...seg, translatedText: seg.text }));
  }

  const texts = segments.map((seg) => seg.text);

  // Batch translate using Google Translate free API
  const url = "https://translate.googleapis.com/translate_a/single";
  const params = new URLSearchParams({
    client: "gtx",
    sl: "ur",
    tl: targetLang,
    dt: "t",
    q: texts.join("\n"),
  });

  const response = await fetch(`${url}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.status}`);
  }

  const data = await response.json();
  const translatedLines = data[0].map((item: [string]) => item[0]);

  return segments.map((seg, i) => ({
    ...seg,
    translatedText: translatedLines[i] || seg.text,
  }));
}
