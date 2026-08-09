import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/whisper";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoUrl, fileName } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: "No video URL provided" },
        { status: 400 }
      );
    }

    console.log("[Transcribe] Downloading video from:", videoUrl);

    // Download video from Supabase
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`);
    }
    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    const sizeMB = (videoBuffer.length / 1024 / 1024).toFixed(2);

    console.log("[Transcribe] File size:", sizeMB, "MB");

    // Check 25MB limit for Whisper API
    if (videoBuffer.length > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: `Video is ${sizeMB}MB. Whisper API limit is 25MB. Please use a shorter video.` },
        { status: 400 }
      );
    }

    const segments = await transcribeAudio(videoBuffer, fileName || "video.mp4");

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
