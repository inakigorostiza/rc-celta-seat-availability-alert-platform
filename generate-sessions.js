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

async function auth(env) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: env.ONEBOX_CLIENT_SECRET,
    channel_id: env.ONEBOX_CHANNEL_ID,
  });
  const res = await fetch(BASE_URL + "/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const j = await res.json();
  if (!res.ok) throw new Error(`auth ${res.status}: ${JSON.stringify(j)}`);
  return j.access_token;
}

async function apiGet(path, token) {
  const res = await fetch(BASE_URL + path, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${path} ${res.status}: ${text}`);
  return JSON.parse(text);
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripHtml(s) {
  return String(s ?? "").replace(/<[^>]+>/g, "").trim();
}

function pickText(obj, preferred = ["es-ES", "en-US", "ca-ES"]) {
  if (!obj || typeof obj !== "object") return "";
  for (const k of preferred) if (obj[k]) return obj[k];
  const first = Object.values(obj).find(Boolean);
  return first ?? "";
}

function pickImage(session) {
  const ev = session.event ?? {};
  const tryBag = (bag) => {
    if (!bag) return null;
    if (typeof bag === "string") return bag;
    if (Array.isArray(bag)) {
      for (const entry of bag) {
        const url = pickText(entry);
        if (url) return url;
      }
      return null;
    }
    return pickText(bag) || null;
  };
  return (
    tryBag(ev.images?.main) ||
    tryBag(ev.images?.landscape) ||
    tryBag(session.images?.landscape) ||
    tryBag(session.venue?.image) ||
    null
  );
}

function formatDate(iso, tz) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: tz || "Europe/Madrid",
    });
  } catch {
    return iso;
  }
}

function priceRange(price) {
  if (!price) return "—";
  const min = price.min?.value;
  const max = price.max?.value;
  if (min == null && max == null) return "—";
  if (min === max) return `${min} €`;
  return `${min} € – ${max} €`;
}

function availabilityTotals(session) {
  const avail = session._availability;
  const topLevel = avail?.availability;
  if (topLevel) {
    return {
      total: topLevel.total ?? 0,
      available: topLevel.available ?? 0,
      unbounded: topLevel.type && topLevel.type !== "BOUNDED",
      priceTypeCount: (avail.price_types ?? session.availability?.price_types ?? []).length,
    };
  }
  const pts = session.availability?.price_types ?? [];
  let total = 0;
  let available = 0;
  let unbounded = false;
  for (const pt of pts) {
    const a = pt.availability ?? {};
    if (a.type === "BOUNDED") {
      total += a.total ?? 0;
      available += a.available ?? 0;
    } else {
      unbounded = true;
    }
  }
  return { total, available, unbounded, priceTypeCount: pts.length };
}

function renderPriceTypes(avail) {
  const pts = [...(avail?.price_types ?? [])].sort(
    (a, b) => (a.ui_settings?.order ?? 999) - (b.ui_settings?.order ?? 999),
  );
  if (!pts.length) return "";
  const items = pts
    .map((pt) => {
      const a = pt.availability ?? {};
      const total = a.total ?? 0;
      const available = a.available ?? 0;
      const pct = total > 0 ? Math.round((available / total) * 100) : 0;
      const color = pt.ui_settings?.color || "#58a6ff";
      const name = pickText(pt.texts?.name) || pt.name || pt.code || "";
      const soldClass = pct === 0 && total > 0 ? " sold" : "";
      return `
        <li class="ptype${soldClass}">
          <div class="ptype-top">
            <span class="dot" style="background:${esc(color)}"></span>
            <span class="ptype-name">${esc(name)}</span>
            ${pt.code ? `<span class="ptype-code">${esc(pt.code)}</span>` : ""}
            <span class="ptype-counts">${available.toLocaleString("es-ES")} / ${total.toLocaleString("es-ES")} · ${pct}%</span>
          </div>
          <div class="bar"><div class="fill" style="width:${pct}%;background:${esc(color)}"></div></div>
        </li>
      `;
    })
    .join("");
  return `
    <div class="ptypes">
      <div class="label">Price types (${pts.length})</div>
      <ul class="ptype-list">${items}</ul>
    </div>
  `;
}

function renderSectors(avail) {
  const sectors = avail?.sectors ?? [];
  if (!sectors.length) return "";
  const ptColorById = new Map(
    (avail.price_types ?? []).map((pt) => [pt.id, pt.ui_settings?.color || "#58a6ff"]),
  );
  const rows = sectors
    .map((sec) => {
      const pts = sec.price_types ?? [];
      const chips = pts
        .map((pt) => {
          const a = pt.availability ?? {};
          const color = ptColorById.get(pt.id) || "#58a6ff";
          return `<span class="sector-pt"><span class="dot" style="background:${esc(color)}"></span>${esc(pt.name)}: ${a.available ?? 0}/${a.total ?? 0}</span>`;
        })
        .join("");
      const showCode = sec.code && sec.code !== sec.name;
      return `
        <div class="sector">
          <div class="sector-head">
            <strong>${esc(sec.name)}</strong>
            ${showCode ? `<span class="muted">${esc(sec.code)}</span>` : ""}
          </div>
          <div class="sector-pts">${chips}</div>
        </div>
      `;
    })
    .join("");
  return `
    <details class="sectors">
      <summary>Sectors (${sectors.length})</summary>
      <div class="sectors-body">${rows}</div>
    </details>
  `;
}

function renderBadges(s) {
  const badges = [];
  if (s.sold_out) badges.push(["sold", "Sold out"]);
  if (s.on_sale) badges.push(["on-sale", "On sale"]);
  else badges.push(["off-sale", "Off sale"]);
  if (s.for_sale === false) badges.push(["off-sale", "Not for sale"]);
  return badges
    .map(([cls, label]) => `<span class="badge ${cls}">${esc(label)}</span>`)
    .join("");
}

function renderCard(s, idx) {
  const img = pickImage(s);
  const eventName = s.event?.name || pickText(s.event?.texts?.title) || `Event ${s.event?.id}`;
  const subtitle = pickText(s.event?.texts?.subtitle);
  const description = stripHtml(pickText(s.event?.texts?.description_short));
  const venueName = s.venue?.name || "—";
  const city = s.venue?.location?.city || "";
  const tz = s.venue?.location?.time_zone;
  const startDate = formatDate(s.date?.start, tz);
  const saleEnd = formatDate(s.date?.sale_end, tz);
  const price = priceRange(s.price);
  const { total, available, unbounded, priceTypeCount } = availabilityTotals(s);
  const pct = total > 0 ? Math.round((available / total) * 100) : 0;
  const pctClass = pct > 50 ? "high" : pct > 15 ? "mid" : "low";
  const availText = unbounded
    ? "Unbounded"
    : total > 0
      ? `${available.toLocaleString("es-ES")} / ${total.toLocaleString("es-ES")} (${pct}%)`
      : "—";
  const ratesText = (s.rates ?? [])
    .map((r) => (r.default ? `<strong>${esc(r.name)}</strong>` : esc(r.name)))
    .join(", ") || "—";

  const imgBlock = img
    ? `<div class="img" style="background-image:url('${esc(img)}')"></div>`
    : `<div class="img img-fallback">no image</div>`;

  return `
    <article class="card" data-event="${esc(eventName.toLowerCase())}" data-venue="${esc(venueName.toLowerCase())}">
      ${imgBlock}
      <div class="body">
        <div class="head">
          <h2>${esc(eventName)}</h2>
          <div class="badges">${renderBadges(s)}</div>
        </div>
        ${subtitle ? `<div class="subtitle">${esc(subtitle)}</div>` : ""}
        <div class="meta-grid">
          <div><span class="label">Session</span>${esc(s.name || "—")} <span class="muted">#${esc(s.id)}</span></div>
          <div><span class="label">Type</span>${esc(s.type || "—")}</div>
          <div><span class="label">Venue</span>${esc(venueName)}${city ? `, <span class="muted">${esc(city)}</span>` : ""}</div>
          <div><span class="label">Starts</span>${esc(startDate)}</div>
          <div><span class="label">Sale ends</span>${esc(saleEnd)}</div>
          <div><span class="label">Price</span>${esc(price)}</div>
          <div><span class="label">Rates</span>${ratesText}</div>
          <div><span class="label">Price types</span>${priceTypeCount}</div>
        </div>
        <div class="avail">
          <div class="avail-top">
            <span class="label">Availability</span>
            <span>${esc(availText)}</span>
          </div>
          ${total > 0 ? `<div class="bar"><div class="fill ${pctClass}" style="width:${pct}%"></div></div>` : ""}
        </div>
        ${renderPriceTypes(s._availability)}
        ${renderSectors(s._availability)}
        ${s._availabilityError ? `<div class="avail-error">availability fetch failed: ${esc(s._availabilityError)}</div>` : ""}
        ${description ? `<p class="desc">${esc(description)}</p>` : ""}
        <details class="raw">
          <summary>Raw JSON (session + availability)</summary>
          <pre><code>${esc(JSON.stringify({ session: { ...s, _availability: undefined, _availabilityError: undefined }, availability: s._availability ?? null }, null, 2))}</code></pre>
        </details>
      </div>
    </article>
  `;
}

async function main() {
  const env = loadEnv();
  console.log("→ authenticating");
  const token = await auth(env);
  console.log("→ GET /catalog-api/v1/sessions");
  const body = await apiGet("/catalog-api/v1/sessions", token);
  const sessions = body.data ?? [];
  console.log(`  ${sessions.length} sessions`);

  console.log(`→ GET /catalog-api/v1/sessions/{id}/availability × ${sessions.length}`);
  const results = await Promise.allSettled(
    sessions.map((s) => apiGet(`/catalog-api/v1/sessions/${s.id}/availability`, token)),
  );
  let availOk = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      sessions[i]._availability = r.value;
      availOk++;
    } else {
      sessions[i]._availabilityError = r.reason?.message ?? String(r.reason);
    }
  });
  console.log(`  availability ok ${availOk}/${sessions.length}`);

  const totalSectors = sessions.reduce(
    (n, s) => n + (s._availability?.sectors?.length ?? 0),
    0,
  );

  const uniqueEvents = new Set(sessions.map((s) => s.event?.id).filter(Boolean)).size;
  const uniqueVenues = new Set(sessions.map((s) => s.venue?.id).filter(Boolean)).size;
  const onSale = sessions.filter((s) => s.on_sale).length;
  const soldOut = sessions.filter((s) => s.sold_out).length;

  const cards = sessions.map(renderCard).join("\n");

  const generatedAt = new Date().toISOString();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ONEBOX sessions — channel ${esc(env.ONEBOX_CHANNEL_ID)}</title>
  <style>
    :root {
      --bg: #0d1117;
      --panel: #161b22;
      --panel-2: #1c232d;
      --border: #30363d;
      --text: #c9d1d9;
      --muted: #8b949e;
      --accent: #58a6ff;
      --green: #3fb950;
      --amber: #d29922;
      --red: #f85149;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0 0 4rem;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    header {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
      position: sticky; top: 0; z-index: 5;
    }
    header h1 { margin: 0 0 .25rem; font-size: 1.4rem; }
    .meta { color: var(--muted); font-size: .9rem; }
    .meta code { color: var(--accent); }
    .stats { display: flex; flex-wrap: wrap; gap: 1.25rem; margin-top: .75rem; font-size: .9rem; }
    .stats .stat strong { color: var(--accent); font-size: 1rem; margin-right: .25rem; }
    .filter { margin-top: .75rem; }
    .filter input {
      width: 100%; max-width: 360px;
      padding: .5rem .75rem;
      background: var(--panel-2);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-size: .95rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.25rem;
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 10px;
      overflow: hidden;
      display: flex; flex-direction: column;
    }
    .img {
      height: 150px;
      background-size: cover;
      background-position: center;
      background-color: #0b0f14;
    }
    .img-fallback {
      display: flex; align-items: center; justify-content: center;
      color: var(--muted); font-size: .85rem; letter-spacing: .05em;
    }
    .body { padding: 1rem 1.1rem 1.1rem; display: flex; flex-direction: column; gap: .6rem; flex: 1; }
    .head { display: flex; justify-content: space-between; align-items: start; gap: .5rem; }
    .head h2 { margin: 0; font-size: 1.05rem; color: var(--accent); line-height: 1.25; }
    .subtitle { color: var(--muted); font-size: .85rem; margin-top: -.3rem; }

    .badges { display: flex; gap: .3rem; flex-wrap: wrap; }
    .badge {
      font-size: .7rem; padding: .15rem .45rem; border-radius: 999px;
      border: 1px solid var(--border); background: var(--panel-2);
      text-transform: uppercase; letter-spacing: .05em; white-space: nowrap;
    }
    .badge.on-sale { color: var(--green); border-color: rgba(63,185,80,.4); }
    .badge.off-sale { color: var(--muted); }
    .badge.sold { color: var(--red); border-color: rgba(248,81,73,.4); }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: .4rem .75rem;
      font-size: .85rem;
    }
    .meta-grid .label {
      display: block; font-size: .65rem; color: var(--muted);
      text-transform: uppercase; letter-spacing: .06em; margin-bottom: .1rem;
    }
    .muted { color: var(--muted); }

    .avail .avail-top { display: flex; justify-content: space-between; font-size: .85rem; margin-bottom: .3rem; }
    .avail .label { font-size: .65rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
    .bar { height: 6px; background: #21262d; border-radius: 3px; overflow: hidden; }
    .fill { height: 100%; transition: width .3s; }
    .fill.high { background: var(--green); }
    .fill.mid  { background: var(--amber); }
    .fill.low  { background: var(--red); }

    .desc { font-size: .85rem; color: var(--muted); margin: 0; }

    .ptypes .label { display: block; font-size: .65rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; margin-bottom: .4rem; }
    .ptype-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .5rem; }
    .ptype { background: var(--panel-2); border: 1px solid var(--border); border-radius: 6px; padding: .45rem .6rem; }
    .ptype.sold { opacity: .55; }
    .ptype-top { display: flex; align-items: center; gap: .45rem; font-size: .8rem; margin-bottom: .3rem; flex-wrap: wrap; }
    .ptype-name { font-weight: 500; }
    .ptype-code { font-size: .65rem; color: var(--muted); background: #0b0f14; padding: .05rem .35rem; border-radius: 3px; font-family: "SF Mono", Consolas, monospace; }
    .ptype-counts { margin-left: auto; color: var(--muted); font-size: .75rem; font-variant-numeric: tabular-nums; }
    .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; flex: 0 0 auto; }

    .sectors { margin-top: .25rem; }
    .sectors summary { cursor: pointer; color: var(--muted); font-size: .8rem; padding: .25rem 0; }
    .sectors-body { max-height: 280px; overflow-y: auto; padding: .25rem .1rem; display: flex; flex-direction: column; gap: .5rem; }
    .sector { background: var(--panel-2); border: 1px solid var(--border); border-radius: 6px; padding: .4rem .55rem; }
    .sector-head { display: flex; gap: .4rem; align-items: baseline; font-size: .8rem; margin-bottom: .25rem; }
    .sector-head .muted { font-size: .7rem; }
    .sector-pts { display: flex; flex-wrap: wrap; gap: .35rem; }
    .sector-pt { display: inline-flex; align-items: center; gap: .3rem; font-size: .72rem; color: var(--text); background: #0b0f14; padding: .15rem .4rem; border-radius: 3px; font-variant-numeric: tabular-nums; }

    .avail-error { color: var(--red); font-size: .75rem; border: 1px solid rgba(248,81,73,.4); background: rgba(248,81,73,.08); padding: .35rem .5rem; border-radius: 4px; }

    .raw { margin-top: .3rem; }
    .raw summary { cursor: pointer; color: var(--muted); font-size: .8rem; padding: .25rem 0; }
    .raw pre {
      margin: .4rem 0 0; padding: .75rem; background: #0b0f14;
      border: 1px solid var(--border); border-radius: 6px;
      font-size: .72rem; max-height: 320px; overflow: auto;
    }
    .raw code { font-family: "SF Mono", Consolas, "Liberation Mono", monospace; }

    .empty { grid-column: 1 / -1; text-align: center; color: var(--muted); padding: 2rem; }
  </style>
</head>
<body>
  <header>
    <h1>ONEBOX sessions</h1>
    <div class="meta">
      <code>GET ${esc(BASE_URL)}/catalog-api/v1/sessions</code> ·
      channel <code>${esc(env.ONEBOX_CHANNEL_ID)}</code> ·
      captured ${esc(generatedAt)}
    </div>
    <div class="stats">
      <span class="stat"><strong>${sessions.length}</strong> sessions</span>
      <span class="stat"><strong>${uniqueEvents}</strong> events</span>
      <span class="stat"><strong>${uniqueVenues}</strong> venues</span>
      <span class="stat"><strong>${onSale}</strong> on sale</span>
      <span class="stat"><strong>${soldOut}</strong> sold out</span>
      <span class="stat"><strong>${totalSectors}</strong> sectors</span>
    </div>
    <div class="filter">
      <input id="q" type="search" placeholder="Filter by event or venue name…" autocomplete="off" />
    </div>
  </header>
  <main class="grid" id="grid">
    ${cards || '<div class="empty">No sessions returned.</div>'}
  </main>
  <script>
    const q = document.getElementById("q");
    const grid = document.getElementById("grid");
    q.addEventListener("input", () => {
      const term = q.value.trim().toLowerCase();
      for (const card of grid.querySelectorAll(".card")) {
        const ev = card.dataset.event || "";
        const vn = card.dataset.venue || "";
        card.style.display = !term || ev.includes(term) || vn.includes(term) ? "" : "none";
      }
    });
  </script>
</body>
</html>`;

  const out = join(HERE, "onebox-sessions-cards.html");
  writeFileSync(out, html);
  console.log(`✔ wrote ${out}`);
}

main().catch((err) => {
  console.error("✖", err.message);
  process.exit(1);
});
