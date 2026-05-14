import { NextResponse } from "next/server";
import {
  COUPLE_SESSION_COOKIE,
  coupleSessionCookieOptions,
  createCoupleSessionValue,
  hashCoupleKey,
} from "@/lib/couple-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type LoginBody = {
  key?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const key = body.key?.trim();

  if (!key) {
    return NextResponse.json(
      { error: "Enter your couple key." },
      { status: 400 },
    );
  }

  const { data, error } = await getSupabaseAdmin()
    .from("couples")
    .select("id, label")
    .eq("access_key_hash", hashCoupleKey(key))
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "That couple key does not match any memory map." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({
    couple: { id: data.id as string, label: data.label as string },
    redirectTo: "/memories-map",
  });

  response.cookies.set(
    COUPLE_SESSION_COOKIE,
    createCoupleSessionValue(data.id as string),
    coupleSessionCookieOptions(),
  );

  return response;
}
