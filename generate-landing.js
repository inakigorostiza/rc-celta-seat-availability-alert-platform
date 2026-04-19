import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE_URL = "https://api.oneboxtds.net";
const CLIENT_ID = "seller-channel-client";
const HERE = dirname(fileURLToPath(import.meta.url));
const TARGET_SESSION_ID = 240895;
const GA4_MEASUREMENT_ID = "G-QFVXMME2ZY";

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

function pickText(obj, preferred = ["es-ES", "en-US", "ca-ES"]) {
  if (!obj || typeof obj !== "object") return "";
  for (const k of preferred) if (obj[k]) return obj[k];
  return Object.values(obj).find(Boolean) ?? "";
}

function formatDate(iso, tz) {
  if (!iso) return "";
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

function pickImage(session) {
  const ev = session?.event ?? {};
  const bagUrl = (bag) => {
    if (!bag) return null;
    if (typeof bag === "string") return bag;
    if (Array.isArray(bag)) {
      for (const entry of bag) {
        const u = pickText(entry);
        if (u) return u;
      }
      return null;
    }
    return pickText(bag) || null;
  };
  return (
    bagUrl(ev.images?.landscape) ||
    bagUrl(ev.images?.main) ||
    bagUrl(session?.images?.landscape) ||
    bagUrl(session?.venue?.image) ||
    null
  );
}

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function main() {
  const env = loadEnv();
  console.log("→ authenticating");
  const token = await auth(env);

  console.log("→ GET /catalog-api/v1/sessions");
  const body = await apiGet("/catalog-api/v1/sessions", token);
  const raw = body.data ?? [];

  const session = raw.find((s) => s.id === TARGET_SESSION_ID);
  if (!session) {
    throw new Error(`session ${TARGET_SESSION_ID} not found in /sessions response`);
  }
  console.log(`→ GET /catalog-api/v1/sessions/${TARGET_SESSION_ID}/availability`);
  const av = await apiGet(
    `/catalog-api/v1/sessions/${TARGET_SESSION_ID}/availability`,
    token,
  );

  const priceTypeColors = new Map(
    (av.price_types ?? []).map((pt) => [pt.id, pt.ui_settings?.color || "#5b9bd5"]),
  );

  const sectors = (av.sectors ?? [])
    .map((sec) => {
      const ptsInSec = sec.price_types ?? [];
      let total = 0;
      let available = 0;
      for (const pt of ptsInSec) {
        total += pt.availability?.total ?? 0;
        available += pt.availability?.available ?? 0;
      }
      return {
        id: sec.id,
        name: sec.name,
        code: sec.code ?? null,
        priceTypes: ptsInSec.map((pt) => ({
          id: pt.id,
          name: pt.name,
          color: priceTypeColors.get(pt.id) || "#5b9bd5",
          available: pt.availability?.available ?? 0,
          total: pt.availability?.total ?? 0,
        })),
        total,
        available,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es", { numeric: true }));

  const tz = session.venue?.location?.time_zone;
  const eventInfo = {
    id: session.id,
    sessionName: session.name,
    eventId: session.event?.id,
    eventName:
      session.event?.name || pickText(session.event?.texts?.title) || `Event ${session.event?.id}`,
    subtitle: pickText(session.event?.texts?.subtitle) || "",
    venue: session.venue?.name || "",
    city: session.venue?.location?.city || "",
    startDateIso: session.date?.start ?? null,
    startDateLabel: formatDate(session.date?.start, tz),
    saleEndLabel: formatDate(session.date?.sale_end, tz),
    onSale: !!session.on_sale,
    soldOut: !!session.sold_out,
    priceMin: session.price?.min?.value ?? null,
    priceMax: session.price?.max?.value ?? null,
    image: pickImage(session),
    totalAvailable: av.availability?.available ?? 0,
    total: av.availability?.total ?? 0,
  };

  console.log(
    `  sectors=${sectors.length}, availability=${eventInfo.totalAvailable}/${eventInfo.total}`,
  );

  const supabaseConfig = {
    url: env.SUPABASE_URL || "",
    anonKey: env.SUPABASE_ANON_KEY || "",
    functionName: "avisame-signup",
    channelId: Number(env.ONEBOX_CHANNEL_ID),
  };
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.warn(
      "  ⚠ SUPABASE_URL / SUPABASE_ANON_KEY missing — landing will log submissions to console only.",
    );
  } else {
    console.log(
      `  supabase target: ${supabaseConfig.url}/functions/v1/${supabaseConfig.functionName}`,
    );
  }

  const dataJson = JSON.stringify({
    event: eventInfo,
    sectors,
    supabase: supabaseConfig,
  });

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>¡Avísame! · R.C. Celta de Vigo</title>
  <!-- Google tag (gtag.js) — GA4 -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA4_MEASUREMENT_ID}');
  </script>
  <style>
    :root {
      --celta-blue: #7AB1D9;
      --celta-blue-hero: #6AA3D4;
      --celta-blue-dark: #5B9BD5;
      --celta-blue-darker: #4a89c3;
      --celta-blue-soft: #E6EFF8;
      --celta-blue-line: #c2d8ea;
      --text-navy: #0a1a3a;
      --text: #10213f;
      --muted: #6b7a8f;
      --asterisk: #D61034;
      --success: #0a8754;
      --white: #ffffff;
      --shadow-card: 0 20px 48px rgba(10, 26, 58, .14);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, Helvetica, Arial, sans-serif;
      color: var(--text);
      line-height: 1.55;
      background: var(--white);
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--celta-blue-darker); }

    .page {
      position: relative;
      background: linear-gradient(180deg, var(--celta-blue-hero) 0%, var(--celta-blue) 45%, #c9ddee 80%, var(--white) 100%);
      overflow: hidden;
      padding-bottom: 3.5rem;
    }
    .page::after {
      content: "";
      position: absolute;
      top: 40px; right: -80px;
      width: 420px; height: 420px;
      background: url('assets/celta-crest.svg') no-repeat center center;
      background-size: contain;
      opacity: .18;
      pointer-events: none;
      z-index: 0;
    }
    .page > * { position: relative; z-index: 1; }

    header.site {
      padding: 1.5rem 1.25rem .5rem;
      display: flex; justify-content: center; align-items: center; gap: .75rem;
    }
    .crest-sm { width: 56px; height: 56px; display: block; }
    .pill {
      border: 1px solid rgba(255,255,255,.6);
      color: var(--white);
      padding: .45rem .9rem;
      border-radius: 999px;
      font-size: .7rem; letter-spacing: .18em; font-weight: 700;
      background: rgba(255,255,255,.05);
    }

    .hero {
      max-width: 720px; margin: 0 auto;
      padding: 1.5rem 1.25rem 2.5rem;
      text-align: left;
      color: var(--white);
    }
    .hero h1 {
      font-size: clamp(1.8rem, 4vw, 2.4rem);
      margin: 0 0 .5rem;
      font-weight: 800;
      color: var(--white);
      letter-spacing: -.01em;
    }
    .hero p.sub {
      font-size: 1rem;
      color: rgba(255,255,255,.95);
      margin: 0;
      max-width: 500px;
    }

    main.wrap {
      max-width: 720px; margin: 0 auto;
      padding: 0 1.25rem;
      display: grid; gap: 1.25rem;
    }

    .event-card {
      background: var(--white);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: var(--shadow-card);
    }
    .event-card .event-body { padding: 1.25rem 1.5rem 1.35rem; }
    .event-card .event-head {
      display: flex; align-items: start; justify-content: space-between; gap: .75rem;
      margin-bottom: .15rem;
    }
    .event-card h3 {
      margin: 0;
      font-size: 1.15rem; font-weight: 800; color: var(--text-navy); line-height: 1.25;
    }
    .event-card .subtitle { color: var(--muted); font-size: .85rem; margin: 0 0 .75rem; }
    .event-card .status {
      font-size: .65rem; font-weight: 800; text-transform: uppercase; letter-spacing: .12em;
      padding: .2rem .55rem; border-radius: 999px; white-space: nowrap;
      background: #e6f5ec; color: #0a8754; border: 1px solid #b9e3cd;
    }
    .event-card .status.off { background: #f3e9ea; color: #a21c28; border-color: #e5c2c5; }
    .event-meta {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: .5rem .9rem; font-size: .85rem; color: var(--text);
      margin-top: .5rem;
    }
    .event-meta .item { display: flex; align-items: center; gap: .35rem; }
    .event-meta .ico { width: 14px; height: 14px; stroke: var(--celta-blue-darker); stroke-width: 2; fill: none; flex-shrink: 0; }
    .event-avail {
      margin-top: .85rem;
      background: var(--celta-blue-soft);
      border-radius: 8px;
      padding: .55rem .7rem;
      font-size: .78rem;
      display: flex; justify-content: space-between; align-items: center;
      color: var(--text-navy);
    }
    .event-avail strong { color: var(--celta-blue-darker); font-variant-numeric: tabular-nums; }

    .card {
      background: var(--white);
      border-radius: 18px;
      padding: 2rem 2rem 1.5rem;
      box-shadow: var(--shadow-card);
    }
    .card h2 {
      margin: 0 0 .4rem;
      font-size: 1.4rem; color: var(--text-navy); font-weight: 800;
    }
    .mandatory { color: var(--asterisk); font-size: .8rem; margin: 0 0 1.25rem; }
    .mandatory::before { content: "* "; }

    form { display: grid; gap: 1.1rem; }

    .field label {
      display: block;
      font-weight: 700; font-size: .9rem;
      color: var(--text-navy);
      margin-bottom: .4rem;
    }
    .field label .req { color: var(--asterisk); margin-left: .15rem; }

    input[type="text"], input[type="email"], select {
      width: 100%;
      padding: .9rem 1rem;
      border: 1px solid var(--celta-blue-line);
      border-radius: 10px;
      background: #F4F8FC;
      font: inherit;
      font-size: 1rem;
      color: var(--text);
      transition: border-color .15s, box-shadow .15s, background .15s;
    }
    input::placeholder { color: #94b4ce; }
    input:focus, select:focus {
      outline: none;
      border-color: var(--celta-blue-dark);
      box-shadow: 0 0 0 3px rgba(91, 155, 213, .22);
      background: var(--white);
    }
    select { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%235b9bd5' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>"); background-repeat: no-repeat; background-position: right 1rem center; padding-right: 2.4rem; }
    select:disabled { opacity: .55; cursor: not-allowed; }

    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 540px) { .row { grid-template-columns: 1fr; } }

    .consent {
      background: var(--celta-blue-soft);
      border-radius: 10px;
      padding: 1rem 1.15rem;
      display: grid; gap: .5rem;
    }
    .consent-row { display: flex; align-items: flex-start; gap: .65rem; }
    .consent-row input[type="checkbox"] {
      appearance: none; -webkit-appearance: none;
      width: 20px; height: 20px; flex-shrink: 0; margin-top: .1rem;
      border: 1px solid var(--celta-blue-line);
      background: var(--white);
      border-radius: 4px;
      cursor: pointer;
      display: grid; place-items: center;
      transition: border-color .15s, background .15s;
    }
    .consent-row input[type="checkbox"]:checked {
      background: var(--celta-blue-dark);
      border-color: var(--celta-blue-dark);
    }
    .consent-row input[type="checkbox"]:checked::after {
      content: ""; width: 6px; height: 10px;
      border: solid #fff; border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-1px, -1px);
    }
    .consent-row label {
      font-size: .9rem; font-weight: 700; color: var(--text-navy); cursor: pointer;
    }
    .consent-row label .req { color: var(--asterisk); margin-left: .15rem; }
    .consent p {
      margin: 0 0 0 1.85rem; font-size: .8rem; color: var(--muted);
      line-height: 1.5;
    }
    .consent p a { color: var(--celta-blue-darker); font-weight: 600; text-decoration: underline; }

    button[type="submit"] {
      margin-top: .5rem;
      padding: 1rem 1.25rem;
      background: var(--celta-blue-dark);
      color: var(--white); border: none; border-radius: 10px;
      font: inherit; font-size: 1rem; font-weight: 700;
      cursor: pointer;
      transition: background .15s, transform .05s;
    }
    button[type="submit"]:hover { background: var(--celta-blue-darker); }
    button[type="submit"]:active { transform: translateY(1px); }
    button[type="submit"]:disabled { background: #b9c9d9; cursor: not-allowed; }

    .disclaimer {
      font-size: .8rem; color: var(--muted);
      text-align: center; margin: 1rem 0 .25rem;
    }

    .zone-hint { font-size: .75rem; color: var(--muted); margin-top: .5rem; display: none; }
    .zone-hint.show { display: flex; flex-wrap: wrap; gap: .4rem; }
    .zone-hint .chip { display: inline-flex; align-items: center; gap: .3rem; background: var(--celta-blue-soft); padding: .15rem .5rem; border-radius: 999px; }
    .zone-hint .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

    .success {
      display: none;
      background: #eaf7f0; border: 1px solid #b9e3cd;
      color: #0b5c3a; padding: 1rem 1.25rem; border-radius: 10px;
      margin-top: 1rem; font-size: .9rem;
    }
    .success.show { display: block; }
    .success strong { color: var(--success); }
    .success pre {
      background: #fff; border: 1px solid #d6ece0; padding: .6rem .75rem;
      border-radius: 6px; overflow: auto; font-size: .75rem; margin: .5rem 0 0;
      font-family: "SF Mono", Consolas, "Liberation Mono", monospace;
    }

    footer.site {
      background: var(--celta-blue);
      padding: 2rem 1.25rem 1.75rem;
      text-align: center;
    }
    footer .sponsors-label {
      font-size: .7rem; letter-spacing: .26em; text-transform: uppercase;
      color: var(--text-navy); font-weight: 800; margin-bottom: 1rem;
    }
    footer .sponsors {
      display: flex; justify-content: center; align-items: center; gap: 2.75rem;
      flex-wrap: wrap; margin-bottom: 1rem;
    }
    footer .sponsors img { height: 28px; width: auto; display: block; }
    footer .sponsors .txt-logo {
      color: var(--text-navy); font-weight: 800; font-size: 1rem;
      letter-spacing: .02em; line-height: 1;
      display: inline-flex; align-items: center; gap: .35rem;
    }
    footer .sponsors .txt-logo small { font-size: .55rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; opacity: .7; }
    footer .legal { color: var(--text-navy); opacity: .75; font-size: .72rem; max-width: 560px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="page">
    <header class="site">
      <img class="crest-sm" src="assets/celta-crest.svg" alt="R.C. Celta de Vigo" />
      <span class="pill">RC Celta · Entradas</span>
    </header>

    <section class="hero">
      <h1>¡Avísame!</h1>
      <p class="sub">Regístrate para recibir un email en cuanto se liberen nuevas entradas para la grada que te interesa.</p>
    </section>

    <main class="wrap">
      <section id="event-card" class="event-card"></section>

      <div class="card">
        <h2>Déjanos tus datos</h2>
        <p class="mandatory">Campos obligatorios</p>

        <form id="notify-form" novalidate>
          <div class="field">
            <label for="email">Dirección de correo electrónico <span class="req">*</span></label>
            <input id="email" name="email" type="email" required autocomplete="email" placeholder="tuemail@dominio.com" />
          </div>

          <div class="row">
            <div class="field">
              <label for="name">Nombre <span class="req">*</span></label>
              <input id="name" name="name" type="text" required autocomplete="given-name" placeholder="Tu nombre" />
            </div>
            <div class="field">
              <label for="surname">Apellidos <span class="req">*</span></label>
              <input id="surname" name="surname" type="text" required autocomplete="family-name" placeholder="Tus apellidos" />
            </div>
          </div>

          <div class="field">
            <label for="grada">Grada <span class="req">*</span></label>
            <select id="grada" name="grada" required>
              <option value="">Selecciona una grada</option>
            </select>
          </div>

          <div class="consent">
            <div class="consent-row">
              <input type="checkbox" id="consent" required />
              <label for="consent">Quiero recibir el aviso por email <span class="req">*</span></label>
            </div>
            <p>Acepto la <a href="#" onclick="event.preventDefault()">política de privacidad</a>, el tratamiento de mis datos y quiero recibir avisos de disponibilidad. Puedes darte de baja en cualquier momento a través del enlace incluido en nuestras comunicaciones.</p>
          </div>

          <button type="submit" id="submit-btn">Quiero recibir el aviso</button>
        </form>

        <div id="success" class="success">
          <strong>¡Listo!</strong> Te avisaremos en cuanto detectemos disponibilidad.
          <pre id="success-detail"></pre>
        </div>

        <p class="disclaimer">Este formulario no garantiza disponibilidad ni reserva de entrada.</p>
      </div>
    </main>
  </div>

  <footer class="site">
    <div class="sponsors-label">Patrocinadores principales</div>
    <div class="sponsors">
      <img src="assets/abanca-dark.svg" alt="ABANCA" />
      <span class="txt-logo">Estrella Galicia</span>
      <span class="txt-logo">hummel</span>
    </div>
    <div class="legal">Demo en sandbox · datos servidos por la API Catalog de ONEBOX (entorno PRE, canal ${env.ONEBOX_CHANNEL_ID}).</div>
  </footer>

  <script>
    const { event, sectors, supabase } = ${dataJson};

    // Render event card
    const eventCard = document.getElementById("event-card");
    const pct = event.total > 0 ? Math.round((event.totalAvailable / event.total) * 100) : 0;
    const statusHtml = event.soldOut
      ? '<span class="status off">Agotado</span>'
      : event.onSale
        ? '<span class="status">On sale</span>'
        : '<span class="status off">Off sale</span>';
    const metaItems = [];
    if (event.startDateLabel) {
      metaItems.push(\`<span class="item"><svg class="ico" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>\${event.startDateLabel}</span>\`);
    }
    if (event.venue) {
      const place = event.city ? \`\${event.venue}, \${event.city}\` : event.venue;
      metaItems.push(\`<span class="item"><svg class="ico" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>\${place}</span>\`);
    }
    if (event.priceMin != null) {
      const priceStr = event.priceMin === event.priceMax ? \`\${event.priceMin} €\` : \`\${event.priceMin} € – \${event.priceMax} €\`;
      metaItems.push(\`<span class="item"><svg class="ico" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>\${priceStr}</span>\`);
    }
    eventCard.innerHTML = \`
      <div class="event-body">
        <div class="event-head">
          <h3>\${event.eventName}</h3>
          \${statusHtml}
        </div>
        \${event.subtitle ? \`<p class="subtitle">\${event.subtitle}</p>\` : ""}
        <div class="event-meta">\${metaItems.join("")}</div>
        \${event.total > 0 ? \`<div class="event-avail"><span>Disponibilidad</span><strong>\${event.totalAvailable.toLocaleString("es-ES")} / \${event.total.toLocaleString("es-ES")} (\${pct}%)</strong></div>\` : ""}
      </div>
    \`;

    // Populate gradas (sectors)
    const gradaSel = document.getElementById("grada");
    for (const sec of sectors) {
      const p = sec.total > 0 ? Math.round((sec.available / sec.total) * 100) : 0;
      const label = sec.total > 0
        ? \`\${sec.name} — \${sec.available.toLocaleString("es-ES")} libres (\${p}%)\`
        : sec.name;
      const opt = new Option(label, String(sec.id));
      if (sec.total > 0 && sec.available === 0) opt.disabled = true;
      gradaSel.appendChild(opt);
    }

    const form = document.getElementById("notify-form");
    const success = document.getElementById("success");
    const successDetail = document.getElementById("success-detail");
    const submitBtn = document.getElementById("submit-btn");

    function readUtm() {
      const q = new URLSearchParams(window.location.search);
      return {
        utm_source: q.get("utm_source") || null,
        utm_medium: q.get("utm_medium") || null,
        utm_campaign: q.get("utm_campaign") || null,
        utm_term: q.get("utm_term") || null,
        utm_content: q.get("utm_content") || null,
      };
    }

    async function submitToBackend(payload) {
      if (!supabase.url || !supabase.anonKey) {
        console.warn("[avisame] backend not configured — skipping remote store.");
        return { ok: true, stored: false, duplicate: false, mailchimp: null };
      }
      const res = await fetch(
        \`\${supabase.url}/functions/v1/\${supabase.functionName}\`,
        {
          method: "POST",
          headers: {
            apikey: supabase.anonKey,
            Authorization: \`Bearer \${supabase.anonKey}\`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      let body = null;
      try { body = await res.json(); } catch {}
      if (!res.ok) {
        return { ok: false, status: res.status, error: body?.error ?? "unknown_error", body };
      }
      return {
        ok: true,
        stored: !!body?.stored,
        duplicate: !!body?.duplicate,
        mailchimp: body?.mailchimp ?? null,
      };
    }

    // Error banner injected just above the button
    const errorBanner = document.createElement("div");
    errorBanner.className = "error-banner";
    errorBanner.style.cssText = "display:none;background:#fbe9ea;border:1px solid #f0c2c6;color:#a21c28;padding:.75rem 1rem;border-radius:10px;font-size:.85rem;margin-top:.25rem;";
    submitBtn.parentNode.insertBefore(errorBanner, submitBtn);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const grada = sectors.find((s) => String(s.id) === gradaSel.value);
      const utm = readUtm();

      const payload = {
        email:       document.getElementById("email").value.trim().toLowerCase(),
        first_name:  document.getElementById("name").value.trim(),
        last_name:   document.getElementById("surname").value.trim(),
        channel_id:  supabase.channelId,
        session_id:  event.id,
        event_id:    event.eventId,
        event_name:  event.eventName,
        grada_id:    grada ? grada.id : null,
        grada_name:  grada ? grada.name : null,
        grada_code:  grada ? grada.code : null,
        consent_notify:    document.getElementById("consent").checked,
        consent_privacy:   document.getElementById("consent").checked,
        consent_marketing: document.getElementById("consent").checked,
        locale:      navigator.language || "es-ES",
        referrer:    document.referrer || null,
        user_agent:  navigator.userAgent,
        ...utm,
      };

      errorBanner.style.display = "none";
      submitBtn.disabled = true;
      const prevLabel = submitBtn.textContent;
      submitBtn.textContent = "Enviando…";

      const result = await submitToBackend(payload);
      console.log("[avisame] submit result:", result, "payload:", payload);

      if (!result.ok) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel;
        errorBanner.textContent =
          "No hemos podido registrar tus datos. Inténtalo de nuevo en unos minutos.";
        errorBanner.style.display = "block";
        return;
      }

      const detail = {
        ...payload,
        stored: result.stored,
        duplicate: result.duplicate,
        mailchimp: result.mailchimp,
        submittedAt: new Date().toISOString(),
      };
      successDetail.textContent = JSON.stringify(detail, null, 2);
      form.style.display = "none";
      success.classList.add("show");

      // GA4: fire recommended 'generate_lead' event on successful signup.
      if (typeof gtag === "function") {
        gtag("event", "generate_lead", {
          method: "avisame_form",
          event_id: event.eventId,
          event_name: event.eventName,
          session_id: event.id,
          grada_id: grada ? grada.id : null,
          grada_name: grada ? grada.name : null,
          is_duplicate: !!result.duplicate,
          locale: navigator.language || "es-ES",
        });
      }
    });
  </script>
</body>
</html>`;

  const out = join(HERE, "landing.html");
  writeFileSync(out, html);
  console.log(`✔ wrote ${out}`);
}

main().catch((err) => {
  console.error("✖", err.message);
  process.exit(1);
});
