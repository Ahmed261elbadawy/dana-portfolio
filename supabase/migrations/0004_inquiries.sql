create table inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  services text[] not null default '{}',
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index inquiries_created_at_idx on inquiries (created_at desc);

alter table inquiries enable row level security;

-- Anyone can submit an inquiry (the public contact form).
create policy "inquiries public insert" on inquiries
  for insert with check (true);

-- Only Dana can read or manage submissions.
create policy "inquiries authenticated read" on inquiries
  for select using (auth.role() = 'authenticated');
create policy "inquiries authenticated update" on inquiries
  for update using (auth.role() = 'authenticated');
create policy "inquiries authenticated delete" on inquiries
  for delete using (auth.role() = 'authenticated');
