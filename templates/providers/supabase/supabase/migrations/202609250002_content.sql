-- Optional public editorial content. No product-specific tables or seed data.
create table public.content_entries (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=100),
  title text not null check(length(title) between 1 and 160),
  summary text not null default '' check(length(summary)<=300),
  body text not null default '' check(length(body)<=20000),
  published boolean not null default false
);
alter table public.content_entries enable row level security;
revoke all on public.content_entries from anon, authenticated;
grant select on public.content_entries to anon, authenticated;
grant all on public.content_entries to service_role;
create policy content_published_read on public.content_entries for select to anon,authenticated using(published);
-- Publishing initially happens via a deliberate DB operation. Add scoped admin API/policies when the product needs an editor.
