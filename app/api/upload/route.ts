import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No video file provided" },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const projectId = crypto.randomUUID();
    const ext = file.name.split(".").pop() || "mp4";
    const path = `${projectId}/video.${ext}`;

    // Convert File to ArrayBuffer then to Uint8Array for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    const { error } = await supabase.storage
      .from("videos")
      .upload(path, fileBuffer, {
        upsert: true,
        contentType: file.type || "video/mp4",
      });

    if (error) {
      console.error("[Upload] Supabase error:", error);
      throw new Error(`Storage error: ${error.message}`);
    }

    const { data } = supabase.storage.from("videos").getPublicUrl(path);

    return NextResponse.json({
      success: true,
      videoUrl: data.publicUrl,
      projectId,
    });
  } catch (e) {
    console.error("[Upload] Error:", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
