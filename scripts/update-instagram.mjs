/**
 * Best-effort Instagram stats updater for @dr.ibrahem_musadaq.
 * Tries public sources in order; if any returns follower counts it
 * rewrites `instagramProfile` in src/data/reels.ts. Always exits 0 —
 * a failed fetch just keeps the last known numbers.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const USER = 'dr.ibrahem_musadaq';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

const parseCount = (s) => {
  if (!s) return null;
  const clean = s.replace(/,/g, '').trim();
  const m = clean.match(/^([\d.]+)([KMkm])?$/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (m[2]) n *= m[2].toUpperCase() === 'K' ? 1e3 : 1e6;
  return Math.round(n);
};

const fmt = (n) => n.toLocaleString('en-US');

async function fromProfileHtml() {
  for (const url of [
    `https://www.instagram.com/${USER}/?hl=en`,
    `https://www.instagram.com/${USER}/`,
  ]) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
      });
      const html = await res.text();
      const desc = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i)?.[1]
        ?? html.match(/content="([^"]*Followers[^"]*)"/i)?.[1];
      const m = desc?.match(/([\d,.]+[KM]?)\s*Followers?,\s*([\d,.]+[KM]?)\s*Following,\s*([\d,.]+[KM]?)\s*Posts/i);
      if (m) {
        return { followers: parseCount(m[1]), following: parseCount(m[2]), posts: parseCount(m[3]) };
      }
    } catch {}
  }
  return null;
}

async function fromWebProfileInfo() {
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USER}`,
      { headers: { 'User-Agent': UA, 'X-IG-App-ID': '936619743392459' } }
    );
    if (!res.ok) return null;
    const j = await res.json();
    const u = j?.data?.user;
    if (!u?.edge_followed_by) return null;
    return {
      followers: u.edge_followed_by.count,
      following: u.edge_follow.count,
      posts: u.edge_owner_to_timeline_media?.count,
    };
  } catch {
    return null;
  }
}

const stats = (await fromProfileHtml()) ?? (await fromWebProfileInfo());

if (!stats?.followers) {
  console.log('instagram: all sources blocked — keeping last known values');
  process.exit(0);
}

const path = 'src/data/reels.ts';
let src = readFileSync(path, 'utf8');
const next = `followers: '${fmt(stats.followers)}',
  following: '${fmt(stats.following)}',`;
const updated = src.replace(
  /followers: '[^']*',\s*\n\s*following: '[^']*',/,
  next
);
if (updated !== src) {
  writeFileSync(path, updated);
  console.log(`instagram: updated → ${fmt(stats.followers)} followers / ${fmt(stats.following)} following`);
} else {
  console.log('instagram: values already current');
}
