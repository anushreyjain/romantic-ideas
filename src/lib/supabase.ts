import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key) : null;

/** True when Supabase env vars are present and the client is ready. */
export const isSupabaseConfigured = supabase !== null;

export const IMAGES_BUCKET = "memory-images";
