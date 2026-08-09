"use client";

import { useCallback, useState, useRef } from "react";

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
}

export default function VideoUploader({ onUpload, isUploading, uploadProgress }: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      onUpload(file);
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-violet-500 bg-violet-500/10"
            : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          onChange={onChange}
          className="hidden"
          disabled={isUploading}
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-3 w-3/4">
            <svg className="animate-spin h-8 w-8 text-violet-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm font-medium text-zinc-300">Uploading...</span>
            <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-violet-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 font-mono">{uploadProgress}%</span>
          </div>
        ) : preview ? (
          <video
            src={preview}
            className="max-h-48 rounded-lg"
            controls
            muted
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-zinc-400">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-sm font-medium">
              Drop your Urdu video here or click to browse
            </span>
            <span className="text-xs text-zinc-500">
              MP4, WebM, MOV up to 500MB
            </span>
          </div>
        )}
      </label>
    </div>
  );
}
