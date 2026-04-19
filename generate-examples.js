import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE_URL = "https://api.oneboxtds.net";
const CLIENT_ID = "seller-channel-client";
const HERE = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const raw = readFileSync(join(HERE, ".env"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}

async function auth({ clientSecret, channelId }) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: clientSecret,
    channel_id: channelId,
  });
  const res = await fetch(BASE_URL + "/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`auth ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function apiGet(path, token) {
  const res = await fetch(BASE_URL + path, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${path} ${res.status}: ${text}`);
  return JSON.parse(text);
}

function redactToken(t) {
  if (!t || typeof t !== "string" || t.length < 20) return "<redacted>";
  return t.slice(0, 6) + "…" + t.slice(-4) + " (redacted)";
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pretty(obj) {
  return esc(JSON.stringify(obj, null, 2));
}

function renderExample({ title, description, method, url, headers, body, response, notes }) {
  const headerLines = Object.entries(headers || {})
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  const bodyBlock = body
    ? `<h4>Body</h4><pre class="req"><code>${esc(body)}</code></pre>`
    : "";
  const notesBlock = notes ? `<p class="notes">${notes}</p>` : "";
  return `
    <section class="ex">
      <h2>${esc(title)}</h2>
      <p>${esc(description)}</p>
      <h4>Request</h4>
      <pre class="req"><code><span class="method">${esc(method)}</span> ${esc(url)}
${esc(headerLines)}</code></pre>
      ${bodyBlock}
      <h4>Response</h4>
      <pre class="res"><code>${pretty(response)}</code></pre>
      ${notesBlock}
    </section>
  `;
}

async function main() {
  const env = loadEnv();

  console.log("→ authenticating");
  const tokenResp = await auth({
    clientSecret: env.ONEBOX_CLIENT_SECRET,
    channelId: env.ONEBOX_CHANNEL_ID,
  });

  console.log("→ GET sessions");
  const sessions = await apiGet("/catalog-api/v1/sessions", tokenResp.access_token);

  const firstSession = sessions.data?.[0];
  let availability = null;
  let availPath = null;
  if (firstSession) {
    availPath = `/catalog-api/v1/sessions/${firstSession.id}/availability`;
    console.log(`→ GET availability for session ${firstSession.id}`);
    availability = await apiGet(availPath, tokenResp.access_token);
  }

  const tokenRespSanitized = {
    ...tokenResp,
    access_token: redactToken(tokenResp.access_token),
    refresh_token: redactToken(tokenResp.refresh_token),
    authInfo: tokenResp.authInfo ? "<redacted>" : tokenResp.authInfo,
    jti: tokenResp.jti,
  };

  const sessionsPreview = {
    ...sessions,
    data: (sessions.data || []).slice(0, 2),
  };
  const truncatedSessions = (sessions.data?.length ?? 0) > 2;

  const sections = [];

  sections.push(
    renderExample({
      title: "1. Authenticate (get access token)",
      description:
        "Seller-channel-client OAuth2 client_credentials flow against the PRE environment. Returns a bearer token valid for 12 hours.",
      method: "POST",
      url: `${BASE_URL}/oauth/token`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: [
        "grant_type=client_credentials",
        "client_id=seller-channel-client",
        "client_secret=<YOUR_CLIENT_SECRET>",
        `channel_id=${env.ONEBOX_CHANNEL_ID}`,
      ].join("&"),
      response: tokenRespSanitized,
      notes:
        "access_token and refresh_token are redacted in this example. Use access_token as a bearer token for subsequent calls.",
    }),
  );

  sections.push(
    renderExample({
      title: "2. List sessions",
      description:
        "Returns all sessions visible to this sales channel, paginated (default limit=100).",
      method: "GET",
      url: `${BASE_URL}/catalog-api/v1/sessions`,
      headers: {
        Authorization: "Bearer <ACCESS_TOKEN>",
        Accept: "application/json",
      },
      response: sessionsPreview,
      notes: truncatedSessions
        ? `Response truncated to first 2 entries for readability. Full call returned <code>metadata.total = ${sessions.metadata?.total}</code>.`
        : null,
    }),
  );

  if (availability) {
    sections.push(
      renderExample({
        title: "3. Get session availability",
        description: `Availability breakdown for a single session (sectors, price types, and counts). Example uses session ${firstSession.id} "${firstSession.name}".`,
        method: "GET",
        url: `${BASE_URL}${availPath}`,
        headers: {
          Authorization: "Bearer <ACCESS_TOKEN>",
          Accept: "application/json",
        },
        response: availability,
        notes:
          "The <code>avisame-celta</code> flow calls this per session ID returned from step 2 to consult real-time availability.",
      }),
    );
  }

  const generatedAt = new Date().toISOString();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ONEBOX API — example calls (PRE)</title>
  <style>
    :root {
      --bg: #0d1117;
      --panel: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --muted: #8b949e;
      --accent: #58a6ff;
      --req: #1f2430;
      --res: #132019;
      --method: #7ee787;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 2rem 1.25rem 4rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
    }
    .wrap { max-width: 960px; margin: 0 auto; }
    header { border-bottom: 1px solid var(--border); padding-bottom: 1rem; margin-bottom: 2rem; }
    header h1 { margin: 0 0 .25rem; font-size: 1.6rem; }
    header .meta { color: var(--muted); font-size: .9rem; }
    header .meta code { color: var(--accent); }
    .ex {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem 1.5rem 1.5rem;
      margin-bottom: 1.75rem;
    }
    .ex h2 { margin: 0 0 .5rem; font-size: 1.2rem; color: var(--accent); }
    .ex h4 { margin: 1rem 0 .4rem; font-size: .85rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
    .ex p { margin: 0; color: var(--text); }
    .ex p.notes { margin-top: .75rem; color: var(--muted); font-size: .9rem; }
    pre {
      background: var(--req);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: .85rem 1rem;
      overflow-x: auto;
      margin: 0;
      font-size: .85rem;
      line-height: 1.5;
    }
    pre.res { background: var(--res); }
    code { font-family: "SF Mono", Consolas, "Liberation Mono", monospace; }
    .method { color: var(--method); font-weight: 600; }
    code code { background: #21262d; padding: 0 .35em; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>ONEBOX API — example calls</h1>
      <div class="meta">
        Environment: <code>PRE</code> ·
        Base URL: <code>${esc(BASE_URL)}</code> ·
        Channel: <code>${esc(env.ONEBOX_CHANNEL_ID)}</code> ·
        Captured: ${esc(generatedAt)}
      </div>
    </header>
    ${sections.join("\n")}
  </div>
</body>
</html>`;

  const out = join(HERE, "onebox-api-test.html");
  writeFileSync(out, html);
  console.log(`✔ wrote ${out}`);
}

main().catch((err) => {
  console.error("✖", err.message);
  process.exit(1);
});
