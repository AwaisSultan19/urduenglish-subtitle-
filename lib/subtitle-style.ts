import { SubtitleStyle, SubtitlePreset } from "@/types";

export const SUBTITLE_PRESETS: Record<SubtitlePreset, SubtitleStyle> = {
  clean: {
    preset: "clean",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 22,
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: "transparent",
    backgroundOpacity: 0,
    outlineColor: "#000000",
    outlineWidth: 2,
    shadowColor: "rgba(0,0,0,0.6)",
    shadowBlur: 4,
    position: "bottom",
    alignment: "center",
    maxWidth: 85,
    lineHeight: 1.3,
    letterSpacing: 0.5,
    activeWordColor: "#ffffff",
    animation: "fade",
    marginTop: 0,
    marginBottom: 60,
    paddingX: 16,
    paddingY: 6,
    borderRadius: 4,
  },
  bold: {
    preset: "bold",
    fontFamily: "Arial Black, Impact, sans-serif",
    fontSize: 28,
    fontWeight: 900,
    color: "#ffffff",
    backgroundColor: "transparent",
    backgroundOpacity: 0,
    outlineColor: "#000000",
    outlineWidth: 3,
    shadowColor: "rgba(0,0,0,0.8)",
    shadowBlur: 6,
    position: "bottom",
    alignment: "center",
    maxWidth: 85,
    lineHeight: 1.2,
    letterSpacing: 1,
    activeWordColor: "#ffffff",
    animation: "fade",
    marginTop: 0,
    marginBottom: 60,
    paddingX: 16,
    paddingY: 6,
    borderRadius: 4,
  },
  highlight: {
    preset: "highlight",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 22,
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: "transparent",
    backgroundOpacity: 0,
    outlineColor: "#000000",
    outlineWidth: 2,
    shadowColor: "rgba(0,0,0,0.5)",
    shadowBlur: 3,
    position: "bottom",
    alignment: "center",
    maxWidth: 85,
    lineHeight: 1.3,
    letterSpacing: 0.5,
    activeWordColor: "#facc15",
    animation: "fade",
    marginTop: 0,
    marginBottom: 60,
    paddingX: 16,
    paddingY: 6,
    borderRadius: 4,
  },
  box: {
    preset: "box",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 20,
    fontWeight: 600,
    color: "#ffffff",
    backgroundColor: "#000000",
    backgroundOpacity: 0.65,
    outlineColor: "transparent",
    outlineWidth: 0,
    shadowColor: "transparent",
    shadowBlur: 0,
    position: "bottom",
    alignment: "center",
    maxWidth: 85,
    lineHeight: 1.3,
    letterSpacing: 0.5,
    activeWordColor: "#ffffff",
    animation: "fade",
    marginTop: 0,
    marginBottom: 60,
    paddingX: 14,
    paddingY: 8,
    borderRadius: 6,
  },
  minimal: {
    preset: "minimal",
    fontFamily: "Georgia, Times New Roman, serif",
    fontSize: 18,
    fontWeight: 400,
    color: "#e4e4e7",
    backgroundColor: "transparent",
    backgroundOpacity: 0,
    outlineColor: "transparent",
    outlineWidth: 0,
    shadowColor: "rgba(0,0,0,0.4)",
    shadowBlur: 2,
    position: "bottom",
    alignment: "center",
    maxWidth: 80,
    lineHeight: 1.4,
    letterSpacing: 1.5,
    activeWordColor: "#e4e4e7",
    animation: "fade",
    marginTop: 0,
    marginBottom: 60,
    paddingX: 16,
    paddingY: 6,
    borderRadius: 4,
  },
};

export function getSubtitleStyle(preset: SubtitlePreset): SubtitleStyle {
  return { ...SUBTITLE_PRESETS[preset] };
}

export function subtitleStyleToCss(style: SubtitleStyle): React.CSSProperties {
  const bgAlpha = style.backgroundOpacity;
  let bgColor = style.backgroundColor;
  if (bgColor === "transparent" || bgAlpha === 0) {
    bgColor = "transparent";
  } else if (bgColor.startsWith("#")) {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    bgColor = `rgba(${r},${g},${b},${bgAlpha})`;
  }

  const shadows: string[] = [];
  if (style.outlineWidth > 0 && style.outlineColor !== "transparent") {
    const ol = style.outlineColor;
    for (let i = 1; i <= style.outlineWidth; i++) {
      shadows.push(`-${i}px -${i}px 0 ${ol}`, `${i}px -${i}px 0 ${ol}`, `-${i}px ${i}px 0 ${ol}`, `${i}px ${i}px 0 ${ol}`);
    }
  }
  if (style.shadowBlur > 0 && style.shadowColor !== "transparent") {
    shadows.push(`0 ${Math.ceil(style.shadowBlur / 2)}px ${style.shadowBlur}px ${style.shadowColor}`);
  }

  return {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    color: style.color,
    backgroundColor: bgColor,
    textShadow: shadows.length > 0 ? shadows.join(", ") : "none",
    lineHeight: style.lineHeight,
    letterSpacing: `${style.letterSpacing}px`,
    padding: `${style.paddingY}px ${style.paddingX}px`,
    borderRadius: `${style.borderRadius}px`,
    maxWidth: `${style.maxWidth}%`,
    textAlign: style.alignment,
    wordBreak: "break-word" as const,
  };
}

export function subtitleStyleToAss(style: SubtitleStyle): string {
  const hexToAss = (hex: string): string => {
    if (hex === "transparent") return "&H00FFFFFF";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `&H00${b.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${r.toString(16).padStart(2, "0")}`.toUpperCase();
  };

  const parseColor = (color: string, opacity: number): string => {
    if (color === "transparent") return "&H00FFFFFF";
    if (color.startsWith("rgba")) {
      const m = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
      if (!m) return "&H00000000";
      const r = parseInt(m[1]);
      const g = parseInt(m[2]);
      const b = parseInt(m[3]);
      const a = Math.round((1 - parseFloat(m[4])) * 255);
      return `&${a.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${r.toString(16).padStart(2, "0")}`.toUpperCase();
    }
    if (color.startsWith("#")) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const a = Math.round((1 - opacity) * 255);
      return `&${a.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${r.toString(16).padStart(2, "0")}`.toUpperCase();
    }
    return "&H00000000";
  };

  const posMap: Record<string, string> = { top: "8", center: "5", bottom: "2" };
  const alignment = posMap[style.position] || "2";

  const assFontSize = Math.round(style.fontSize * (style.fontWeight >= 700 ? 1.0 : 0.95));

  const outline = style.outlineWidth;
  const shadow = style.shadowBlur > 0 ? 1 : 0;

  const hasBg = style.backgroundColor !== "transparent" && style.backgroundOpacity > 0;
  const borderStyle = hasBg ? "3" : "1";

  const outlineCol = hasBg ? "&H00000000" : hexToAss(style.outlineColor === "transparent" ? "#000000" : style.outlineColor);
  const backCol = hasBg ? parseColor(style.backgroundColor, style.backgroundOpacity) : "&H80000000";

  return [
    `FontSize=${assFontSize}`,
    `FontName=${style.fontFamily.split(",")[0].trim()}`,
    `PrimaryColour=${hexToAss(style.color)}`,
    `Alignment=${alignment}`,
    `MarginV=${style.marginBottom}`,
    `MarginL=${style.paddingX}`,
    `MarginR=${style.paddingX}`,
    `Outline=${outline}`,
    `Shadow=${shadow}`,
    `BorderStyle=${borderStyle}`,
    `OutlineColour=${outlineCol}`,
    `BackColour=${backCol}`,
    `Bold=${style.fontWeight >= 700 ? 1 : 0}`,
  ].join(",");
}
