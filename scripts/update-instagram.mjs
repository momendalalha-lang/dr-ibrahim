/**
 * Live Instagram follower/following updater for @dr.ibrahem_musadaq.
 * Uses headless Chromium via Playwright to render the profile page and extract
 * the live rendered follower count, with HTTP fallbacks.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const USER = 'dr.ibrahem_musadaq';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

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

async function fromPlaywright() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ userAgent: UA, locale: 'en-US' });
    const page = await ctx.newPage();

    let apiFollowers = null;
    let apiFollowing = null;
    page.on('response', async (r) => {
      try {
        const u = r.url();
        if (u.includes('web_profile_info') || u.includes('graphql') || u.includes('/api/v1/users/')) {
          const t = await r.text();
          const mf = t.match(/"edge_followed_by":\{"count":(\d+)/) || t.match(/"follower_count":(\d+)/);
          const mg = t.match(/"edge_follow":\{"count":(\d+)/) || t.match(/"following_count":(\d+)/);
          if (mf) apiFollowers = Number(mf[1]);
          if (mg) apiFollowing = Number(mg[1]);
        }
      } catch {}
    });

    await page.goto(`https://www.instagram.com/${USER}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 35000,
    });
    await page.waitForTimeout(4500);

    const extracted = await page.evaluate(() => {
      const bodyText = document.body?.innerText || '';
      const meta =
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        '';
      return { bodyText, meta };
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
