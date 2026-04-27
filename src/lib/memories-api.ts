import { supabase, isSupabaseConfigured, IMAGES_BUCKET } from "./supabase";
import { memories as seedMemories, type Memory } from "@/data/memories";

// ── DB row shape (snake_case from Postgres) ──────────────────
type MemoryRow = {
  id: string;
  title: string;
  date: string;
  location_name: string;
  mappls_pin?: string | null;
  eloc?: string | null;
  longitude: number;
  latitude: number;
  story: string;
  image_url: string | null;
  created_at: string;
};

function rowToMemory(row: MemoryRow): Memory {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    locationName: row.location_name,
    coordinates: { longitude: row.longitude, latitude: row.latitude },
    mapplsPin: row.mappls_pin ?? undefined,
    eLoc: row.eloc ?? row.mappls_pin ?? undefined,
    story: row.story,
    image: row.image_url ?? undefined,
  };
}

// ── LocalStorage fallback helpers ────────────────────────────
const LS_KEY = "rt-extra-memories";

function lsLoad(): Memory[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Memory[]) : [];
  } catch { return []; }
}

function lsSave(memories: Memory[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(memories)); } catch { /* ignore */ }
}

// ── Read ─────────────────────────────────────────────────────
export async function getMemories(): Promise<Memory[]> {
  if (!isSupabaseConfigured) {
    // Fall back to seed data + anything saved locally
    return [...seedMemories, ...lsLoad()].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  const { data, error } = await supabase!
    .from("memories")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as MemoryRow[]).map(rowToMemory);
}

// ── Create ───────────────────────────────────────────────────
export async function addMemory(memory: Omit<Memory, "id">): Promise<Memory> {
  if (!isSupabaseConfigured) {
    const newMemory: Memory = { ...memory, id: `local-${Date.now()}` };
    lsSave([...lsLoad(), newMemory]);
    return newMemory;
  }

  const { data, error } = await supabase!
    .from("memories")
    .insert({
      title: memory.title,
      date: memory.date,
      location_name: memory.locationName,
      longitude: memory.coordinates.longitude,
      latitude: memory.coordinates.latitude,
      story: memory.story,
      image_url: memory.image ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToMemory(data as MemoryRow);
}

// ── Delete ───────────────────────────────────────────────────
export async function deleteMemory(id: string): Promise<void> {
  if (!isSupabaseConfigured) {
    lsSave(lsLoad().filter((m) => m.id !== id));
    return;
  }

  const { error } = await supabase!.from("memories").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Image upload ─────────────────────────────────────────────
export async function uploadImage(file: File): Promise<string> {
  if (!isSupabaseConfigured) {
    // Return a local object URL as a best-effort fallback
    return URL.createObjectURL(file);
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase!.storage
    .from(IMAGES_BUCKET)
    .upload(path, file, { upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase!.storage.from(IMAGES_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
