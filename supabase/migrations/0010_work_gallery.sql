create table work_gallery_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('grids', 'production', 'direction')),
  media_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index work_gallery_items_category_sort_idx
  on work_gallery_items (category, sort_order);

alter table work_gallery_items enable row level security;

create policy "work_gallery_items public read" on work_gallery_items
  for select using (published = true);

create policy "work_gallery_items authenticated read" on work_gallery_items
  for select using (auth.role() = 'authenticated');
create policy "work_gallery_items authenticated insert" on work_gallery_items
  for insert with check (auth.role() = 'authenticated');
create policy "work_gallery_items authenticated update" on work_gallery_items
  for update using (auth.role() = 'authenticated');
create policy "work_gallery_items authenticated delete" on work_gallery_items
  for delete using (auth.role() = 'authenticated');
