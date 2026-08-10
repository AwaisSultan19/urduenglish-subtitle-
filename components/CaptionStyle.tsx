"use client";

import { SubtitleStyle, SubtitlePreset, SubtitleAnimation } from "@/types";
import { SUBTITLE_PRESETS } from "@/lib/subtitle-style";

interface CaptionStyleProps {
  value: SubtitleStyle;
  onChange: (style: SubtitleStyle) => void;
  disabled?: boolean;
}

const presets: { value: SubtitlePreset; label: string; desc: string }[] = [
  { value: "clean", label: "Clean", desc: "White text, subtle shadow" },
  { value: "bold", label: "Bold", desc: "Large bold, strong outline" },
  { value: "highlight", label: "Highlight", desc: "Active word highlighted" },
  { value: "box", label: "Box", desc: "Dark rounded background" },
  { value: "minimal", label: "Minimal", desc: "Small elegant text" },
];

const animations: { value: SubtitleAnimation; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
];

export default function CaptionStyle({
  value,
  onChange,
  disabled,
}: CaptionStyleProps) {
  const onPresetChange = (preset: SubtitlePreset) => {
    onChange({ ...SUBTITLE_PRESETS[preset] });
  };

  return (
    <div className="w-full space-y-4">
      <label className="block text-sm font-medium text-zinc-300">
        Style
      </label>

      <div className="flex gap-2">
        {presets.map((p) => (
          <button
            key={p.value}
            onClick={() => onPresetChange(p.value)}
            disabled={disabled}
            title={p.desc}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
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
            min="14"
            max="36"
            value={value.fontSize}
            onChange={(e) => onChange({ ...value, fontSize: Number(e.target.value) })}
            disabled={disabled}
            className="w-full accent-violet-500"
          />
          <span className="text-xs text-zinc-600">{value.fontSize}px</span>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Position</label>
          <select
            value={value.position}
            onChange={(e) => onChange({ ...value, position: e.target.value as SubtitleStyle["position"] })}
            disabled={disabled}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:border-violet-500 outline-none"
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Color</label>
          <input
            type="color"
            value={value.color}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
            disabled={disabled}
            className="w-full h-8 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs text-zinc-500 mb-1">Animation</label>
          <div className="flex gap-1">
            {animations.map((anim) => (
              <button
                key={anim.value}
                onClick={() => onChange({ ...value, animation: anim.value })}
                disabled={disabled}
                className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all text-center ${
                  value.animation === anim.value
                    ? "border-violet-500 bg-violet-500/15 text-violet-300"
                    : "border-zinc-700 bg-zinc-900/50 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300"
                } ${disabled ? "pointer-events-none opacity-50" : ""}`}
              >
                {anim.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <details className="group">
        <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition-colors select-none">
          Advanced
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Outline</label>
            <input
              type="range"
              min="0"
              max="4"
              value={value.outlineWidth}
              onChange={(e) => onChange({ ...value, outlineWidth: Number(e.target.value) })}
              disabled={disabled}
              className="w-full accent-violet-500"
            />
            <span className="text-xs text-zinc-600">{value.outlineWidth}px</span>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Shadow</label>
            <input
              type="range"
              min="0"
              max="10"
              value={value.shadowBlur}
              onChange={(e) => onChange({ ...value, shadowBlur: Number(e.target.value) })}
              disabled={disabled}
              className="w-full accent-violet-500"
            />
            <span className="text-xs text-zinc-600">{value.shadowBlur}px</span>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Bg Opacity</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(value.backgroundOpacity * 100)}
              onChange={(e) => onChange({ ...value, backgroundOpacity: Number(e.target.value) / 100 })}
              disabled={disabled}
              className="w-full accent-violet-500"
            />
            <span className="text-xs text-zinc-600">{Math.round(value.backgroundOpacity * 100)}%</span>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Bottom Margin</label>
            <input
              type="range"
              min="20"
              max="120"
              value={value.marginBottom}
              onChange={(e) => onChange({ ...value, marginBottom: Number(e.target.value) })}
              disabled={disabled}
              className="w-full accent-violet-500"
            />
            <span className="text-xs text-zinc-600">{value.marginBottom}px</span>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Highlight Color</label>
            <input
              type="color"
              value={value.activeWordColor}
              onChange={(e) => onChange({ ...value, activeWordColor: e.target.value })}
              disabled={disabled}
              className="w-full h-8 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Outline Color</label>
            <input
              type="color"
              value={value.outlineColor === "transparent" ? "#000000" : value.outlineColor}
              onChange={(e) => onChange({ ...value, outlineColor: e.target.value })}
              disabled={disabled}
              className="w-full h-8 rounded-lg border border-zinc-700 bg-zinc-900 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Weight</label>
            <select
              value={value.fontWeight}
              onChange={(e) => onChange({ ...value, fontWeight: Number(e.target.value) })}
              disabled={disabled}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:border-violet-500 outline-none"
            >
              <option value={400}>Regular</option>
              <option value={500}>Medium</option>
              <option value={600}>Semi Bold</option>
              <option value={700}>Bold</option>
              <option value={900}>Black</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Letter Spacing</label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={value.letterSpacing}
              onChange={(e) => onChange({ ...value, letterSpacing: Number(e.target.value) })}
              disabled={disabled}
              className="w-full accent-violet-500"
            />
            <span className="text-xs text-zinc-600">{value.letterSpacing}px</span>
          </div>
        </div>
      </details>
    </div>
  );
}
