# Instagram Follower Count — Meta Graph API Migration (READY TO DEPLOY)

**Status:** ⏳ Pending user-side setup (Parts 1–2 below). Code side is prepared.
**Goal:** Replace Playwright scraping (blocked on datacenter IPs) with the official
Instagram API so the GitHub Action can refresh the follower count every 30 min
from any cloud runner — no local machine dependency.

---

## Why this is needed

- `scripts/update-instagram.mjs` uses headless Chromium → works on residential IPs
  (user's PC — interim `MUS-IG-Stats` scheduled task), but **Instagram redirects
  GitHub Actions runners to `/accounts/login/`** (datacenter-IP block, verified in
  CI logs 2026-11-08).
- All anonymous fallbacks tested and dead: `web_profile_info` + `X-IG-App-ID`,
  allorigins, codetabs, corsproxy.io (401), imginn/dumpor/greatfon/picuki
  (generic pages / 403), socialcounts.org (404).
- Meta Graph API is the only reliable free path. Requires the IG account to be
  **Professional** (Business or Creator) — non-negotiable since Dec 2024.

## Current state (what's live now)

- Count source of truth: `src/data/reels.ts` → `followers:` / `following:`
- Runtime override: `public/ig-stats.json` (fetched cache-busted by
  `src/lib/useInstagramStats.ts`, renders in hero pill / reels banner / footer)
- Updaters running today:
  1. **Local**: Windows Task `MUS-IG-Stats` → `scripts/ig-task.ps1` every 30 min
     (pull → scrape → commit → push → auto-deploy). Residential IP = works.
  2. **CI backup**: GitHub cron `*/30 * * * *` → same script, usually blocked.
- Last known count: **2,351** (2026-11-08).

## Part 1 — Dr Ibrahim (phone, ~3 min)

Only the account owner can do this:

1. Instagram app → profile → ☰ → **Settings and activity**
2. **Account type and tools** → **Switch to professional account**
3. Choose **Creator** (free; Business also works). Done.

## Part 2 — Site owner (computer, ~10 min)

Needs a Facebook account for developers.facebook.com (any FB account works).

1. https://developers.facebook.com → **My Apps → Create App**
2. Use case: **"Managing messages and content on Instagram"** → create
3. Dashboard → **Application Identity** → **Add user** → **Instagram testers**
   → enter `dr.ibrahem_musadaq` (no @) → send invite
4. Dr Ibrahim accepts: IG app → Settings → **Website permissions → Apps and
   websites → Tester Invites** → accept (or instagram.com/accounts/manage_access)
5. Dashboard → **Use cases** → Instagram → **Customize** →
   **API setup with Instagram Login** → **Generate access token** →
   **Add account** → sign in AS `dr.ibrahem_musadaq` → authorize →
   **Generate token** → copy it (shown once)

Verify (optional): Graph API Explorer → host `graph.instagram.com`, GET
`me?fields=id,username,followers_count` → should return the real count.

## Part 3 — Devin deploys (once token is provided)

Paste the token in chat → I will:

1. Exchange short-lived → **long-lived token** (60 days, refreshable via
   `ig_refresh_token` grant):
   `POST https://graph.instagram.com/access_token?grant_type=th_exchange_token&client_secret=<APP_SECRET>&access_token=<TOKEN>`
   (App secret is in App Dashboard → Settings → Basic)
2. Store secrets in the repo (never committed):
   - `gh secret set IG_ACCESS_TOKEN` (long-lived token)
   - `gh secret set IG_APP_SECRET` (for refresh)
3. Update `scripts/update-instagram.mjs`:
   - If `IG_ACCESS_TOKEN` env present → call
     `GET https://graph.instagram.com/v26.0/me?fields=id,username,followers_count,follows_count`
     with `Authorization: Bearer` → write `reels.ts` + `ig-stats.json`
   - Keep Playwright path as automatic fallback when token absent/expired
   - Attempt token refresh (`ig_refresh_token`) before falling back; log clearly
4. Update `.github/workflows/deploy.yml`: pass secrets as env to the update step
5. Test: `gh workflow run` or wait for cron → verify CI log shows real count
6. Afterwards: remove/keep local `MUS-IG-Stats` task (optional — cloud becomes primary)

## Token lifecycle

- Long-lived IG token: **60 days**, refreshable indefinitely via
  `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=<TOKEN>`
- Script auto-refreshes each run; if refresh fails (revoked/expired), falls back
  to Playwright and logs a warning → site keeps last known count, nothing breaks.
- If auto-refresh can't update the GitHub secret (GITHUB_TOKEN can't write
  secrets), worst case = regenerate token via Part 2 step 5 (~2 min) and re-set
  the secret. Acceptable for a personal site.

## Security rules

- Token = GitHub Secret only. NEVER in `src/`, `public/`, commits, logs, video,
  or chat artifacts beyond the one-time paste.
- App stays in **Development mode** — fine forever: it only reads the owner's
  own professional account; no App Review needed (no third-party data).
- Token can be revoked anytime: IG → Settings → Website permissions →
  Apps and websites → remove app.

## Verification checklist (after deploy)

- [ ] `gh run list` shows scheduled run succeeding with `instagram: updated → N followers`
- [ ] `public/ig-stats.json` `updatedAt` refreshes on the 30-min cadence
- [ ] Site hero pill / reels banner / footer show the new number
- [ ] No token string appears anywhere in the repo (`git log -p | grep IG`)
