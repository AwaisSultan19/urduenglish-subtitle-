"use client";

import { CaptionSegment, SubtitleStyle } from "@/types";
import { subtitleStyleToCss } from "@/lib/subtitle-style";
import { useRef, useEffect, useState, useCallback } from "react";

interface CaptionPreviewProps {
  videoUrl: string;
  segments: CaptionSegment[];
  style: SubtitleStyle;
  highlightWords?: boolean;
  onUpdateSegments?: (segments: CaptionSegment[]) => void;
}

export default function CaptionPreview({
  videoUrl,
  segments,
  style,
  highlightWords = false,
  onUpdateSegments,
}: CaptionPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [animKey, setAnimKey] = useState(0);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

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
      setCurrentTime(video.currentTime);
      const idx = findActiveSegment(video.currentTime);
      setActiveIdx((prev) => {
        if (prev !== idx && idx >= 0) {
          setAnimKey((k) => k + 1);
        }
        return idx;
      });
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
  const animClass = style.animation === "fade" ? "caption-anim-fade" : "caption-anim-none";

  const updateSegment = (idx: number, field: keyof CaptionSegment, value: string | number) => {
    if (!onUpdateSegments) return;
    const updated = segments.map((seg, i) =>
      i === idx ? { ...seg, [field]: value } : seg
    );
    onUpdateSegments(updated);
  };

  const updateSegmentTime = (idx: number, field: "start" | "end", value: string) => {
    const parts = value.split(":");
    if (parts.length !== 2) return;
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (isNaN(mins) || isNaN(secs)) return;
    updateSegment(idx, field, mins * 60 + secs);
  };

  const deleteSegment = (idx: number) => {
    if (!onUpdateSegments) return;
    onUpdateSegments(segments.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const addSegment = () => {
    if (!onUpdateSegments) return;
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? lastSeg.end : 0;
    const newSeg: CaptionSegment = {
      id: crypto.randomUUID(),
      start: newStart,
      end: newStart + 2,
      text: "New caption",
      translatedText: "New caption",
    };
    onUpdateSegments([...segments, newSeg]);
    setEditingIdx(segments.length);
  };

  const renderCaptionWords = (seg: CaptionSegment) => {
    const displayText = seg.translatedText || seg.text;
    const words = displayText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return <span>{displayText}</span>;

    const segDuration = seg.end - seg.start;
    const timePerWord = segDuration / words.length;

    return (
      <span>
        {words.map((word, wi) => {
          const wordStart = seg.start + wi * timePerWord;
          const isActive = currentTime >= wordStart;
          if (highlightWords) {
            const wordEnd = seg.start + (wi + 1) * timePerWord;
            const isCurrent = currentTime >= wordStart && currentTime < wordEnd;
            const isPast = currentTime >= wordEnd;
            return (
              <span
                key={wi}
                style={{
                  color: isCurrent ? style.activeWordColor : isPast ? style.color : `${style.color}66`,
                  textShadow: isCurrent && style.activeWordColor !== style.color ? `0 0 8px ${style.activeWordColor}` : "none",
                  transition: "color 0.1s, text-shadow 0.1s",
                }}
              >
                {word}{" "}
              </span>
            );
          }
          return (
            <span
              key={wi}
              style={{
                opacity: isActive ? 1 : 0,
                transition: "opacity 0.15s ease-in",
              }}
            >
              {word}{" "}
            </span>
          );
        })}
      </span>
    );
  };

  const cssStyle = subtitleStyleToCss(style);

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
                  key={`${activeIdx}-${animKey}`}
                  className={`text-center ${animClass}`}
                  style={cssStyle}
                >
                  {renderCaptionWords(activeSegment)}
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
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">{segments.length} captions</span>
            {onUpdateSegments && (
              <button
                onClick={addSegment}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                + Add Caption
              </button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 space-y-1">
            {segments.map((seg, i) => (
              <div
                key={seg.id}
                className={`rounded-lg transition-colors ${
                  i === activeIdx
                    ? "bg-violet-500/20 text-violet-300"
                    : "text-zinc-500 hover:bg-zinc-800/50"
                } ${editingIdx === i ? "ring-1 ring-violet-500/50" : ""}`}
              >
                {editingIdx === i ? (
                  <div className="p-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={`${Math.floor(seg.start / 60)}:${Math.floor(seg.start % 60).toString().padStart(2, "0")}`}
                        onChange={(e) => updateSegmentTime(i, "start", e.target.value)}
                        className="w-16 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-xs font-mono text-zinc-300 focus:border-violet-500 outline-none"
                        placeholder="0:00"
                      />
                      <span className="text-zinc-600 text-xs">to</span>
                      <input
                        type="text"
                        value={`${Math.floor(seg.end / 60)}:${Math.floor(seg.end % 60).toString().padStart(2, "0")}`}
                        onChange={(e) => updateSegmentTime(i, "end", e.target.value)}
                        className="w-16 bg-zinc-800 border border-zinc-700 rounded px-1.5 py-0.5 text-xs font-mono text-zinc-300 focus:border-violet-500 outline-none"
                        placeholder="0:00"
                      />
                    </div>
                    <textarea
                      value={seg.translatedText || seg.text}
                      onChange={(e) => updateSegment(i, "translatedText", e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300 focus:border-violet-500 outline-none resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => deleteSegment(i)}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setEditingIdx(null)}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs"
                    onClick={() => setEditingIdx(i)}
                  >
                    <span className="font-mono text-zinc-600 shrink-0 w-20">
                      {formatTime(seg.start)} - {formatTime(seg.end)}
                    </span>
                    <span className="flex-1 truncate">
                      {seg.translatedText || seg.text}
                    </span>
                    <svg className="w-3 h-3 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
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
