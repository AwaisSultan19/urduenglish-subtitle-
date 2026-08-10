"use client";

import { TargetLanguage, SourceLanguage } from "@/types";

interface LanguageSelectorProps {
  value: TargetLanguage;
  onChange: (lang: TargetLanguage) => void;
  sourceLanguage: SourceLanguage;
  onSourceLanguageChange: (lang: SourceLanguage) => void;
  disabled?: boolean;
}

const targetLanguages: { value: TargetLanguage; label: string; flag: string }[] = [
  { value: "english", label: "English", flag: "EN" },
  { value: "roman-urdu", label: "Roman Urdu", flag: "RU" },
  { value: "urdu", label: "Urdu", flag: "UR" },
];

const sourceLanguages: { value: SourceLanguage; label: string }[] = [
  { value: "urdu", label: "Urdu" },
  { value: "hinglish", label: "Hinglish" },
  { value: "auto", label: "Auto Detect" },
];

export default function LanguageSelector({
  value,
  onChange,
  sourceLanguage,
  onSourceLanguageChange,
  disabled,
}: LanguageSelectorProps) {
  return (
    <div className="w-full space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Audio Language
        </label>
        <div className="grid grid-cols-3 gap-2">
          {sourceLanguages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onSourceLanguageChange(lang.value)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-150 ${
                sourceLanguage === lang.value
                  ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                  : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <span className="text-xs font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Translate To
        </label>
        <div className="grid grid-cols-3 gap-2">
          {targetLanguages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onChange(lang.value)}
              disabled={disabled}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-150 ${
                value === lang.value
                  ? "border-violet-500 bg-violet-500/15 text-violet-300"
                  : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
              } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
              <span className="text-lg font-bold">{lang.flag}</span>
              <span className="text-xs font-medium">{lang.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
