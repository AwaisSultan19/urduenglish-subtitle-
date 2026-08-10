import { CaptionSegment, TargetLanguage } from "@/types";

function isUrdu(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function containsMixedLanguages(text: string): boolean {
  return isUrdu(text) && /[a-zA-Z]/.test(text);
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
      if (currentChunk) segments.push({ text: currentChunk, lang: currentLang });
      currentChunk = word;
      currentLang = wordLang;
    }
  }
  if (currentChunk) segments.push({ text: currentChunk, lang: currentLang! });
  return segments;
}

const URDU_CHAR_MAP: Record<string, string> = {
  "آ": "aa", "أ": "a", "ا": "a", "ب": "b", "بھ": "bh",
  "پ": "p", "پھ": "ph", "ت": "t", "تھ": "th", "ٹ": "t",
  "ٹھ": "th", "ث": "s", "ج": "j", "جھ": "jh", "چ": "ch",
  "چھ": "chh", "ح": "h", "خ": "kh", "د": "d", "دھ": "dh",
  "ڈ": "d", "ڈھ": "dh", "ذ": "z", "ر": "r", "ڑ": "r",
  "ز": "z", "ژ": "zh", "س": "s", "ش": "sh", "ص": "s",
  "ض": "z", "ط": "t", "ظ": "z", "ع": "", "غ": "gh",
  "ف": "f", "ق": "q", "ک": "k", "کھ": "kh", "گ": "g",
  "گھ": "gh", "ل": "l", "م": "m", "ن": "n", "ں": "n",
  "و": "u", "ہ": "h", "ھ": "h", "ء": "", "ی": "y",
  "ے": "e", "۔": ".", "،": ",", "؟": "?",
};

const WORD_MAP: Record<string, string> = {
  "میں": "main", "ہم": "hum", "تم": "tum", "آپ": "aap",
  "وہ": "wo", "یہ": "ye", "یہاں": "yahan", "وہاں": "wahan",
  "مجھے": "mujhe", "ہمیں": "hame", "تمہیں": "tumhe",
  "آپکو": "aapko", "انہیں": "unhe", "اسے": "ise",
  "ہے": "hai", "ہیں": "hain", "ہوں": "hoon", "ہو": "ho",
  "تھا": "tha", "تھی": "thi", "تھے": "the",
  "ہوگا": "hoga", "ہوگی": "hogi", "ہوگے": "hoge",
  "کر": "kar", "کرتا": "karta", "کرتی": "karti", "کرتے": "karte",
  "کیا": "kiya", "کرنا": "karna", "کرنی": "karni", "کرنے": "karne",
  "جاتا": "jata", "جاتی": "jati", "جاتے": "jate",
  "گیا": "gaya", "گئی": "gai", "گئے": "gae",
  "جانا": "jana", "جانے": "jane",
  "آتا": "aata", "آتی": "aati", "آتے": "aate",
  "آیا": "aaya", "آئی": "aai", "آنا": "aana", "آنے": "aane",
  "دیکھتا": "dekhta", "دیکھتی": "dekhthi", "دیکھتے": "dekhte",
  "دیکھا": "dekha", "دیکھی": "dekhi", "دیکھنا": "dekhna",
  "بولتا": "bolta", "بولتی": "bolti", "بولتے": "bolte",
  "بولنا": "bolna", "کہتا": "kehta", "کہتی": "kehti", "کہتے": "kehte",
  "کہا": "kaha", "کہنا": "kehna",
  "کھاتا": "khata", "کھاتی": "khati", "کھاتے": "khaate",
  "کھایا": "khaya", "کھانا": "khana",
  "پیتا": "peeta", "پیتی": "peeti", "پیا": "piya", "پینا": "peena",
  "دیتا": "deta", "دیتی": "deti", "دیتے": "dete",
  "دیا": "diya", "دینا": "dena", "دینے": "dene",
  "لیتا": "leta", "لیتی": "leti", "لیتے": "lete",
  "لیا": "liya", "لینا": "lena", "لینے": "lene",
  "جانتا": "janta", "جانتی": "janti", "جانتے": "jante",
  "چاہتا": "chahta", "چاہتی": "chahti", "چاہتے": "chahte",
  "چاہنا": "chahna",
  "سوچتا": "sochta", "سوچتی": "sochti", "سوچتے": "sochte", "سوچنا": "sochna",
  "اچھا": "acha", "اچھی": "achi", "اچھے": "ache",
  "برا": "bura", "بری": "buri", "برے": "bure",
  "بڑا": "bada", "بڑی": "badi", "بڑے": "bade",
  "چھوٹا": "chota", "چھوٹی": "chhoti", "چھوٹے": "chhote",
  "نیا": "naya", "نئی": "nai", "نئے": "nae",
  "پرانا": "purana", "پرانی": "purani", "پرانے": "purane",
  "نام": "naam", "گھر": "ghar", "باہر": "bahar", "اندر": "andar",
  "اوپر": "upar", "نیچے": "neeche", "ساتھ": "sath", "پاس": "pass",
  "دور": "door", "لوگ": "log", "دن": "din",
  "رات": "rat", "صبح": "subah", "شام": "sham", "دوپہر": "doper",
  "ہفتہ": "hafta", "سال": "sal", "وقت": "waqt",
  "دنیا": "duniya", "ملک": "mulk", "شہر": "shehar",
  "پانی": "pani", "راستہ": "rasta",
  "گاڑی": "gari", "سکول": "school", "کالج": "college",
  "دوست": "dost", "بھائی": "bhai", "بہن": "behen",
  "باپ": "baap", "ماں": "maa", "بیٹا": "beta", "بیٹی": "beti",
  "شادی": "shadi", "کام": "kaam", "پیسہ": "paisa",
  "کتاب": "kitab", "موبائل": "mobile", "فون": "phone",
  "کمپیوٹر": "computer", "انٹرنیٹ": "internet",
  "ویڈیو": "video", "آڈیو": "audio", "تصویر": "tasveer",
  "فیلم": "film", "گانا": "gana", "کھیل": "khel",
  "کرکٹ": "cricket", "اور": "aur", "لیکن": "lekin", "پھر": "phir",
  "اس لیے": "is liye", "کیونکہ": "kyunki", "جب": "jab",
  "تو": "to", "بھی": "bhi", "صرف": "sirf", "بس": "bas",
  "اگر": "agar", "یا": "ya", "کا": "ka", "کی": "ki",
  "کے": "ke", "کو": "ko", "سے": "se", "پر": "par",
  "نے": "ne", "کے لیے": "ke liye", "بہت": "bohat",
  "زیادہ": "zyada", "کم": "kam", "اتنا": "itna",
  "کتنا": "kitna", "سب": "sab", "کچھ": "kuch",
  "کوئی": "koi", "نہیں": "nahi", "ہاں": "haan", "نہ": "na",
  "جلدی": "jaldi", "اب": "ab", "ابھی": "abhi", "کل": "kal",
  "آج": "aj", "ہمیشہ": "hamesha", "کبھی": "kabhi", "ہر": "har",
  "راہا": "raha", "رہی": "rahi", "رہے": "rahe",
  "شروع": "shuru", "ختم": "khatam", "ٹھیک": "theek",
  "سمجھ": "samajh", "خوش": "khush", "ناراض": "naraz",
  "پریشان": "pareshan", "بیمار": "bimar", "صحت": "sehat",
  "سخت": "sakht", "نرم": "naram", "گرم": "garam",
  "روشن": "roshan", "سفید": "safed", "کالا": "kala",
  "لال": "lal", "نیلا": "necala", "سبز": "sabz",
  "ایک": "ek", "دو": "do", "تین": "teen", "چار": "char",
  "پانچ": "panch", "چھ": "chh", "سات": "saat", "آٹھ": "aath",
  "نو": "nau", "دس": "das",
  "شکریہ": "shukriya", "معاف": "maaf", "سلام": "salaam",
};

function transliterateWord(word: string): string {
  if (WORD_MAP[word]) return WORD_MAP[word];
  let result = word;
  const sortedKeys = Object.keys(URDU_CHAR_MAP).sort(
    (a, b) => b.length - a.length
  );
  for (const urduChar of sortedKeys) {
    result = result.split(urduChar).join(URDU_CHAR_MAP[urduChar]);
  }
  result = result
    .replace(/(.)\1+/g, "$1")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
  return result;
}

function transliterateUrduToRoman(text: string): string {
  const words = text.split(/\s+/);
  const romanWords = words.map((word) => transliterateWord(word));
  return romanWords.join(" ").replace(/\s+/g, " ").trim();
}

async function translateText(text: string, from: string, to: string): Promise<string> {
  if (from === to) return text;
  const url = "https://translate.googleapis.com/translate_a/single";
  const params = new URLSearchParams({
    client: "gtx", sl: from, tl: to, dt: "t", q: text,
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

export async function translateSegments(
  segments: CaptionSegment[],
  targetLanguage: TargetLanguage
): Promise<CaptionSegment[]> {
  const results: CaptionSegment[] = [];
  for (const seg of segments) {
    if (targetLanguage === "roman-urdu") {
      if (isUrdu(seg.text)) {
        results.push({ ...seg, translatedText: transliterateUrduToRoman(seg.text) });
      } else if (containsMixedLanguages(seg.text)) {
        const parts = splitByLanguage(seg.text);
        const romanParts: string[] = [];
        for (const part of parts) {
          if (part.lang === "ur") {
            romanParts.push(transliterateUrduToRoman(part.text));
          } else {
            romanParts.push(part.text);
          }
        }
        results.push({ ...seg, translatedText: romanParts.join(" ") });
      } else {
        results.push({ ...seg, translatedText: seg.text });
      }
    } else {
      if (isUrdu(seg.text)) {
        const translated = await translateText(seg.text, "ur", "en");
        results.push({ ...seg, translatedText: translated });
      } else if (containsMixedLanguages(seg.text)) {
        const parts = splitByLanguage(seg.text);
        const translatedParts: string[] = [];
        for (const part of parts) {
          if (part.lang === "ur") {
            const translated = await translateText(part.text, "ur", "en");
            translatedParts.push(translated);
          } else {
            translatedParts.push(part.text);
          }
        }
        results.push({ ...seg, translatedText: translatedParts.join(" ") });
      } else {
        results.push({ ...seg, translatedText: seg.text });
      }
    }
  }
  return results;
}
