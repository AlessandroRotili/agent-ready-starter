-- Fresh project baseline. No customer data or credentials.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_members enable row level security;
revoke all on public.admin_members from anon, authenticated;
grant select on public.admin_members to authenticated;
grant all on public.admin_members to service_role;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists(select 1 from public.admin_members where user_id = auth.uid()); $$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;
create policy admin_members_read_self on public.admin_members for select to authenticated using (user_id = auth.uid());

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant all on public.profiles to service_role;
create policy profiles_read on public.profiles for select to authenticated using (id = auth.uid() or private.is_admin());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create function private.create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values (new.id);
  return new;
end;
$$;
revoke all on function private.create_profile() from public;
create trigger create_user_profile after insert on auth.users for each row execute function private.create_profile();
-- Covers existing accounts on an otherwise fresh project.
insert into public.profiles(id) select id from auth.users on conflict do nothing;

create table public.documents (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 180),
  content_type text not null check (content_type in ('application/pdf','image/jpeg','image/png','image/webp','text/plain')),
  byte_size bigint not null check (byte_size between 1 and 8388608),
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  check (storage_path = owner_id::text || '/' || id::text || case content_type
    when 'application/pdf' then '.pdf' when 'image/jpeg' then '.jpg'
    when 'image/png' then '.png' when 'image/webp' then '.webp' when 'text/plain' then '.txt' end)
);
create index documents_owner_created on public.documents(owner_id, created_at desc);
alter table public.documents enable row level security;
revoke all on public.documents from anon, authenticated;
grant select, insert, delete on public.documents to authenticated;
grant all on public.documents to service_role;
create policy documents_read_self on public.documents for select to authenticated using (owner_id = auth.uid());
create policy documents_insert_self on public.documents for insert to authenticated with check (owner_id = auth.uid());
create policy documents_delete_self on public.documents for delete to authenticated using (owner_id = auth.uid());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('private-documents', 'private-documents', false, 8388608,
  array['application/pdf','image/jpeg','image/png','image/webp','text/plain']);
create policy private_files_read on storage.objects for select to authenticated
  using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy private_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy private_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);
-- No UPDATE policy: objects are immutable; replacements need a new UUID.

create table private.user_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  hits integer not null,
  started_at timestamptz not null,
  primary key(user_id, action)
);
revoke all on private.user_limits from public, anon, authenticated;
create function public.consume_user_limit(p_action text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_limit integer;
  v_hits integer;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  v_limit := case p_action when 'document-upload' then 20 when 'document-complete' then 40
    when 'document-delete' then 40 when 'document-download' then 60 when 'profile-update' then 20 end;
  if v_limit is null then raise exception 'Unsupported action'; end if;
  insert into private.user_limits as existing values (v_user, p_action, 1, now())
  on conflict (user_id, action) do update set
    hits = case when existing.started_at < now() - interval '1 minute' then 1 else existing.hits + 1 end,
    started_at = case when existing.started_at < now() - interval '1 minute' then now() else existing.started_at end
  returning hits into v_hits;
  return v_hits <= v_limit;
end;
$$;
revoke all on function public.consume_user_limit(text) from public, anon;
grant execute on function public.consume_user_limit(text) to authenticated;
