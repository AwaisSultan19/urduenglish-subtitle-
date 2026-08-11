"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import VideoUploader from "@/components/VideoUploader";
import FeedbackModal from "@/components/FeedbackModal";
import { uploadVideoDirect } from "@/lib/upload";

const STEPS = [
  {
    num: 1,
    title: "Upload Video",
    desc: "Drop your Urdu, Hindi, or mixed speech video",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: 2,
    title: "Customize & Generate",
    desc: "Pick language, font, style & animation",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    num: 3,
    title: "Export",
    desc: "Download video with burned-in captions or SRT/VTT",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
];

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    setStatus("uploading");
    setError("");
    setUploadProgress(0);

    try {
      const result = await uploadVideoDirect(file, (pct) => {
        setUploadProgress(pct);
      });
      setUploadProgress(100);
      localStorage.setItem("edit_video_url", result.videoUrl);
      localStorage.setItem("edit_file_name", file.name);
      router.push("/edit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setStatus("error");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ZB</span>
            </div>
            <span className="font-semibold text-zinc-100">Zubaan</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFeedbackOpen(true)}
              className="text-xs text-zinc-500 hover:text-violet-400 border border-zinc-800 hover:border-violet-500/30 px-3 py-1.5 rounded-lg transition-all"
            >
              Feedback
            </button>
            <span className="text-xs text-zinc-500">v0.1.0</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3">
            Your Speech. Your Language. Your Captions.
          </h1>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Turn Hindi, Urdu, and English mixed speech into clean{" "}
            <strong className="text-zinc-300">Roman Urdu or English captions</strong> in seconds.
          </p>
        </div>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {STEPS.map((step) => {
            const isActive = step.num === 1;
            const isDone = false;
            return (
              <div
                key={step.num}
                className={`relative rounded-2xl border p-5 transition-all duration-300 ${
                  isActive
                    ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/5"
                    : isDone
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-zinc-800 bg-zinc-900/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : isDone
                          ? "bg-emerald-600/20 text-emerald-400"
                          : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-violet-400" : isDone ? "text-emerald-400" : "text-zinc-600"}`}>
                        Step {step.num}
                      </span>
                      {isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-semibold ${isActive ? "text-zinc-100" : isDone ? "text-zinc-300" : "text-zinc-400"}`}>
                      {step.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
                {step.num < STEPS.length && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-3 h-px bg-zinc-700 -translate-y-1/2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Upload */}
        <VideoUploader onUpload={handleUpload} isUploading={status === "uploading"} uploadProgress={uploadProgress} />

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-800 py-4">
        <div className="max-w-5xl mx-auto px-6 text-center text-xs text-zinc-600">
          Zubaan &mdash; AI-powered video captioning
        </div>
      </footer>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
