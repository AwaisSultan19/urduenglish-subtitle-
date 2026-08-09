"use client";

import { getSupabaseClient, getPublicUrl } from "@/lib/supabase";

export async function uploadVideoDirect(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ videoUrl: string; projectId: string; path: string }> {
  const supabase = getSupabaseClient();
  const projectId = crypto.randomUUID();
  const ext = file.name.split(".").pop() || "mp4";
  const path = `${projectId}/video.${ext}`;

  // Upload directly from browser — no server timeout issues
  const { error } = await supabase.storage
    .from("videos")
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "video/mp4",
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  onProgress?.(100);

  return {
    videoUrl: getPublicUrl(path),
    projectId,
    path,
  };
}
