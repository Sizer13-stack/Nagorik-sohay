# নাগরিক সহায় (demo prototype)
Next.js 14, plain CSS. Demo mode needs no keys. Data is fed in Admin (knowledge sources, budget CSV); stored in browser localStorage until Supabase is added.
## Run
    npm install
    npm run dev   # http://localhost:3000
## Deploy (Vercel)
Push to GitHub, then Import Project on Vercel and Deploy. No env vars needed for demo.
## Demo mode
Sample data in lib/data.js (is_mock). Reports live in the browser's localStorage. Admin PIN: 1234.
## Next (full mode)
Supabase tables + auth, real Claude in app/api/ask/route.js (retrieve chunks, return JSON with citations/confidence), photo upload, PostGIS map.

## Real AI (Phase 2a)
1. Copy `.env.example` to `.env.local`, set `ANTHROPIC_API_KEY`.
2. `npm run dev`. Chat answers, photo classification, voice form-fill, notice/law summaries and reply drafts now use Claude. Without a key everything falls back to the demo logic.
3. On Vercel: Project Settings > Environment Variables > add `ANTHROPIC_API_KEY`.

## Update (AI Congress build)
- **Model router** (`lib/claude.js`): `tier:'fast'` (Haiku) for photo classification and voice-form extraction, main tier (Sonnet) for grounded answers and live official-site search. Falls back to the main model if the fast one fails. Env: `ANTHROPIC_MODEL`, `ANTHROPIC_MODEL_FAST`.
- **"Why this answer?" panel** (`app/ask/page.js`): shows sources searched, route (knowledge base / live official sites / none / no-AI mode), model tier and the confidence rule. `/api/ask` now returns a `trace` object.
- **Services abroad** (`/abroad`): e-Passport from abroad, lost passport, document attestation, BMET clearance, finding your mission. Entries are in `lib/kb.js` (`abroad:true`), all marked secondary-source with a retrieval date. Fees and phone numbers are intentionally omitted until verified.
- KB storage key bumped to `cs_kb_v6` so existing browsers pick up the new entries (admin-added sources in old browsers are reset).
- **Chatbot upgrades** (`/ask`): voice question (mic), read-aloud, "Explain simply", follow-up chips (fee / time / where), follow-up-aware retrieval.
- **TrustID redesign** (`/trustid`): plain-language explainer, editable sample wallet, consent screen, provider screen with tamper test, consent log, honest limits note.
- **Global scope** (`/global`): country-pack architecture, honest status of the five tracks, responsible-AI do/don't.

## Backend (shared database), optional
Without the env vars below the app runs exactly as before (localStorage demo). With them, reports are shared across devices.
1. Create a Supabase project. In the SQL editor run `supabase/schema.sql`, then (optional, for demo data) `supabase/seed_sample.sql`.
2. In Vercel (or `.env.local`) set `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (service_role key, server-side only) and `ADMIN_PIN` (a long value).
3. Redeploy. Check `/api/reports` returns `{"configured":true,...}`.

How it works: the browser never talks to Supabase directly. `/api/reports` (public list: ward-level only, no description, no exact location), `/api/reports/[id]` (full description for whoever holds the tracking ID, never coordinates), `/api/staff` (PIN checked on the server; list and status update). Tables have no public RLS policies.

Honest limits: the staff PIN is one shared PIN, not per-officer accounts (Supabase Auth is next). The in-memory rate limiter is per serverless instance (use Upstash/Vercel KV for production). Knowledge base, budget data and admin-added sources are still browser-local. Tested with a mock database (see logic tests in the build notes), not yet against a live Supabase project.
- **Report flow**: direct camera button ("Take a photo") and gallery option at step 1 and step 2. A photo alone now fills the issue type and description (editable); the citizen only chooses the area. On phones the camera opens directly; on desktop it opens the file picker.

## Shared knowledge base + budget (backend)
`/api/shared` (new) stores the admin-edited knowledge base and budget table in the `shared_data` table, so every device sees them. Run the last block of `supabase/schema.sql` (the `shared_data` table). Reading is public; writing needs the staff PIN (checked on the server). On first use the database is empty and every browser keeps the built-in sample until staff add or change something in Admin. Not yet tested against a live Supabase project.
