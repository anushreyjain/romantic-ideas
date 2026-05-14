import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentCoupleId } from "@/lib/couple-session";
import { IMAGES_BUCKET } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function unauthorized() {
  return NextResponse.json(
    { error: "Enter your couple key to upload memory photos." },
    { status: 401 },
  );
}

function extensionFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext || "jpg";
}

export async function POST(request: Request) {
  const coupleId = await getCurrentCoupleId();
  if (!coupleId) return unauthorized();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Choose an image to upload." },
      { status: 400 },
    );
  }

  const path = `${coupleId}/${Date.now()}-${randomUUID()}.${extensionFromName(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await getSupabaseAdmin().storage
    .from(IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data } = getSupabaseAdmin().storage
    .from(IMAGES_BUCKET)
    .getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
