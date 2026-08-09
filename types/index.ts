export type TargetLanguage = "english" | "roman-urdu" | "urdu";

export type CaptionStylePreset =
  | "default"
  | "bold"
  | "cinematic"
  | "minimal"
  | "social";

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
