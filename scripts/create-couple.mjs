import { createHmac, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(fileName) {
  const path = resolve(process.cwd(), fileName);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const name = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    process.env[name] ??= value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

function parseArgs(argv) {
  const labelParts = [];
  let customKey = "";

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--key") {
      customKey = argv[index + 1]?.trim() ?? "";
      index += 1;
      continue;
    }

    if (arg.startsWith("--key=")) {
      customKey = arg.slice("--key=".length).trim();
      continue;
    }

    labelParts.push(arg);
  }

  return {
    customKey,
    label: labelParts.join(" ").trim(),
  };
}

const { customKey, label } = parseArgs(process.argv.slice(2));

if (!label) {
  console.error("Usage: npm run create-couple -- \"Rhea & Anuj\" --key \"first coffee\"");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const authSecret = process.env.AUTH_SECRET;

if (!supabaseUrl || !serviceRoleKey || !authSecret) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or AUTH_SECRET.",
  );
  process.exit(1);
}

function normalizeCoupleKey(key) {
  return key.trim().replace(/\s+/g, "").toUpperCase();
}

function hashCoupleKey(key) {
  return `v1:${createHmac("sha256", authSecret)
    .update(`couple-key:${normalizeCoupleKey(key)}`)
    .digest("hex")}`;
}

function createReadableKey(coupleLabel) {
  const prefix =
    coupleLabel
      .toUpperCase()
      .replace(/&/g, " ")
      .split(/[^A-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part.slice(0, 5))
      .slice(0, 2)
      .join("-") || "COUPLE";

  return `${prefix}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

const accessKey = customKey || createReadableKey(label);

if (normalizeCoupleKey(accessKey).length < 4) {
  console.error(
    "Couple key must be at least 4 letters/numbers after spaces are removed.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data, error } = await supabase
  .from("couples")
  .insert({
    label,
    access_key_hash: hashCoupleKey(accessKey),
  })
  .select("id, label")
  .single();

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Couple created: ${data.label}`);
console.log(`Couple id: ${data.id}`);
console.log(`Access key: ${accessKey}`);
console.log("Share this key privately. It is not stored in plain text.");
