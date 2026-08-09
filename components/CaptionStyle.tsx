"use client";

import { CaptionStyleConfig, CaptionStylePreset } from "@/types";

interface CaptionStyleProps {
  value: CaptionStyleConfig;
  onChange: (style: CaptionStyleConfig) => void;
  disabled?: boolean;
}

const presets: { value: CaptionStylePreset; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "bold", label: "Bold" },
  { value: "cinematic", label: "Cinematic" },
  { value: "minimal", label: "Minimal" },
  { value: "social", label: "Social" },
];

const presetStyles: Record<CaptionStylePreset, Partial<CaptionStyleConfig>> = {
  default: { fontSize: 18, color: "#ffffff", backgroundColor: "rgba(0,0,0,0.7)" },
  bold: { fontSize: 24, color: "#facc15", backgroundColor: "rgba(0,0,0,0.85)" },
  cinematic: { fontSize: 20, color: "#e2e8f0", backgroundColor: "rgba(0,0,0,0.5)" },
  minimal: { fontSize: 16, color: "#d4d4d8", backgroundColor: "transparent" },
  social: { fontSize: 22, color: "#ffffff", backgroundColor: "#6d28d9" },
};

export default function CaptionStyle({
  value,
  onChange,
  disabled,
}: CaptionStyleProps) {
  const onPresetChange = (preset: CaptionStylePreset) => {
    onChange({ ...value, preset, ...presetStyles[preset] });
  };

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-zinc-300">
        Caption Style
      </label>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => onPresetChange(p.value)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              value.preset === p.value
                ? "border-violet-500 bg-violet-500/15 text-violet-300"
                : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500"
            } ${disabled ? "pointer-events-none opacity-50" : ""}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-500 mb-1">Font Size</label>
          <input
            type="range"
            min="12"
            max="36"
            value={value.fontSize}
            onChange={(e) =>
              onChange({ ...value, fontSize: Number(e.target.value) })
            }
            disabled={disabled}
            className="w-full accent-violet-500"
          />
          <span className="text-xs text-zinc-600">{value.fontSize}px</span>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Position</label>
          <select
            value={value.position}
            onChange={(e) =>
              onChange({
                ...value,
                position: e.target.value as CaptionStyleConfig["position"],
              })
            }
            disabled={disabled}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:border-violet-500 outline-none"
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Text Color</label>
          <input
            type="color"
            value={value.color}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
            disabled={disabled}
            className="w-full h-8 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Background</label>
          <input
            type="color"
            value={value.backgroundColor.includes("rgba")
              ? "#000000"
              : value.backgroundColor}
            onChange={(e) => onChange({ ...value, backgroundColor: e.target.value })}
            disabled={disabled}
            className="w-full h-8 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
