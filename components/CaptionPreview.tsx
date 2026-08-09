"use client";

import { CaptionSegment } from "@/types";
import { useRef, useEffect, useState, useCallback } from "react";

interface CaptionPreviewProps {
  videoUrl: string;
  segments: CaptionSegment[];
  style: {
    fontSize: number;
    color: string;
    backgroundColor: string;
    position: "top" | "center" | "bottom";
  };
}

export default function CaptionPreview({
  videoUrl,
  segments,
  style,
}: CaptionPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeIdx, setActiveIdx] = useState(-1);

  const findActiveSegment = useCallback(
    (time: number) => {
      for (let i = 0; i < segments.length; i++) {
        if (time >= segments[i].start && time <= segments[i].end) {
          return i;
        }
      }
      return -1;
    },
    [segments]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;

    const tick = () => {
      const idx = findActiveSegment(video.currentTime);
      setActiveIdx(idx);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [findActiveSegment]);

  const positionClass =
    style.position === "top"
      ? "top-4"
      : style.position === "center"
        ? "top-1/2 -translate-y-1/2"
        : "bottom-4";

  const activeSegment = activeIdx >= 0 ? segments[activeIdx] : null;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        Preview
      </label>
      <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              controls
              muted
            />
            {activeSegment && (
              <div
                className={`absolute left-0 right-0 ${positionClass} flex justify-center px-4`}
              >
                <span
                  className="px-3 py-1.5 rounded-lg text-center max-w-[90%] leading-tight"
                  style={{
                    fontSize: `${style.fontSize}px`,
                    color: style.color,
                    backgroundColor: style.backgroundColor,
                  }}
                >
                  {activeSegment.translatedText || activeSegment.text}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600">
            <span className="text-sm">Upload a video to preview</span>
          </div>
        )}
      </div>

      {segments.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 space-y-1">
          {segments.map((seg, i) => (
            <div
              key={seg.id}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                i === activeIdx
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-zinc-500"
              }`}
            >
              <span className="font-mono text-zinc-600 mr-2">
                {formatTime(seg.start)}
              </span>
              {seg.translatedText || seg.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
