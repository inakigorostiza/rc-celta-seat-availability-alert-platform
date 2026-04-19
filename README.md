# ¡Avísame! — ONEBOX availability-alert sandbox

End-to-end demo of a ticket-availability alert flow for a sports club, built as an exploration/sandbox against the [ONEBOX TDS](https://developer.oneboxtds.com/) ticketing API.

```
┌── Landing page ──────────────────────────────────────────────┐
│  static HTML (Celta branding)                                │
│  pulls session + availability from ONEBOX at build time       │
│  GA4 page_view + generate_lead on form submit                 │
└───────────────┬──────────────────────────────────────────────┘
                │  POST JSON (form payload)
                ▼
┌── Supabase Edge Function  avisame-signup ───────────────────┐
│  validates, inserts into public.avisame_signups (SERVICE)    │
│  upserts subscriber into Mailchimp audience                   │
│  applies per-signup tags (event:X, grada:Y, source:avisame)   │
└───────────────┬──────────────────────────────────────────────┘
                │  row stored in Supabase  +  contact in Mailchimp
                ▼
┌── n8n workflow (manual/cron) ────────────────────────────────┐
│  ONEBOX /oauth/token → /sessions → /sessions/{id}/availability│
│  For each grada with seats:                                   │
│    Mailchimp members filtered by tags event:X AND grada:Y     │
│    → Mandrill transactional send with branded HTML + UTMs     │
└───────────────────────────────────────────────────────────────┘
```

## What's in this repo

| Path | What it is |
|---|---|
| [`test-onebox.js`](test-onebox.js) | Minimal Node script that auths against ONEBOX and pokes a couple of endpoints — the first thing that proved the credentials work. |
| [`generate-examples.js`](generate-examples.js) | Produces [`examples.html`](#), a static doc page with request/response examples captured live. |
| [`generate-sessions.js`](generate-sessions.js) | Produces [`sessions.html`](#), a card-grid view of every session for the channel with per-sector availability. |
| [`generate-landing.js`](generate-landing.js) | Produces [`landing.html`](#), the "¡Avísame!" signup form, themed like the RC Celta landing. GA4 tracking + `generate_lead` event included. |
| [`supabase/schema.sql`](supabase/schema.sql) | Idempotent SQL: `public.avisame_signups` table, RLS, GDPR-aware WITH CHECK guards, two ops views (`avisame_pending`, `avisame_funnel`). |
| [`supabase/functions/avisame-signup/index.ts`](supabase/functions/avisame-signup/index.ts) | Edge Function that the landing page POSTs to. Writes the row and syncs to Mailchimp. Reads Mailchimp creds from Vault via a `security definer` RPC. |
| [`n8n/avisame-workflow.json`](n8n/avisame-workflow.json) | The importable n8n workflow for the notifier side. |
| [`assets/`](assets/) | Celta crest + ABANCA logos used by the landing. |

## Quick start (locally)

### 1. Prerequisites

- Node ≥ 18 (uses built-in `fetch`)
- A Supabase project (free tier is fine)
- Mailchimp Marketing account + audience
- Mandrill transactional account (same login as Mailchimp but separate credential)
- n8n instance (cloud or self-hosted)

### 2. Copy `.env.example` → `.env`, fill in

```bash
cp .env.example .env
```

Required keys: `ONEBOX_CLIENT_SECRET`, `ONEBOX_CHANNEL_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

### 3. Prove ONEBOX auth works

```bash
npm start       # → runs test-onebox.js
```

Expected output: `✔ token acquired …` followed by `200 OK` on a catalog endpoint.

### 4. Create the Supabase table + RPC

In the Supabase SQL editor, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and run. Then create the `get_mailchimp_config()` RPC and store Mailchimp creds in Vault:

```sql
-- secrets live in Supabase Vault, not in .env
select vault.create_secret('<your-mc-api-key>',    'mailchimp_api_key', 'Mailchimp Marketing API key');
select vault.create_secret('<your-list-id>',       'mailchimp_audience_id', 'Mailchimp audience');
select vault.create_secret('us21',                 'mailchimp_server',  'Mailchimp data center');
```

### 5. Deploy the Edge Function

Via the Supabase CLI:

```bash
supabase functions deploy avisame-signup
```

Or via the Supabase dashboard (copy [`supabase/functions/avisame-signup/index.ts`](supabase/functions/avisame-signup/index.ts)).

### 6. Generate the pages

```bash
node generate-landing.js     # → landing.html
node generate-sessions.js    # → sessions.html
node generate-examples.js    # → examples.html
open landing.html            # or open any of them
```

The `generate-*.js` scripts hit the ONEBOX API at build time and bake the data into static HTML. Rerun any time the catalog changes.

### 7. Import the n8n workflow

1. n8n → **Workflows → Import from File** → pick `n8n/avisame-workflow.json`.
2. In the imported **Vars** node, replace the four `REPLACE_WITH_*` placeholders with your real values.
3. Link the **Mailchimp API** credential on the `Mailchimp Members` node.
4. Execute.

## Architecture decisions worth knowing

- **Supabase RLS policy targets `TO public` instead of `TO anon`** — PostgREST's role-switching doesn't always bind `TO anon` policies on hosted Supabase. `TO public` with strict `WITH CHECK` guards is functionally identical and always works. See the schema's inline comment.
- **Secrets live in Supabase Vault**, not in Edge Function env vars, so the whole project can be provisioned via SQL/MCP without a separate deploy step for secrets. The Edge Function reads them through a `security definer` RPC restricted to `service_role`.
- **Mailchimp tags stack, merge fields overwrite.** For segmentation (per-grada notifier targeting) we use tags. For at-a-glance UI in the Mailchimp contact card we use merge fields. Both are set on every signup.
- **Mandrill sender domain must be verified.** The demo's `from_email` defaults to `avisame@lin3s.com`. Point it at a domain you control with SPF + DKIM verified in Mandrill, or every send will reject with `unsigned`.
- **Landing page is static by design.** Data is fetched from ONEBOX at *build time* (via `node generate-*.js`) rather than at page load, which keeps the public page dependency-free and makes it trivial to host on any static service (Netlify, Vercel, GitHub Pages, S3).

## Tracking

- **Supabase** — source of truth for signup data (all UTMs, locale, user agent, consents captured).
- **Mailchimp** — marketing-ready subscriber list with merge fields + tags, ready for segments and campaigns.
- **Mandrill analytics** — per-email opens/clicks on the notifier sends.
- **GA4** — `page_view` + `generate_lead` (recommended event) on every successful form submission, with event/grada custom params. Mark `generate_lead` as a Key Event to count it as a conversion.

## License

Private sandbox — do not use in production without a security review.
