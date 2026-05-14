import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COUPLE_SESSION_COOKIE = "heartprint-couple";
const SESSION_VERSION = "v1";

function authSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET.");
  }
  return secret;
}

function hmac(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function normalizeCoupleKey(key: string) {
  return key.trim().replace(/\s+/g, "").toUpperCase();
}

export function hashCoupleKey(key: string) {
  return `${SESSION_VERSION}:${hmac(`couple-key:${normalizeCoupleKey(key)}`)}`;
}

export function createCoupleSessionValue(coupleId: string) {
  const payload = `${SESSION_VERSION}.${coupleId}`;
  return `${payload}.${hmac(`couple-session:${payload}`)}`;
}

export function verifyCoupleSessionValue(value?: string) {
  if (!value) return null;

  const [version, coupleId, signature] = value.split(".");
  if (version !== SESSION_VERSION || !coupleId || !signature) return null;

  const payload = `${version}.${coupleId}`;
  const expected = hmac(`couple-session:${payload}`);
  return safeEqual(signature, expected) ? coupleId : null;
}

export async function getCurrentCoupleId() {
  const cookieStore = await cookies();
  return verifyCoupleSessionValue(cookieStore.get(COUPLE_SESSION_COOKIE)?.value);
}

export function coupleSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 60,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}
