export type TargetLanguage = "english" | "roman-urdu";

export type SourceLanguage = "urdu" | "hinglish" | "english" | "auto";

export type SubtitlePreset = "clean" | "bold" | "highlight" | "box" | "minimal";

export type SubtitleAnimation = "none" | "fade";

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface CaptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  translatedText?: string;
  words?: WordTiming[];
}

export interface SubtitleStyle {
  preset: SubtitlePreset;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number;
  outlineColor: string;
  outlineWidth: number;
  shadowColor: string;
  shadowBlur: number;
  position: "top" | "center" | "bottom";
  alignment: "left" | "center" | "right";
  maxWidth: number;
  lineHeight: number;
  letterSpacing: number;
  activeWordColor: string;
  animation: SubtitleAnimation;
  marginTop: number;
  marginBottom: number;
  paddingX: number;
  paddingY: number;
  borderRadius: number;
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
