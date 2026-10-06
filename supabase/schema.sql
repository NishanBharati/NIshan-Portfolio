-- =====================================================================
-- Blog backend for the Nishan Bharati portfolio
-- Run this whole file once in Supabase Dashboard -> SQL Editor -> New query.
-- It is idempotent: running it again is safe.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Admins
--    Only users listed here can write posts or upload images.
--    The table has RLS enabled and NO policies, so it can only be managed
--    from the SQL editor / service role, never from the browser.
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Posts
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 1 and 200),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt         text not null default '' check (char_length(excerpt) <= 300),
  content         text not null default '',
  cover_image_url text,
  tags            text[] not null default '{}',
  status          text not null default 'draft' check (status in ('draft', 'published')),
  published_at    timestamptz,
  reading_minutes integer not null default 1 check (reading_minutes > 0),
  author_id       uuid default auth.uid() references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint published_posts_have_date check (status = 'draft' or published_at is not null)
);

create index if not exists posts_published_idx
  on public.posts (published_at desc)
  where status = 'published';

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;

alter table public.posts enable row level security;

drop policy if exists "Published posts are public" on public.posts;
create policy "Published posts are public"
  on public.posts for select
  to anon, authenticated
  using (status = 'published' and published_at <= now());

drop policy if exists "Admins can read all posts" on public.posts;
create policy "Admins can read all posts"
  on public.posts for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can create posts" on public.posts;
create policy "Admins can create posts"
  on public.posts for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update posts" on public.posts;
create policy "Admins can update posts"
  on public.posts for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete posts" on public.posts;
create policy "Admins can delete posts"
  on public.posts for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- 2b. Portfolio projects (the stacked cards in the "Project" section)
--     images = { "tall": {src, alt, position}, "colTop": {...}, "colBottom": {...} }
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(name) between 1 and 120),
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category     text not null default '' check (char_length(category) <= 80),
  description  text not null default '' check (char_length(description) <= 400),
  live_url     text check (live_url is null or live_url ~* '^https?://'),
  images       jsonb not null default '{}'::jsonb check (jsonb_typeof(images) = 'object'),
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists projects_order_idx on public.projects (sort_order, created_at);

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;

alter table public.projects enable row level security;

drop policy if exists "Published projects are public" on public.projects;
create policy "Published projects are public"
  on public.projects for select
  to anon, authenticated
  using (is_published);

drop policy if exists "Admins can read all projects" on public.projects;
create policy "Admins can read all projects"
  on public.projects for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can create projects" on public.projects;
create policy "Admins can create projects"
  on public.projects for insert
  to authenticated
  with check ((select public.is_admin()));

drop policy if exists "Admins can update projects" on public.projects;
create policy "Admins can update projects"
  on public.projects for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete projects" on public.projects;
create policy "Admins can delete projects"
  on public.projects for delete
  to authenticated
  using ((select public.is_admin()));

-- Starter content: the three projects that were previously hard-coded.
-- Images point at files shipped in public/projects/. Existing rows are never overwritten.
insert into public.projects (name, slug, category, description, live_url, images, sort_order)
values
  (
    'Kabita Studio & Store',
    'kabita-studio-and-store',
    'Photography & E-Commerce',
    'A booking-first website and online catalogue for a Bhaktapur photography studio and cultural retail store, with WhatsApp inquiries built in.',
    'https://kabitastudioandstore.com.np/',
    '{"tall": {"src": "/projects/kabita/k1.webp", "alt": "Kabita Studio homepage hero", "position": "left center"},
      "colTop": {"src": "/projects/kabita/k3.webp", "alt": "Kabita Studio product catalogue section", "position": "left center"},
      "colBottom": {"src": "/projects/kabita/k2.webp", "alt": "Kabita Studio blogs and stories section", "position": "center top"}}',
    10
  ),
  (
    'Navya EdTech',
    'navya-edtech',
    'Co-Founded · IT & Software Company',
    'The website of the IT and software development company i co-founded, presenting its services, featured case studies and technology stack.',
    'https://navyaedtech.com/',
    '{"tall": {"src": "/projects/navya/n1.webp", "alt": "Navya homepage hero", "position": "left center"},
      "colTop": {"src": "/projects/navya/n3.webp", "alt": "Navya technology stack section", "position": "center top"},
      "colBottom": {"src": "/projects/navya/n2.webp", "alt": "Navya featured case studies section", "position": "center top"}}',
    20
  ),
  (
    'Suravi Sanitary Suppliers',
    'suravi-sanitary-suppliers',
    'Retail & Home Services',
    'A full-stack storefront and self-serve CMS for a Lalitpur sanitary, solar and water-purification retailer.',
    'https://suravisanitary.com.np/',
    '{"tall": {"src": "/projects/suravi/s1.webp", "alt": "Suravi Sanitary homepage hero", "position": "center top"},
      "colTop": {"src": "/projects/suravi/s2.webp", "alt": "Suravi featured KENT water purifier section", "position": "left center"},
      "colBottom": {"src": "/projects/suravi/s3.webp", "alt": "Suravi renovation projects section", "position": "center center"}}',
    30
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- 3. Image storage (blog covers + project screenshots)
--    Public buckets: anyone can view images by URL; only admins can manage them.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('blog-images', 'blog-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),
  ('project-images', 'project-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Older versions of this file created blog-only policies; replace them with ones covering both buckets.
drop policy if exists "Admins can list blog images" on storage.objects;
drop policy if exists "Admins can upload blog images" on storage.objects;
drop policy if exists "Admins can update blog images" on storage.objects;
drop policy if exists "Admins can delete blog images" on storage.objects;

drop policy if exists "Admins can list site images" on storage.objects;
create policy "Admins can list site images"
  on storage.objects for select
  to authenticated
  using (bucket_id in ('blog-images', 'project-images') and (select public.is_admin()));

drop policy if exists "Admins can upload site images" on storage.objects;
create policy "Admins can upload site images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in ('blog-images', 'project-images') and (select public.is_admin()));

drop policy if exists "Admins can update site images" on storage.objects;
create policy "Admins can update site images"
  on storage.objects for update
  to authenticated
  using (bucket_id in ('blog-images', 'project-images') and (select public.is_admin()));

drop policy if exists "Admins can delete site images" on storage.objects;
create policy "Admins can delete site images"
  on storage.objects for delete
  to authenticated
  using (bucket_id in ('blog-images', 'project-images') and (select public.is_admin()));

-- ---------------------------------------------------------------------
-- 4. Contact form inquiries
--    Visitors can submit (insert) but never read them back.
--    Only admins can read, update the status of, or delete inquiries.
-- ---------------------------------------------------------------------
create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 100),
  email      text not null check (char_length(email) <= 200 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone      text check (phone is null or char_length(phone) <= 30),
  service    text check (service is null or char_length(service) <= 100),
  message    text not null check (char_length(message) between 10 and 5000),
  status     text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists inquiries_status_created_idx on public.inquiries (status, created_at desc);

grant insert on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;

alter table public.inquiries enable row level security;

drop policy if exists "Anyone can send an inquiry" on public.inquiries;
create policy "Anyone can send an inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (status = 'new');

drop policy if exists "Admins can read inquiries" on public.inquiries;
create policy "Admins can read inquiries"
  on public.inquiries for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can update inquiries" on public.inquiries;
create policy "Admins can update inquiries"
  on public.inquiries for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins can delete inquiries" on public.inquiries;
create policy "Admins can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using ((select public.is_admin()));

-- ---------------------------------------------------------------------
-- 5. Make yourself an admin (run AFTER creating your user in
--    Authentication -> Users -> "Add user"):
--
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'nishanbharati12345@gmail.com'
-- on conflict do nothing;
-- ---------------------------------------------------------------------
