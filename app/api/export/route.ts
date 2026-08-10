import { NextRequest, NextResponse } from "next/server";
import { generateSrt, burnSubtitlesIntoVideo } from "@/lib/ffmpeg";
import { CaptionStyleConfig } from "@/types";

export const maxDuration = 300;

const defaultStyle: CaptionStyleConfig = {
  preset: "default",
  fontSize: 18,
  fontFamily: "Inter",
  color: "#ffffff",
  backgroundColor: "rgba(0,0,0,0.7)",
  position: "bottom",
  animation: "fade",
};

export async function POST(request: NextRequest) {
  try {
    const { segments, videoUrl, style, format } = await request.json();

    if (!segments) {
      return NextResponse.json(
        { success: false, error: "Missing segments" },
        { status: 400 }
      );
    }

    if (format === "srt" || !videoUrl) {
      const srtContent = await generateSrt(segments, true);
      return new NextResponse(srtContent, {
        headers: {
          "Content-Type": "text/srt",
          "Content-Disposition": 'attachment; filename="captions.srt"',
        },
      });
    }

    const captionStyle = style || defaultStyle;
    const videoBuffer = await burnSubtitlesIntoVideo(videoUrl, segments, captionStyle);

    return new NextResponse(new Uint8Array(videoBuffer), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="video_with_captions.mp4"',
      },
    });
  } catch (e) {
    console.error("Export error:", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 }
    );
  }
}
