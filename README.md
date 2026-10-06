# Nishan Bharati: Portfolio & Blog

Personal portfolio with a Supabase-powered blog and an AdminLTE admin panel.

- **Site:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Blog backend:** Supabase (Postgres + Auth + Storage), protected with Row Level Security
- **Admin panel:** AdminLTE 4 (Bootstrap 5) at `/admin`, themed to match the site

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase values
npm run dev            # http://localhost:5173  ·  admin: http://localhost:5173/admin/
```

The site works without Supabase; the blog simply shows an "Articles are on the way" message.

## Setting up Supabase

1. **Create a project** at [supabase.com](https://supabase.com).
2. **Create the database:** open *SQL Editor → New query*, paste all of [`supabase/schema.sql`](supabase/schema.sql) and click *Run*.
   This creates the `posts` table, the `admin_users` table, security policies and the `blog-images` storage bucket.
3. **Connect the app:** in *Project Settings → API*, copy the **Project URL** and the **anon / publishable key** into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
   Never use the `service_role` / secret key in this file.
4. **Create your admin login:** *Authentication → Users → Add user → Create new user* (tick *Auto Confirm User*).
5. **Grant admin rights** by running in the SQL Editor:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'nishanbharati12345@gmail.com'
   on conflict do nothing;
   ```
6. **Lock down sign-ups:** *Authentication → Sign In / Providers → Email*, turn **off** "Allow new users to sign up".
7. Restart `npm run dev` and sign in at `/admin/login`.

## How the blog works

| Area | Route | Notes |
| --- | --- | --- |
| Home page | `/#blog` | Latest 3 published posts |
| Blog index | `/blog` | All published posts, filterable by tag |
| Article | `/blog/:slug` | Markdown content, cover image, related posts |
| Admin | `/admin/` | Dashboard, post list, editor (login required) |

- Posts are written in **Markdown** (GitHub-flavoured: tables, code blocks, links, images). Raw HTML is ignored for safety.
- A post is visible publicly only when `status = 'published'` **and** its publish date has passed, so a future date schedules it.
- Cover images upload to the public `blog-images` bucket (JPG/PNG/WebP/GIF/AVIF, max 5 MB).
- Security is enforced in the database: visitors can only read published posts; only users in `admin_users` can write.

## Projects

The stacked project cards on the home page come from the `projects` table, managed in **Admin → Projects**
(add, edit, reorder with the arrows, show/hide, delete). Each card has three images: a large one on the right and two
on the left, each with alt text and a "focus area" that controls how it's cropped. Uploads go to the public
`project-images` bucket. `schema.sql` seeds the three original projects, whose images live in `public/projects/`.
If Supabase isn't configured or can't be reached, the site shows those built-in projects instead.

## Contact form

The home page contact section (`/#contact`) saves inquiries to the `inquiries` table. Visitors can submit but never read
them; you read, archive and reply to them in **Admin → Inquiries** (the sidebar shows a badge with the unread count).
The form has a hidden honeypot field and a minimum fill time to filter out simple spam bots.
If Supabase isn't configured, the form falls back to opening the visitor's email app.

## Project structure

```
admin/index.html          Admin entry (separate page so Bootstrap and Tailwind never clash)
src/
  admin/                  AdminLTE app: auth, layout, dashboard, posts, editor
  components/             Shared site components (FadeIn, Magnet, BlogCard, …)
  data/content.ts         All portfolio copy, skills, services and projects
  lib/                    Supabase client and blog queries
  pages/                  Home, blog index, article, 404
  sections/               Home page sections
supabase/schema.sql       Database, policies and storage setup
```

## Deployment

`npm run build` outputs static files to `dist/` (site at `/`, admin at `/admin/`).
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on your host.
Routing rewrites are included for **Vercel** (`vercel.json`) and **Netlify** (`public/_redirects`).
