create table page_views (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index page_views_created_at_idx on page_views (created_at desc);
create index page_views_session_id_idx on page_views (session_id);

alter table page_views enable row level security;

-- Anyone visiting the public site can log a pageview.
create policy "page_views public insert" on page_views
  for insert with check (true);

-- Only Dana can read the analytics.
create policy "page_views authenticated read" on page_views
  for select using (auth.role() = 'authenticated');
