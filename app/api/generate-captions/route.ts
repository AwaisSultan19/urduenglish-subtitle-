import { NextRequest, NextResponse } from "next/server";
import { translateSegments } from "@/lib/translation";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { segments, targetLanguage } = await request.json();

    if (!segments || !targetLanguage) {
      return NextResponse.json(
        { success: false, error: "Missing segments or target language" },
        { status: 400 }
      );
    }

    const translated = await translateSegments(segments, targetLanguage);

    return NextResponse.json({
      success: true,
      segments: translated,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Translation failed" },
      { status: 500 }
    );
  }
}
