# 🐶 Puppy Tracker

A household-shared puppy care tracker you self-host on your Raspberry Pi (or any
machine) and install on your phones as a PWA. One tap to log feeding, potty,
walks and notes; a live "last X ago" dashboard so you and your partner never
double-feed or wonder "did anyone take him out?"; and an auto-generated
vaccination / deworming schedule.

Built with **SvelteKit + TypeScript**, **SQLite** (via Drizzle ORM), and
**Tailwind CSS**. No cloud, no accounts — your data lives in a single SQLite
file on your own hardware.

## Features (MVP)

- **One-tap quick-logging** — 🍚 Fed · 💧 Pee · 💩 Poo · 🐾 Walk · 📝 Note
- **"Now" dashboard** — last occurrence per activity, colour-coded by staleness
  (green → amber → red), live-updating without a refresh
- **Timeline** — full history grouped by day, with who-logged-what, edit & delete
- **Health checklist** — seeded EU puppy vaccination/deworming schedule computed
  from the birth date, plus your own vet appointments
- **Household auth** — pick your name + PIN, 30-day session (designed for LAN use)
- **Installable PWA** — add to home screen on iOS/Android; caches the app shell
  so it opens instantly (API responses are never cached)

## Local development

```bash
cp .env.example .env          # then edit SESSION_SECRET
npm install
npm run dev                   # http://localhost:5173
```

On first run the app seeds two users (**Me**, **Partner**) sharing the
`SEED_PIN` (default `1234`), a placeholder dog, and a vaccination schedule.
Set the real birth date under **Settings → Edit dog profile** and tick
"Regenerate schedule".

## Deploy on the Pi (Docker)

```bash
# In the project dir on the Pi:
echo "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" > .env
echo "SEED_PIN=1234" >> .env
docker compose up -d --build
```

Then browse to `http://puppy.local:3000` (match the `ORIGIN` in
`docker-compose.yml` to whatever hostname/IP you actually use), and **Add to
Home Screen** on both phones.

- The SQLite database is persisted at `./data/puppy.db` on the host via a
  bind-mounted volume, so it survives container rebuilds.
- Build **natively on the Pi** (`--build`) to avoid ARM cross-compilation
  issues with the `better-sqlite3` native module. The image is Debian-based
  (not Alpine) for the same reason.

### Backups

Because it's plain SQLite with WAL enabled, take a consistent snapshot with:

```bash
docker exec puppy-tracker node -e "require('better-sqlite3')('/data/puppy.db').backup('/data/backups/puppy-'+Date.now()+'.db')"
```

(or run `sqlite3 /data/puppy.db ".backup ..."` on the host). A scheduled nightly
backup + retention is on the roadmap below.

## Architecture

| Area | Choice |
| --- | --- |
| Framework | SvelteKit 2 + Svelte 5 (runes), `adapter-node` |
| DB | SQLite via `better-sqlite3` + Drizzle ORM, WAL mode |
| Schema | One polymorphic `care_log` table for events; `health_events` for the vet schedule |
| Time | All timestamps are UTC epoch seconds; "local day" uses the `TZ` env var |
| Auth | Hand-rolled PIN (scrypt) + HMAC-signed session cookie |
| Styling | Tailwind CSS v4 |

Key files: `src/lib/server/db/schema.ts` (data model),
`src/hooks.server.ts` (auth guard + startup seed),
`src/routes/api/log/` (quick-log endpoint),
`src/routes/(app)/+page.svelte` (dashboard).

## Roadmap (post-MVP)

- **Reminders + Web Push** (feeding/potty nudges) — a 60s in-process scheduler
- **Weight chart**, sleep/play/training logging, meds
- **Offline write queue** (IndexedDB) with idempotent sync
- **Home Assistant integration** — HA notify for phone push + a `sensor.puppy_last_fed`
- Photo journal, growth milestones, nightly backup job, CSV export

See `../.claude/plans/` for the full plan this was built from.
