alter table site_settings add column education_badge text;
alter table site_settings add column credential_lines text[] not null default '{}';
