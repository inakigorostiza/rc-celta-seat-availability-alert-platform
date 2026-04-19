// Edge Function: avisame-signup
// Accepts a signup POST from the landing page, writes it to the
// `public.avisame_signups` table, and upserts the subscriber into
// Mailchimp (merge fields + tags).
//
// Why this shape:
//  - One call from the browser → atomic "stored in DB + synced to Mailchimp"
//  - Mailchimp API key lives in Vault; browser never sees it
//  - Idempotent: re-signups update merge fields (PUT) and accumulate tags
//
// Deployed via the Supabase MCP. Secrets are read through the
// SECURITY DEFINER RPC `public.get_mailchimp_config()` using the
// service-role Supabase client.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info, prefer",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function md5Lower(s: string): string {
  return createHash("md5").update(s.toLowerCase()).digest("hex");
}

type SignupPayload = {
  email: string;
  first_name: string;
  last_name: string;
  channel_id: number | string;
  session_id: number | string;
  event_id: number | string;
  event_name?: string | null;
  grada_id: number | string;
  grada_name?: string | null;
  grada_code?: string | null;
  consent_notify: boolean;
  consent_privacy: boolean;
  consent_marketing?: boolean;
  locale?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  referrer?: string | null;
  user_agent?: string | null;
};

function validate(p: SignupPayload): string | null {
  if (!p) return "missing_payload";
  if (typeof p.email !== "string" || p.email.length < 5 || p.email.length > 254)
    return "invalid_email";
  if (typeof p.first_name !== "string" || p.first_name.length < 1 || p.first_name.length > 120)
    return "invalid_first_name";
  if (typeof p.last_name !== "string" || p.last_name.length < 1 || p.last_name.length > 120)
    return "invalid_last_name";
  if (!p.consent_notify) return "missing_consent_notify";
  if (!p.consent_privacy) return "missing_consent_privacy";
  if (p.session_id == null || p.event_id == null || p.grada_id == null)
    return "missing_target";
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const payload = (await req.json().catch(() => null)) as SignupPayload | null;
  const validationError = validate(payload as SignupPayload);
  if (validationError || !payload) return json({ error: validationError ?? "invalid_payload" }, 400);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const row = {
    email: String(payload.email).trim().toLowerCase(),
    first_name: String(payload.first_name).trim(),
    last_name: String(payload.last_name).trim(),
    channel_id: Number(payload.channel_id),
    session_id: Number(payload.session_id),
    event_id: Number(payload.event_id),
    event_name: payload.event_name ?? null,
    grada_id: Number(payload.grada_id),
    grada_name: payload.grada_name ?? null,
    grada_code: payload.grada_code ?? null,
    consent_notify: true,
    consent_privacy: true,
    consent_marketing: !!payload.consent_marketing,
    locale: payload.locale ?? "es-ES",
    utm_source: payload.utm_source ?? null,
    utm_medium: payload.utm_medium ?? null,
    utm_campaign: payload.utm_campaign ?? null,
    utm_term: payload.utm_term ?? null,
    utm_content: payload.utm_content ?? null,
    referrer: payload.referrer ?? null,
    user_agent: payload.user_agent ?? null,
  };

  // 1) Supabase insert (service_role bypasses RLS; we validated above)
  let stored = false;
  let duplicate = false;
  const { error: insErr } = await admin.from("avisame_signups").insert(row);
  if (insErr) {
    if (insErr.code === "23505") {
      duplicate = true;
    } else {
      return json({ ok: false, stage: "db_insert", error: insErr.message, code: insErr.code }, 500);
    }
  } else {
    stored = true;
  }

  // 2) Fetch Mailchimp config from Vault via RPC
  const { data: cfgRaw, error: cfgErr } = await admin.rpc("get_mailchimp_config");
  if (cfgErr || !cfgRaw) {
    return json(
      {
        ok: true,
        stored,
        duplicate,
        mailchimp: { skipped: "no_config", error: cfgErr?.message ?? "vault_empty" },
      },
      200,
    );
  }
  const cfg = typeof cfgRaw === "string" ? JSON.parse(cfgRaw) : (cfgRaw as Record<string, string>);

  const mcKey = cfg.api_key;
  const mcServer = cfg.server;
  const mcList = cfg.audience_id;
  const subscriberHash = md5Lower(row.email);
  const authHeader = "Basic " + btoa("any:" + mcKey);
  const today = new Date().toISOString().slice(0, 10);

  const mergeFields: Record<string, string | number | null> = {
    FNAME: row.first_name,
    LNAME: row.last_name,
    CHANNEL: String(row.channel_id),
    LOCALE: row.locale ?? "es-ES",
    SRC: row.utm_source ?? "",
    CAMPAIGN: row.utm_campaign ?? "",
    LANDING: "avisame-celta",
    SIGNUPAT: today,
    EVENT_ID: row.event_id,
    EVENT_NAME: row.event_name ?? "",
    SESSION_ID: row.session_id,
    GRADA_ID: row.grada_id,
    GRADA_NAME: row.grada_name ?? "",
    GRADA_CODE: row.grada_code ?? "",
  };

  // 3) PUT member (upsert by subscriber hash)
  const memberRes = await fetch(
    `https://${mcServer}.api.mailchimp.com/3.0/lists/${mcList}/members/${subscriberHash}`,
    {
      method: "PUT",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({
        email_address: row.email,
        status_if_new: "subscribed",
        merge_fields: mergeFields,
      }),
    },
  );
  const memberBody = (await memberRes.json().catch(() => ({}))) as Record<string, unknown>;

  // 4) POST tags (accumulates history per subscriber)
  const tagNames = [
    `event:${row.event_id}`,
    `session:${row.session_id}`,
    `grada:${row.grada_id}`,
    row.grada_name ? `grada-name:${row.grada_name}` : null,
    "source:avisame",
    row.consent_marketing ? "consent-marketing" : null,
  ].filter(Boolean) as string[];

  let tagsStatus: number | null = null;
  if (memberRes.ok) {
    const tagsRes = await fetch(
      `https://${mcServer}.api.mailchimp.com/3.0/lists/${mcList}/members/${subscriberHash}/tags`,
      {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          tags: tagNames.map((name) => ({ name, status: "active" })),
        }),
      },
    );
    tagsStatus = tagsRes.status;
  }

  return json(
    {
      ok: true,
      stored,
      duplicate,
      mailchimp: {
        member_status: memberRes.status,
        member_id: memberBody.id ?? null,
        tags_status: tagsStatus,
        tags_applied: tagNames,
        error: memberRes.ok ? null : (memberBody as { detail?: string }).detail ?? null,
      },
    },
    200,
  );
});
