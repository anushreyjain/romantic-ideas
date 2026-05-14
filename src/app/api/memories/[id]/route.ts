import { NextResponse } from "next/server";
import { getCurrentCoupleId } from "@/lib/couple-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function unauthorized() {
  return NextResponse.json(
    { error: "Enter your couple key to open this memory map." },
    { status: 401 },
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return unauthorized();

  const { id } = await params;
  const { error } = await getSupabaseAdmin()
    .from("memories")
    .delete()
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
