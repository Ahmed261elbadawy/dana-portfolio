create table skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_url text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  image_url text not null,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index skills_sort_order_idx on skills (sort_order);
create index certificates_sort_order_idx on certificates (sort_order);

alter table skills enable row level security;
alter table certificates enable row level security;

create policy "skills public read" on skills
  for select using (published = true);
create policy "skills authenticated read" on skills
  for select using (auth.role() = 'authenticated');
create policy "skills authenticated insert" on skills
  for insert with check (auth.role() = 'authenticated');
create policy "skills authenticated update" on skills
  for update using (auth.role() = 'authenticated');
create policy "skills authenticated delete" on skills
  for delete using (auth.role() = 'authenticated');

create policy "certificates public read" on certificates
  for select using (published = true);
create policy "certificates authenticated read" on certificates
  for select using (auth.role() = 'authenticated');
create policy "certificates authenticated insert" on certificates
  for insert with check (auth.role() = 'authenticated');
create policy "certificates authenticated update" on certificates
  for update using (auth.role() = 'authenticated');
create policy "certificates authenticated delete" on certificates
  for delete using (auth.role() = 'authenticated');
