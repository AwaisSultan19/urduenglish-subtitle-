"use client";

interface DownloadButtonProps {
  onDownloadVideo: () => void;
  onDownloadSrt: () => void;
  isExporting: boolean;
  disabled?: boolean;
}

export default function DownloadButton({
  onDownloadVideo,
  onDownloadSrt,
  isExporting,
  disabled,
}: DownloadButtonProps) {
  return (
    <div className="space-y-3">
      <button
        onClick={onDownloadVideo}
        disabled={disabled || isExporting}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
          disabled || isExporting
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
        }`}
      >
        {isExporting ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Exporting Video...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Video with Captions
          </>
        )}
      </button>

      <button
        onClick={onDownloadSrt}
        disabled={disabled || isExporting}
        className={`w-full flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
          disabled || isExporting
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
        }`}
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download SRT Only
      </button>
    </div>
  );
}
