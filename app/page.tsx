"use client";

import { useState, useCallback } from "react";
import VideoUploader from "@/components/VideoUploader";
import LanguageSelector from "@/components/LanguageSelector";
import CaptionPreview from "@/components/CaptionPreview";
import CaptionStyle from "@/components/CaptionStyle";
import DownloadButton from "@/components/DownloadButton";
import { uploadVideoDirect } from "@/lib/upload";
import {
  TargetLanguage,
  CaptionSegment,
  CaptionStyleConfig,
  ProjectStatus,
} from "@/types";

const defaultStyle: CaptionStyleConfig = {
  preset: "default",
  fontSize: 18,
  fontFamily: "Inter",
  color: "#ffffff",
  backgroundColor: "rgba(0,0,0,0.7)",
  position: "bottom",
};

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [language, setLanguage] = useState<TargetLanguage>("english");
  const [style, setStyle] = useState<CaptionStyleConfig>(defaultStyle);
  const [segments, setSegments] = useState<CaptionSegment[]>([]);
  const [status, setStatus] = useState<ProjectStatus>("idle");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleUpload = useCallback(async (file: File) => {
    setStatus("uploading");
    setError("");
    setUploadProgress(0);
    setFileName(file.name);

    try {
      const result = await uploadVideoDirect(file, (pct) => {
        setUploadProgress(pct);
      });
      setVideoUrl(result.videoUrl);
      setUploadProgress(100);
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStatus("error");
    }
  }, []);

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
        body: JSON.stringify({ videoUrl, fileName }),
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
  }, [videoUrl, fileName, handleTranslate]);

  const handleExportSrt = useCallback(async () => {
    if (segments.length === 0) return;
    setIsExporting(true);
    setError("");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments }),
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

  const isProcessing = status === "uploading" || status === "transcribing" || status === "translating";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">UC</span>
            </div>
            <span className="font-semibold text-zinc-100">Urdu Caption AI</span>
          </div>
          <span className="text-xs text-zinc-500">v0.1.0</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">
            AI-Powered Urdu Video Captions
          </h1>
          <p className="text-zinc-400 text-sm">
            Upload an Urdu video, choose your target language, and generate captions in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <VideoUploader onUpload={handleUpload} isUploading={status === "uploading"} uploadProgress={uploadProgress} />

            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isProcessing || isExporting}
            />

            <CaptionStyle value={style} onChange={setStyle} disabled={isProcessing || isExporting} />

            {videoUrl && segments.length === 0 && (
              <button
                onClick={handleTranscribe}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-all"
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

            {progress && (
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {progress}
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <CaptionPreview
              videoUrl={videoUrl}
              segments={segments}
              style={style}
              currentTime={0}
            />

            {status === "ready" && (
              <DownloadButton
                onDownload={handleExportSrt}
                isExporting={isExporting}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 py-4">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-zinc-600">
          Urdu Caption AI &mdash; AI-powered video captioning
        </div>
      </footer>
    </div>
  );
}
