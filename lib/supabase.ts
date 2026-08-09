import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function getPublicUrl(path: string): string {
  const supabase = getSupabaseClient();
  const { data } = supabase.storage.from("videos").getPublicUrl(path);
  return data.publicUrl;
}
