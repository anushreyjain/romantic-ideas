import { NextResponse } from "next/server";
import { COUPLE_SESSION_COOKIE } from "@/lib/couple-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COUPLE_SESSION_COOKIE, "", {
    maxAge: 0,
    path: "/",
  });
  return response;
}
