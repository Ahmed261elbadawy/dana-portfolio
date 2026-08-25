create table brand_logos (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text not null,
  category text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index brand_logos_sort_order_idx on brand_logos (sort_order);

alter table brand_logos enable row level security;

create policy "brand_logos public read" on brand_logos
  for select using (published = true);

create policy "brand_logos authenticated read" on brand_logos
  for select using (auth.role() = 'authenticated');
create policy "brand_logos authenticated insert" on brand_logos
  for insert with check (auth.role() = 'authenticated');
create policy "brand_logos authenticated update" on brand_logos
  for update using (auth.role() = 'authenticated');
create policy "brand_logos authenticated delete" on brand_logos
  for delete using (auth.role() = 'authenticated');
