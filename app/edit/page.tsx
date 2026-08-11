"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import CaptionPreview from "@/components/CaptionPreview";
import CaptionStyle from "@/components/CaptionStyle";
import DownloadButton from "@/components/DownloadButton";
import FeedbackModal from "@/components/FeedbackModal";
import {
  TargetLanguage,
  SourceLanguage,
  CaptionSegment,
  SubtitleStyle,
  ProjectStatus,
} from "@/types";
import { SUBTITLE_PRESETS } from "@/lib/subtitle-style";

function getInitialData() {
  if (typeof window === "undefined") return { url: "", name: "" };
  const url = localStorage.getItem("edit_video_url") || "";
  const name = localStorage.getItem("edit_file_name") || "video.mp4";
  return { url, name };
}

export default function EditPage() {
  const router = useRouter();
  const initial = useMemo(() => getInitialData(), []);
  const [videoUrl] = useState(initial.url);
  const [fileName] = useState(initial.name);
  const [language, setLanguage] = useState<TargetLanguage>("english");
  const [sourceLanguage, setSourceLanguage] = useState<SourceLanguage>("urdu");
  const [style, setStyle] = useState<SubtitleStyle>(SUBTITLE_PRESETS.clean);
  const [segments, setSegments] = useState<CaptionSegment[]>([]);
  const [status, setStatus] = useState<ProjectStatus>("idle");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [highlightWords, setHighlightWords] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      router.replace("/");
    }
  }, [videoUrl, router]);

  const handleTranslate = useCallback(
    async (currentSegments: CaptionSegment[]) => {
      setStatus("translating");
      setProgress("Translating captions...");
      try {
        const res = await fetch("/api/generate-captions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ segments: currentSegments, targetLanguage: language }),
        });
        const data = await res.json();
        if (data.success) {
          setSegments(data.segments);
          setStatus("ready");
          setProgress("");
        } else {
          throw new Error(data.error || "Translation failed");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Translation failed");
        setStatus("error");
        setProgress("");
      }
    },
    [language]
  );

  const handleTranscribe = useCallback(async () => {
    if (!videoUrl) return;
    setStatus("transcribing");
    setError("");
    setProgress("Transcribing audio with Whisper... This may take a while.");
    try {
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, fileName, sourceLanguage }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned invalid response. Check the terminal for details.");
      }

      if (data.success) {
        setSegments(data.segments);
        await handleTranslate(data.segments);
      } else {
        throw new Error(data.error || "Transcription failed");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transcription failed");
      setStatus("error");
      setProgress("");
    }
  }, [videoUrl, fileName, sourceLanguage, handleTranslate]);

  const handleExportVideo = useCallback(async () => {
    if (segments.length === 0) return;
    setIsExporting(true);
    setError("");
    setProgress("Generating video with burned-in captions... This may take a while.");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments, videoUrl, style }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video_with_captions.mp4";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setIsExporting(false);
      setProgress("");
    }
  }, [segments, videoUrl, style]);

  const handleExportSrt = useCallback(async () => {
    if (segments.length === 0) return;
    setIsExporting(true);
    setError("");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments, format: "srt" }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "captions.srt";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }, [segments]);

  const handleExportVtt = useCallback(async () => {
    if (segments.length === 0) return;
    setIsExporting(true);
    setError("");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments, format: "vtt" }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "captions.vtt";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setIsExporting(false);
    }
  }, [segments]);

  const isProcessing = status === "transcribing" || status === "translating";

  if (!videoUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-6 w-6 text-violet-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm">Back</span>
            </button>
            <div className="w-px h-5 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">SL</span>
              </div>
              <span className="font-semibold text-zinc-100 text-sm">Subly</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFeedbackOpen(true)}
              className="text-xs text-zinc-500 hover:text-violet-400 border border-zinc-800 hover:border-violet-500/30 px-3 py-1.5 rounded-lg transition-all"
            >
              Feedback
            </button>
          </div>
        </div>
      </header>

      {/* Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Video Preview */}
        <div className="flex-1 flex flex-col min-w-0 p-4">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-3xl">
              <CaptionPreview
                videoUrl={videoUrl}
                segments={segments}
                style={style}
                highlightWords={highlightWords}
                onUpdateSegments={setSegments}
              />
            </div>
          </div>
        </div>

        {/* Right - Controls Panel */}
        <div className="w-[380px] shrink-0 border-l border-zinc-800 bg-zinc-900/30 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Audio Language
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["urdu", "hinglish", "english", "auto"] as SourceLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSourceLanguage(lang)}
                    disabled={isProcessing || isExporting}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all duration-150 text-center ${
                      sourceLanguage === lang
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                        : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    } ${isProcessing || isExporting ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <span className="text-[11px] font-medium capitalize">{lang === "auto" ? "Auto" : lang}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Translate To
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["english", "roman-urdu"] as TargetLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    disabled={isProcessing || isExporting}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-150 ${
                      language === lang
                        ? "border-violet-500 bg-violet-500/15 text-violet-300"
                        : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                    } ${isProcessing || isExporting ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <span className="text-base font-bold">{lang === "english" ? "EN" : "RU"}</span>
                    <span className="text-xs font-medium">{lang === "roman-urdu" ? "Roman Urdu" : "English"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-800" />

            {/* Style */}
            <CaptionStyle value={style} onChange={setStyle} disabled={isProcessing || isExporting} />

            {/* Word Highlight */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={highlightWords}
                  onChange={(e) => setHighlightWords(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
              <span className="text-xs text-zinc-400">Word Highlight (Karaoke)</span>
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-800" />

            {/* Generate Button */}
            {segments.length === 0 && (
              <button
                onClick={handleTranscribe}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-violet-600 hover:bg-violet-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "transcribing" || status === "translating" ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {status === "transcribing" ? "Transcribing..." : "Translating..."}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                    Generate Captions
                  </>
                )}
              </button>
            )}

            {/* Progress */}
            {progress && (
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {progress}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Export - appears when captions are ready */}
            {status === "ready" && (
              <>
                <div className="h-px bg-zinc-800" />
                <DownloadButton
                  onDownloadVideo={handleExportVideo}
                  onDownloadSrt={handleExportSrt}
                  onDownloadVtt={handleExportVtt}
                  isExporting={isExporting}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
