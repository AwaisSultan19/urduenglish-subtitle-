"use client";

import { CaptionStyleConfig, CaptionStylePreset, CaptionAnimation } from "@/types";

interface CaptionStyleProps {
  value: CaptionStyleConfig;
  onChange: (style: CaptionStyleConfig) => void;
  disabled?: boolean;
}

const presets: { value: CaptionStylePreset; label: string; icon: string }[] = [
  { value: "default", label: "Default", icon: "Aa" },
  { value: "bold", label: "Bold", icon: "Bb" },
  { value: "cinematic", label: "Cinematic", icon: "Ci" },
  { value: "minimal", label: "Minimal", icon: "Mi" },
  { value: "social", label: "Social", icon: "So" },
  { value: "tiktok", label: "TikTok", icon: "Tk" },
  { value: "reels", label: "Reels", icon: "Rl" },
  { value: "youtube", label: "YouTube", icon: "Yt" },
  { value: "neon", label: "Neon", icon: "Ne" },
  { value: "glitch", label: "Glitch", icon: "Gl" },
  { value: "karaoke", label: "Karaoke", icon: "Ka" },
];

const presetStyles: Record<CaptionStylePreset, Partial<CaptionStyleConfig>> = {
  default: { fontSize: 18, color: "#ffffff", backgroundColor: "rgba(0,0,0,0.7)", animation: "fade" },
  bold: { fontSize: 24, color: "#facc15", backgroundColor: "rgba(0,0,0,0.85)", animation: "pop" },
  cinematic: { fontSize: 20, color: "#e2e8f0", backgroundColor: "rgba(0,0,0,0.5)", animation: "fade" },
  minimal: { fontSize: 16, color: "#d4d4d8", backgroundColor: "transparent", animation: "none" },
  social: { fontSize: 22, color: "#ffffff", backgroundColor: "#6d28d9", animation: "bounce" },
  tiktok: { fontSize: 26, color: "#ffffff", backgroundColor: "rgba(0,0,0,0.8)", animation: "pop" },
  reels: { fontSize: 24, color: "#ffffff", backgroundColor: "transparent", animation: "slide-up" },
  youtube: { fontSize: 20, color: "#ffffff", backgroundColor: "rgba(18,18,18,0.85)", animation: "slide-up" },
  neon: { fontSize: 22, color: "#00ff88", backgroundColor: "rgba(0,0,0,0.9)", animation: "glow-pulse" },
  glitch: { fontSize: 22, color: "#ff0040", backgroundColor: "rgba(0,0,0,0.85)", animation: "shake" },
  karaoke: { fontSize: 24, color: "#fbbf24", backgroundColor: "rgba(0,0,0,0.8)", animation: "zoom-in" },
};

const animations: { value: CaptionAnimation; label: string; description: string }[] = [
  { value: "none", label: "None", description: "No animation" },
  { value: "fade", label: "Fade", description: "Smooth fade in" },
  { value: "slide-up", label: "Slide Up", description: "Slides up from below" },
  { value: "slide-down", label: "Slide Down", description: "Slides down from above" },
  { value: "pop", label: "Pop", description: "Bouncy pop in" },
  { value: "typewriter", label: "Typewriter", description: "Types out character by character" },
  { value: "bounce", label: "Bounce", description: "Bouncy entrance" },
  { value: "glow-pulse", label: "Glow Pulse", description: "Pulsing neon glow" },
  { value: "zoom-in", label: "Zoom In", description: "Zooms in with blur" },
  { value: "shake", label: "Shake", description: "Shakes on appear" },
];

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

      {/* Preset Buttons */}
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

      {/* Controls Grid */}
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

      {/* Animation Selector */}
      <div>
        <label className="block text-xs text-zinc-500 mb-2">Animation</label>
        <div className="grid grid-cols-5 gap-1.5">
          {animations.map((anim) => (
            <button
              key={anim.value}
              onClick={() => onChange({ ...value, animation: anim.value })}
              disabled={disabled}
              title={anim.description}
              className={`px-2 py-1.5 rounded-md text-[10px] font-medium border transition-all text-center ${
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
  );
}
