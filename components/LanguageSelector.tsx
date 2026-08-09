"use client";

import { TargetLanguage } from "@/types";

interface LanguageSelectorProps {
  value: TargetLanguage;
  onChange: (lang: TargetLanguage) => void;
  disabled?: boolean;
}

const languages: { value: TargetLanguage; label: string; flag: string }[] = [
  { value: "english", label: "English", flag: "EN" },
  { value: "roman-urdu", label: "Roman Urdu", flag: "RU" },
  { value: "urdu", label: "Urdu", flag: "UR" },
];

export default function LanguageSelector({
  value,
  onChange,
  disabled,
}: LanguageSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        Target Language
      </label>
      <div className="grid grid-cols-3 gap-2">
        {languages.map((lang) => (
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
  );
}
