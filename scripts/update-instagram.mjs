/**
 * Live Instagram follower/following updater for @dr.ibrahem_musadaq.
 *
 * Instagram blocks datacenter IPs (e.g. GitHub Actions runners) with a login
 * wall. To cope we:
 *   1. Strip the `navigator.webdriver` automation flag and other tells.
 *   2. Listen for Instagram's own XHRs (web_profile_info / graphql).
 *   3. Call Instagram's web_profile_info API from inside the page context.
 *   4. Fall back to scraping rendered text / meta tags.
 *   5. Log diagnostics (title + URL) when everything fails so CI logs are
 *      debuggable instead of silently keeping the old value.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const USER = 'dr.ibrahem_musadaq';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const IG_APP_ID = '936619743392459';

const parseCount = (s) => {
  if (!s) return null;
  const clean = String(s).replace(/,/g, '').trim();
  const m = clean.match(/^([\d.]+)\s*([KMkm])?$/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (m[2]) n *= m[2].toUpperCase() === 'K' ? 1e3 : 1e6;
  return Math.round(n);
};

const fmt = (n) => n.toLocaleString('en-US');

function pickCounts(text) {
  if (!text) return {};
  const out = {};
  const mf =
    text.match(/"edge_followed_by"\s*:\s*\{"count"\s*:\s*(\d+)/) ||
    text.match(/"follower_count"\s*:\s*(\d+)/) ||
    text.match(/"followers"\s*:\s*\{"count"\s*:\s*(\d+)/);
  const mg =
    text.match(/"edge_follow"\s*:\s*\{"count"\s*:\s*(\d+)/) ||
    text.match(/"following_count"\s*:\s*(\d+)/);
  if (mf) out.followers = Number(mf[1]);
  if (mg) out.following = Number(mg[1]);
  return out;
}

async function tryApiInPage(page) {
  try {
    const res = await page.evaluate(
      async ({ user, appId }) => {
        const urls = [
          `/api/v1/users/web_profile_info/?username=${user}`,
          `https://www.instagram.com/api/v1/users/web_profile_info/?username=${user}`,
          `https://i.instagram.com/api/v1/users/web_profile_info/?username=${user}`,
        ];
        for (const u of urls) {
          try {
            const r = await fetch(u, {
              headers: { 'X-IG-App-ID': appId, 'X-Requested-With': 'XMLHttpRequest' },
              credentials: 'include',
            });
            if (!r.ok) continue;
            const j = await r.json();
            const d = j?.data?.user || j?.graphql?.user || j?.user;
            const f = d?.edge_followed_by?.count ?? d?.follower_count;
            const g = d?.edge_follow?.count ?? d?.following_count;
            if (f) return { followers: f, following: g ?? null };
          } catch {}
        }
        return null;
      },
      { user: USER, appId: IG_APP_ID }
    );
    return res?.followers ? res : null;
  } catch {
    return null;
  }
}

async function fromPlaywright() {
  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });
    const ctx = await browser.newContext({
      userAgent: UA,
      locale: 'en-US',
      viewport: { width: 1366, height: 900 },
      timezoneId: 'America/New_York',
    });
    // strip automation tells before any page script runs
    await ctx.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });
    const page = await ctx.newPage();

    let apiFollowers = null;
    let apiFollowing = null;
    page.on('response', async (r) => {
      try {
        const u = r.url();
        if (
          u.includes('web_profile_info') ||
          u.includes('graphql') ||
          u.includes('/api/v1/users/')
        ) {
          const counts = pickCounts(await r.text());
          if (counts.followers) apiFollowers = counts.followers;
          if (counts.following) apiFollowing = counts.following;
        }
      } catch {}
    });

    await page.goto(`https://www.instagram.com/${USER}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 40000,
    });
    // let XHRs + hydration settle; scroll once to trigger lazy content
    await page.waitForTimeout(3000);
    await page.mouse.wheel(0, 600).catch(() => {});
    await page.waitForTimeout(3000);

    // 1) Instagram's own API from inside the page (uses page cookies/context)
    const api = await tryApiInPage(page);
    if (api?.followers) {
      return { followers: api.followers, following: api.following ?? 1 };
    }

    // 2) rendered text / meta tags
    const extracted = await page.evaluate(() => {
      const bodyText = document.body?.innerText || '';
      const meta =
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        '';
      return {
        bodyText,
        meta,
        title: document.title,
        url: location.href,
      };
    });

    const textFollowers = extracted.bodyText.match(/([\d,.]+\s*[KMkm]?)\s*followers/i)?.[1];
    const textFollowing = extracted.bodyText.match(/([\d,.]+\s*[KMkm]?)\s*following/i)?.[1];
    const metaMatch = extracted.meta.match(
      /([\d,.]+[KMkm]?)\s*Followers?,\s*([\d,.]+[KMkm]?)\s*Following/i
    );

    const followers =
      apiFollowers ??
      parseCount(textFollowers) ??
      (metaMatch ? parseCount(metaMatch[1]) : null);
    const following =
      apiFollowing ??
      parseCount(textFollowing) ??
      (metaMatch ? parseCount(metaMatch[2]) : null);

    if (followers) {
      return { followers, following: following ?? 1 };
    }

    // diagnostics — tells us in CI logs WHY it failed (login wall? checkpoint?)
    console.warn(
      `instagram: no count extracted — title="${extracted.title}" url="${extracted.url}" body="${extracted.bodyText
        .slice(0, 160)
        .replace(/\s+/g, ' ')}"`
    );
  } catch (err) {
    console.warn('playwright fetch warning:', err?.message || err);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
  return null;
}

const stats = await fromPlaywright();

if (!stats?.followers) {
  console.log('instagram: could not fetch new count — keeping existing value');
  process.exit(0);
}

const path = 'src/data/reels.ts';
const src = readFileSync(path, 'utf8');

// Skip all writes when the count is unchanged — ig-stats.json carries a
// timestamp, so writing it unconditionally would dirty the repo (and trigger
// a full redeploy) on every scheduled run even when nothing changed.
const cur = src.match(/followers:\s*'([\d,]+)'/);
const curFollowing = src.match(/following:\s*'([\d,]+)'/);
const same =
  cur &&
  parseCount(cur[1]) === stats.followers &&
  (!curFollowing || parseCount(curFollowing[1]) === stats.following);
if (same) {
  console.log(`instagram: confirmed ${fmt(stats.followers)} followers (unchanged)`);
  process.exit(0);
}

const next = `followers: '${fmt(stats.followers)}',
  following: '${fmt(stats.following)}',`;
const updated = src.replace(
  /followers: '[^']*',\s*\n\s*following: '[^']*',/,
  next
);

// Also write public/ig-stats.json so the browser can fetch the latest count at runtime without waiting for a full bundle cache refresh
writeFileSync(
  'public/ig-stats.json',
  JSON.stringify(
    {
      handle: USER,
      followers: fmt(stats.followers),
      followersRaw: stats.followers,
      following: fmt(stats.following),
      updatedAt: new Date().toISOString(),
    },
    null,
    2
  ) + '\n'
);

if (updated !== src) {
  writeFileSync(path, updated);
  console.log(`instagram: updated → ${fmt(stats.followers)} followers / ${fmt(stats.following)} following`);
} else {
  console.log(`instagram: confirmed ${fmt(stats.followers)} followers (unchanged)`);
}
