# 🎟️ RC Celta — Seat Availability Alert Platform

Case study for the **AI Marketing Lab** · IE Business School.

A lead-recovery platform that captures demand while tickets are sold-out, detects when seats free up, and notifies each interested fan with a personalised email. Built with the marketing tools you'll meet again and again: **ONEBOX → Mailchimp → Mandrill → n8n → GA4**.

| | |
|---|---|
| 📖 **Interactive manual** | [inakigorostiza.github.io/…/manual.html](https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/manual.html) **← start here** |
| 🌐 **Live landing** | [inakigorostiza.github.io/rc-celta-seat-availability-alert-platform](https://inakigorostiza.github.io/rc-celta-seat-availability-alert-platform/) |
| 📓 **Colab notebook (alt format)** | [Open in Google Colab](https://colab.research.google.com/github/inakigorostiza/rc-celta-seat-availability-alert-platform/blob/main/presentation.ipynb) |
| 🎬 **Video (2 min)** | [youtu.be/-FURuRfDk8I](https://youtu.be/-FURuRfDk8I) |

```
┌─────────────────────────────────────────────────────────────────┐
│  🎟️  ONEBOX TDS  (source of truth for seat availability)         │
└──────────────┬────────────────────────────┬─────────────────────┘
               │ at build time               │ every X min (cron)
               ▼                             ▼
   ┌───────────────────────┐    ┌──────────────────────────────┐
   │  🌐  Landing page     │    │  🤖  n8n automation          │
   │  (GitHub Pages)       │    │  ONEBOX → MC → Mandrill      │
   └───────────┬───────────┘    └────┬──────────────────┬──────┘
               │ form submit         │ read contacts    │ send email
               ▼                     │                  ▼
   ┌───────────────────────┐ ◀───────┘      ┌────────────────────┐
   │  📬  Mailchimp        │                 │  ✉️  Mandrill      │
   │  audience + tags      │                 │  transactional     │
   └───────────────────────┘                 └────────────────────┘
               │
               ▼ events
   ┌───────────────────────┐
   │  📊  GA4              │
   └───────────────────────┘
```

## What's in this repo

| Path | What it is |
|---|---|
| [`manual.html`](manual.html) | **Start here.** Interactive web-based walkthrough of the platform (single-page, dark UI, embedded video, interactive tabs + diagrams). |
| [`presentation.ipynb`](presentation.ipynb) | Same 12-section walkthrough in Google Colab format — for instructors who prefer a notebook. |
| [`test-onebox.js`](test-onebox.js) | Minimal Node script that auths against ONEBOX and pokes a couple of endpoints. |
| [`generate-examples.js`](generate-examples.js) | Produces `examples.html` — a static doc page with live API request/response examples. |
| [`generate-sessions.js`](generate-sessions.js) | Produces `sessions.html` — a card-grid view of every session with per-sector availability. |
| [`generate-landing.js`](generate-landing.js) | Produces [`landing.html`](landing.html) — the "¡Avísame!" signup form, themed like the RC Celta landing. GA4 tracking + `generate_lead` event included. |
| [`landing.html`](landing.html) · [`index.html`](index.html) | Generated landing page, served by GitHub Pages. |
| [`n8n/avisame-workflow.json`](n8n/avisame-workflow.json) | Importable n8n workflow — the notifier side of the platform. |
| [`assets/`](assets/) | Celta crest + ABANCA logo used by the landing. |

## Quick start (locally)

### 1 · Prerequisites

- Node ≥ 18 (uses built-in `fetch`)
- Mailchimp Marketing account + audience
- Mandrill transactional account (same login as Mailchimp, separate API key)
- n8n instance (cloud or self-hosted)
- Google Analytics 4 property

### 2 · Copy `.env.example` → `.env`, fill in

```bash
cp .env.example .env
```

Required keys: `ONEBOX_CLIENT_SECRET`, `ONEBOX_CHANNEL_ID`.

### 3 · Prove ONEBOX auth works

```bash
npm start       # → runs test-onebox.js
```

Expected output: `✔ token acquired …` followed by `200 OK` on a catalog endpoint.

### 4 · Generate the pages

```bash
node generate-landing.js     # → landing.html
node generate-sessions.js    # → sessions.html
node generate-examples.js    # → examples.html
open landing.html
```

The `generate-*.js` scripts hit the ONEBOX API at build time and bake the data into static HTML. Rerun any time the catalog changes.

### 5 · Import the n8n workflow

1. n8n → **Workflows → Import from File** → pick `n8n/avisame-workflow.json`.
2. In the imported **Vars** node, replace the `REPLACE_WITH_*` placeholders with your real values (ONEBOX secret, Mailchimp list ID, Mandrill key).
3. Link the **Mailchimp API** credential on the `Mailchimp Members` node.
4. Execute.

## Architecture decisions worth knowing

- **Mailchimp tags stack, merge fields overwrite.** For segmentation (per-grada notifier targeting) we use tags. For at-a-glance view in the Mailchimp contact card we use merge fields. Both are set on every signup.
- **Mandrill sender domain must be verified.** The demo's `from_email` defaults to `avisame@lin3s.com`. Point it at a domain you control with SPF + DKIM verified in Mandrill, or every send will reject with `unsigned`.
- **Landing page is static by design.** Data is fetched from ONEBOX at *build time* (via `node generate-*.js`) rather than at page load, which keeps the public page dependency-free and makes it trivial to host on GitHub Pages, Netlify, Vercel or S3.

## Tracking

- **Mailchimp** — marketing-ready subscriber list with merge fields + tags, ready for segments and campaigns.
- **Mandrill analytics** — per-email opens/clicks on the notifier sends.
- **GA4** — `page_view` + `generate_lead` (recommended event) on every successful form submission, with event/grada custom params. Mark `generate_lead` as a Key Event to count it as a conversion.

## Under the hood

The form submission passes through a tiny hosted backend (a Supabase Edge Function, source in [`supabase/`](supabase/)) that validates the payload, persists it as a safety net, and forwards the contact into Mailchimp. It's plumbing — for a marketing-focused walkthrough of the platform, use [`presentation.ipynb`](presentation.ipynb), which treats the automation as a single layer.

## License

Case-study sandbox — do not use in production without a security review.
