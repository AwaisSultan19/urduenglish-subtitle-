import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/whisper";
import { SourceLanguage } from "@/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, fileName, sourceLanguage } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "No video URL provided" },
        { status: 400 }
      );
    }

    console.log("[Transcribe] Downloading video from:", videoUrl);

    const videoResponse = await fetch(videoUrl, {
      signal: AbortSignal.timeout(120000),
    });
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`);
    }
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(2);

    console.log("[Transcribe] File size:", sizeMB, "MB");

    if (videoBuffer.length > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: `Video is ${sizeMB}MB. Whisper API limit is 25MB. Please use a shorter video.` },
        { status: 400 }
      );
    }

    const lang = (sourceLanguage as SourceLanguage) || "urdu";
    const segments = await transcribeAudio(videoBuffer, fileName || "video.mp4", lang);

    console.log("[Transcribe] Got", segments.length, "segments");

    return NextResponse.json({
      success: true,
      segments,
    });
  } catch (e) {
    console.error("[Transcribe] Error:", e);
    const message = e instanceof Error ? e.message : "Transcription failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
