import { NextRequest, NextResponse } from "next/server";
import { generateSrt } from "@/lib/ffmpeg";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { segments } = await request.json();

    if (!segments) {
      return NextResponse.json(
        { success: false, error: "Missing segments" },
        { status: 400 }
      );
    }

    // Generate SRT file content
    const srtContent = await generateSrt(segments, true);

    return new NextResponse(srtContent, {
      headers: {
        "Content-Type": "text/srt",
        "Content-Disposition": 'attachment; filename="captions.srt"',
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Export failed" },
      { status: 500 }
    );
  }
}
