"use client";

interface DownloadButtonProps {
  onDownload: () => void;
  isExporting: boolean;
  disabled?: boolean;
}

export default function DownloadButton({
  onDownload,
  isExporting,
  disabled,
}: DownloadButtonProps) {
  return (
    <button
      onClick={onDownload}
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
          Exporting...
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
  );
}
