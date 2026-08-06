# Civic Complaint Platform — MVP (6hr build)

## Setup (do this together, ~15 min, before splitting up)

1. `npx create-next-app@14 civic-mvp --typescript --tailwind --app` then drop these files in (or just use this folder directly).
2. Create a Supabase project at supabase.com → free tier.
3. In Supabase SQL Editor: run `sql/schema.sql`, then `sql/seed.sql`.
4. In Supabase Storage: create a bucket called `complaint-images`, set it to **public**.
5. Copy `.env.local.example` → `.env.local`, fill in your Supabase URL + anon key (Settings → API).
6. `npm install && npm run dev`
7. Push to GitHub, import into Vercel, add the same two env vars in Vercel project settings, deploy.

## Split from here

- **Person A** → `app/page.tsx` (complaint form) — already functional, tweak categories/copy/validation.
- **Person B** → `app/dashboard/page.tsx` + `app/dashboard/Map.tsx` — already functional, tweak stats/filters/styling.
- **Whoever's faster** → `app/admin/page.tsx` — change the passcode in the file before the demo.

## What's deliberately cut for time

- No real auth (passcode gate for admin only)
- No ML/Roboflow — duplicate detection is a SQL function (`find_duplicates` in schema.sql), called from the form on submit
- No IoT — not simulated at all; if a judge asks, say it's the next milestone post-hackathon and point to the schema's extensibility (image_url + category fields already support sensor-triggered auto-complaints)

## Demo flow (~90 seconds)

1. Open dashboard → show live map + stats with seed data already populated
2. Submit a new complaint from the form → switch to dashboard, watch it appear live (Supabase realtime)
3. Show the duplicate flag on a complaint near an existing one
4. Open admin → change a status → show it reflect on the dashboard instantly
