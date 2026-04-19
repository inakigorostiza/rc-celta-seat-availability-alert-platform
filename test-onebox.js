import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE_URL = "https://api.oneboxtds.net";
const TOKEN_PATH = "/oauth/token";
const CLIENT_ID = "seller-channel-client";

function loadEnv() {
  const here = dirname(fileURLToPath(import.meta.url));
  const raw = readFileSync(join(here, ".env"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

async function getAccessToken({ clientSecret, channelId }) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: clientSecret,
    channel_id: channelId,
  });

  const res = await fetch(BASE_URL + TOKEN_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`✖ auth failed: ${res.status} ${res.statusText}`);
    console.error(text);
    process.exit(1);
  }

  const json = JSON.parse(text);
  console.log(
    `✔ token acquired, expires_in=${json.expires_in}s, scope=${json.scope ?? "(none)"}`,
  );
  return json.access_token;
}

async function apiGet(path, token) {
  const res = await fetch(BASE_URL + path, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GET ${path} → ${res.status} ${res.statusText}: ${text}`);
  }
  return JSON.parse(text);
}

function formatEventName(session) {
  const ev = session.event ?? {};
  return ev.name ?? `event ${ev.id ?? "?"}`;
}

function summarizeAvailability(av) {
  if (!av || typeof av !== "object") return "(no body)";
  const keys = Object.keys(av);
  const data = av.data ?? av;
  if (Array.isArray(data)) {
    return `array length=${data.length} (top-level keys: ${keys.join(", ")})`;
  }
  if (typeof data === "object" && data !== null) {
    const nested = Object.keys(data).slice(0, 8).join(", ");
    return `object keys: ${nested}${Object.keys(data).length > 8 ? ", …" : ""} (top-level keys: ${keys.join(", ")})`;
  }
  return `(top-level keys: ${keys.join(", ")})`;
}

async function main() {
  const env = loadEnv();
  const clientSecret = env.ONEBOX_CLIENT_SECRET;
  const channelId = env.ONEBOX_CHANNEL_ID;
  if (!clientSecret || !channelId) {
    console.error("✖ missing ONEBOX_CLIENT_SECRET or ONEBOX_CHANNEL_ID in .env");
    process.exit(1);
  }

  const token = await getAccessToken({ clientSecret, channelId });
  console.log("");

  console.log("→ GET /catalog-api/v1/sessions");
  const sessions = await apiGet("/catalog-api/v1/sessions", token);
  const total = sessions?.metadata?.total ?? sessions?.data?.length ?? 0;
  const list = sessions?.data ?? [];
  console.log(`  ${list.length} sessions returned (metadata.total=${total})`);
  console.log("");

  const sampleSize = Math.min(3, list.length);
  console.log(`→ fetching availability for first ${sampleSize} sessions:`);
  for (const s of list.slice(0, sampleSize)) {
    const path = `/catalog-api/v1/sessions/${s.id}/availability`;
    try {
      const av = await apiGet(path, token);
      console.log(`  ✔ session ${s.id} "${s.name}" — ${formatEventName(s)}`);
      console.log(`    ${summarizeAvailability(av)}`);
    } catch (err) {
      console.log(`  ✖ session ${s.id} "${s.name}" — ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error("✖ unexpected error:", err);
  process.exit(1);
});
