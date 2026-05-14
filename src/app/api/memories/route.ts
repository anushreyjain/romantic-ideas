import { NextResponse } from "next/server";
import type { Memory } from "@/data/memories";
import { getCurrentCoupleId } from "@/lib/couple-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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
  couple_id: string;
};

type CreateMemoryBody = Omit<Memory, "id">;

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

function unauthorized() {
  return NextResponse.json(
    { error: "Enter your couple key to open this memory map." },
    { status: 401 },
  );
}

export async function GET() {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return unauthorized();

  const { data, error } = await getSupabaseAdmin()
    .from("memories")
    .select("*")
    .eq("couple_id", coupleId)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data as MemoryRow[]).map(rowToMemory));
}

export async function POST(request: Request) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return unauthorized();

  const memory = (await request.json().catch(() => null)) as CreateMemoryBody | null;

  if (
    !memory?.title?.trim() ||
    !memory.date ||
    !memory.locationName?.trim() ||
    !Number.isFinite(memory.coordinates?.longitude) ||
    !Number.isFinite(memory.coordinates?.latitude)
  ) {
    return NextResponse.json(
      { error: "Memory title, date, location, and coordinates are required." },
      { status: 400 },
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("memories")
    .insert({
      couple_id: coupleId,
      title: memory.title.trim(),
      date: memory.date,
      location_name: memory.locationName.trim(),
      mappls_pin: memory.mapplsPin ?? null,
      eloc: memory.eLoc ?? memory.mapplsPin ?? null,
      longitude: memory.coordinates.longitude,
      latitude: memory.coordinates.latitude,
      story: memory.story?.trim() ?? "",
      image_url: memory.image ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToMemory(data as MemoryRow), { status: 201 });
}
