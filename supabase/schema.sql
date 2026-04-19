-- ONEBOX "avísame" signup store
-- Run once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "uuid-ossp";

-- =============================================================
-- Table
-- =============================================================
create table if not exists public.avisame_signups (
  id uuid primary key default uuid_generate_v4(),

  -- contact
  email       text    not null,
  first_name  text    not null,
  last_name   text    not null,

  -- target (what they're waiting for)
  channel_id  integer not null,
  session_id  bigint  not null,
  event_id    bigint  not null,
  event_name  text,
  grada_id    bigint  not null,
  grada_name  text,
  grada_code  text,

  -- consent (GDPR)
  consent_notify     boolean not null default false,
  consent_privacy    boolean not null default false,
  consent_marketing  boolean not null default false,

  -- marketing / attribution
  locale        text default 'es-ES',
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  referrer      text,
  user_agent    text,

  -- lifecycle
  created_at       timestamptz not null default now(),
  notified_at      timestamptz,
  clicked_at       timestamptz,
  converted_at     timestamptz,
  unsubscribed_at  timestamptz,

  -- one signup per (email, session, grada) pair
  constraint avisame_signups_unique_target
    unique (email, session_id, grada_id)
);

comment on table public.avisame_signups is
  'Ticket availability alert signups from the "¡Avísame!" landing page. Unique per (email, session, grada).';

-- =============================================================
-- Indexes optimised for the two main workflows:
--   1. "who do I need to notify when grada X opens up?"
--   2. "who is this email address subscribed to?"
-- =============================================================
create index if not exists avisame_signups_pending_by_target_idx
  on public.avisame_signups (session_id, grada_id, created_at)
  where notified_at is null and unsubscribed_at is null;

create index if not exists avisame_signups_event_idx
  on public.avisame_signups (event_id)
  where notified_at is null and unsubscribed_at is null;

create index if not exists avisame_signups_email_idx
  on public.avisame_signups (lower(email));

create index if not exists avisame_signups_created_idx
  on public.avisame_signups (created_at desc);

-- =============================================================
-- Row-Level Security
-- Public landing page uses the anon key → INSERT only.
-- Reads/updates/deletes go through service_role (backend jobs, admin).
--
-- Policy is scoped to `public` (not `anon`) on purpose: Supabase's
-- PostgREST runs requests under the `authenticator` login role and
-- `SET LOCAL ROLE`s to the JWT's role, and role-matched policies
-- (`TO anon`) don't reliably bind in that environment. Targeting
-- `public` works for every role; who can actually attempt the INSERT
-- is still gated by table GRANTs (only anon / authenticated /
-- service_role have INSERT) and by the WITH CHECK guards below.
-- =============================================================
alter table public.avisame_signups enable row level security;

drop policy if exists "public can insert signups" on public.avisame_signups;
create policy "public can insert signups"
  on public.avisame_signups
  for insert
  to public
  with check (
    -- hard guards to stop abuse
    char_length(email) between 5 and 254
    and char_length(first_name) between 1 and 120
    and char_length(last_name)  between 1 and 120
    and consent_notify = true
    and consent_privacy = true
  );

-- No SELECT / UPDATE / DELETE policies for anon/authenticated
-- → denied by default under RLS. service_role bypasses RLS.

-- =============================================================
-- Operational helpers (service_role only — safe because RLS blocks anon)
-- =============================================================

-- Pending signups per (session, grada) — useful for the notifier job.
-- security_invoker makes the view respect RLS of the caller (not the view owner).
create or replace view public.avisame_pending
with (security_invoker = true) as
select
  session_id,
  grada_id,
  grada_name,
  count(*) as pending_count,
  min(created_at) as oldest_signup_at
from public.avisame_signups
where notified_at is null
  and unsubscribed_at is null
group by session_id, grada_id, grada_name;

-- Marketing funnel per event.
create or replace view public.avisame_funnel
with (security_invoker = true) as
select
  event_id,
  event_name,
  count(*)                                             as total_signups,
  count(*) filter (where consent_marketing)            as marketing_opt_ins,
  count(*) filter (where notified_at is not null)      as notified,
  count(*) filter (where clicked_at is not null)       as clicked,
  count(*) filter (where converted_at is not null)     as converted,
  count(*) filter (where unsubscribed_at is not null)  as unsubscribed
from public.avisame_signups
group by event_id, event_name;
