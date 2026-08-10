export type TargetLanguage = "english" | "roman-urdu" | "urdu";

export type CaptionStylePreset =
  | "default"
  | "bold"
  | "cinematic"
  | "minimal"
  | "social"
  | "tiktok"
  | "youtube"
  | "neon"
  | "glitch"
  | "karaoke";

export type CaptionAnimation =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "pop"
  | "typewriter"
  | "bounce"
  | "glow-pulse"
  | "zoom-in"
  | "shake";

export interface CaptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  translatedText?: string;
}

export interface CaptionStyleConfig {
  preset: CaptionStylePreset;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: "top" | "center" | "bottom";
  animation: CaptionAnimation;
}

export type ProjectStatus =
  | "idle"
  | "uploading"
  | "transcribing"
  | "translating"
  | "ready"
  | "exporting"
  | "error";

export interface UploadResponse {
  success: boolean;
  videoUrl: string;
  projectId: string;
}

export interface TranscribeResponse {
  success: boolean;
  segments: CaptionSegment[];
}

export interface GenerateCaptionsResponse {
  success: boolean;
  segments: CaptionSegment[];
}
