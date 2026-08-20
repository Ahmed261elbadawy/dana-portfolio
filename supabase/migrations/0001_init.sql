-- Dana Badawy portfolio — initial schema
-- Public tables are readable by anyone when published = true.
-- All writes require an authenticated user (she is the only account created).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- site_settings: single-row table for global content (bio, contact, etc.)
-- ---------------------------------------------------------------------------
create table site_settings (
  id boolean primary key default true constraint single_row check (id),
  intro_paragraph text not null default '',
  bio text not null default '',
  services text[] not null default '{}',
  email text not null default '',
  whatsapp text not null default '',
  cv_url text,
  updated_at timestamptz not null default now()
);

insert into site_settings (id) values (true);

-- ---------------------------------------------------------------------------
-- brands: one card per brand on the work grid
-- ---------------------------------------------------------------------------
create table brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  industry text not null default '',
  logo_url text,
  services text[] not null default '{}', -- e.g. {campaign,strategy,content_creation,art_direction,social_media_management}
  accent_color text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index brands_sort_order_idx on brands (sort_order);
create index brands_published_idx on brands (published);

-- ---------------------------------------------------------------------------
-- case_studies: one per brand (1:1 for now, brand_id unique)
-- ---------------------------------------------------------------------------
create table case_studies (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references brands (id) on delete cascade unique,
  one_line_brief text not null default '',
  challenge text not null default '',
  approach text not null default '',
  art_direction text not null default '',
  deliverables text[] not null default '{}',
  hero_media_url text,
  hero_media_kind text check (hero_media_kind in ('image', 'upload_video', 'embed')),
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index case_studies_brand_id_idx on case_studies (brand_id);
create index case_studies_published_idx on case_studies (published);

-- ---------------------------------------------------------------------------
-- media: gallery items attached to a case study
-- ---------------------------------------------------------------------------
create table media (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references case_studies (id) on delete cascade,
  kind text not null check (kind in ('image', 'upload_video', 'embed')),
  url text not null,
  provider text check (provider in ('instagram', 'youtube', 'vimeo', null)),
  poster_url text,
  alt_text text not null default '',
  aspect_ratio text not null default '9/16', -- e.g. '9/16', '1/1', '16/9'
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index media_case_study_id_idx on media (case_study_id);

-- ---------------------------------------------------------------------------
-- metrics: the structured "outcome/impact" tiles for a case study
-- ---------------------------------------------------------------------------
create table metrics (
  id uuid primary key default gen_random_uuid(),
  case_study_id uuid not null references case_studies (id) on delete cascade,
  label text not null,       -- e.g. "Reach"
  value text not null,       -- e.g. "1.2M" or "+38%"
  note text,                 -- optional context, e.g. "in 30 days"
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index metrics_case_study_id_idx on metrics (case_study_id);

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  role text,
  brand text,
  avatar_url text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create index testimonials_published_idx on testimonials (published);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger site_settings_set_updated_at
  before update on site_settings
  for each row execute function set_updated_at();

create trigger brands_set_updated_at
  before update on brands
  for each row execute function set_updated_at();

create trigger case_studies_set_updated_at
  before update on case_studies
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) role: read-only, published rows only.
-- Authenticated role: full read/write (only Dana's account will exist).
-- ---------------------------------------------------------------------------
alter table site_settings enable row level security;
alter table brands enable row level security;
alter table case_studies enable row level security;
alter table media enable row level security;
alter table metrics enable row level security;
alter table testimonials enable row level security;

-- site_settings: publicly readable, only authenticated can update
create policy "site_settings public read" on site_settings
  for select using (true);
create policy "site_settings authenticated write" on site_settings
  for update using (auth.role() = 'authenticated');

-- brands
create policy "brands public read published" on brands
  for select using (published = true or auth.role() = 'authenticated');
create policy "brands authenticated write" on brands
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- case_studies
create policy "case_studies public read published" on case_studies
  for select using (published = true or auth.role() = 'authenticated');
create policy "case_studies authenticated write" on case_studies
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- media: readable if parent case study is published
create policy "media public read via published case study" on media
  for select using (
    auth.role() = 'authenticated'
    or exists (
      select 1 from case_studies cs
      where cs.id = media.case_study_id and cs.published = true
    )
  );
create policy "media authenticated write" on media
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- metrics: same pattern as media
create policy "metrics public read via published case study" on metrics
  for select using (
    auth.role() = 'authenticated'
    or exists (
      select 1 from case_studies cs
      where cs.id = metrics.case_study_id and cs.published = true
    )
  );
create policy "metrics authenticated write" on metrics
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- testimonials
create policy "testimonials public read published" on testimonials
  for select using (published = true or auth.role() = 'authenticated');
create policy "testimonials authenticated write" on testimonials
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('logos', 'logos', true, 5242880, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('images', 'images', true, 10485760, array['image/png','image/jpeg','image/webp','image/avif']),
  ('videos', 'videos', true, 104857600, array['video/mp4','video/quicktime']),
  ('avatars', 'avatars', true, 3145728, array['image/png','image/jpeg','image/webp']),
  ('documents', 'documents', true, 10485760, array['application/pdf'])
on conflict (id) do nothing;

create policy "public read logos" on storage.objects
  for select using (bucket_id = 'logos');
create policy "public read images" on storage.objects
  for select using (bucket_id = 'images');
create policy "public read videos" on storage.objects
  for select using (bucket_id = 'videos');
create policy "public read avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "public read documents" on storage.objects
  for select using (bucket_id = 'documents');

create policy "authenticated write logos" on storage.objects
  for all using (bucket_id = 'logos' and auth.role() = 'authenticated')
  with check (bucket_id = 'logos' and auth.role() = 'authenticated');
create policy "authenticated write images" on storage.objects
  for all using (bucket_id = 'images' and auth.role() = 'authenticated')
  with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "authenticated write videos" on storage.objects
  for all using (bucket_id = 'videos' and auth.role() = 'authenticated')
  with check (bucket_id = 'videos' and auth.role() = 'authenticated');
create policy "authenticated write avatars" on storage.objects
  for all using (bucket_id = 'avatars' and auth.role() = 'authenticated')
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
create policy "authenticated write documents" on storage.objects
  for all using (bucket_id = 'documents' and auth.role() = 'authenticated')
  with check (bucket_id = 'documents' and auth.role() = 'authenticated');
