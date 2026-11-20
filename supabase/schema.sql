-- Run in Supabase SQL editor (Phase 2b wires the app to these tables).
create table sources(id text primary key,title text,title_en text,office text,office_en text,url text,aliases text,text text,text_en text,svc boolean default true,pending boolean default false,checklist jsonb,mock boolean default false,verified_at date,created_at timestamptz default now());
create table reports(id text primary key,cat text,descr text,ward int,status text default 'received',priority text,ai jsonb,geo jsonb,loc text,is_mock boolean default false,created_at timestamptz default now());
create table report_events(id bigserial primary key,report_id text references reports(id),status text,note text,at timestamptz default now());
create table budget_items(id bigserial primary key,item text,item_en text,category text,category_en text,unit_price numeric,qty numeric,vendor text,vendor_en text,ward int,source_url text);
alter table sources enable row level security;alter table reports enable row level security;alter table report_events enable row level security;alter table budget_items enable row level security;
create policy "public read sources" on sources for select using(true);
create policy "public read budget" on budget_items for select using(true);
-- reports and report_events have NO public policies: the browser can never read or write them directly.
-- All access goes through the Next.js API routes (/api/reports, /api/staff) using the server-side service-role key,
-- which returns ward-level data publicly and the full description only to the person holding the tracking ID or to staff.
-- staff writes (update status, add sources, import budget) go through the service-role key on the server.

-- Shared knowledge base + budget (admin-edited, read by every device). Run this once more if you already ran the schema above.
create table if not exists shared_data(key text primary key,value jsonb,updated_at timestamptz default now());
alter table shared_data enable row level security;
-- no public policies: only the /api/shared route (service-role key) reads or writes it.
