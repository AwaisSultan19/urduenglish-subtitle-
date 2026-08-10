import { NextRequest, NextResponse } from "next/server";
import { generateSrt, generateVtt, burnSubtitlesIntoVideo } from "@/lib/ffmpeg";
import { SubtitleStyle } from "@/types";
import { SUBTITLE_PRESETS } from "@/lib/subtitle-style";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { segments, videoUrl, style, format } = await request.json();

    if (!segments) {
      return NextResponse.json(
        { success: false, error: "Missing segments" },
        { status: 400 }
      );
    }

    if (format === "srt") {
      const srtContent = await generateSrt(segments, true);
      return new NextResponse(srtContent, {
        headers: {
          "Content-Type": "text/srt",
          "Content-Disposition": 'attachment; filename="captions.srt"',
        },
      });
    }

    if (format === "vtt") {
      const vttContent = await generateVtt(segments, true);
      return new NextResponse(vttContent, {
        headers: {
          "Content-Type": "text/vtt",
          "Content-Disposition": 'attachment; filename="captions.vtt"',
        },
      });
    }

    if (!videoUrl) {
      const srtContent = await generateSrt(segments, true);
      return new NextResponse(srtContent, {
        headers: {
          "Content-Type": "text/srt",
          "Content-Disposition": 'attachment; filename="captions.srt"',
        },
      });
    }

    const captionStyle: SubtitleStyle = style || SUBTITLE_PRESETS.clean;
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
