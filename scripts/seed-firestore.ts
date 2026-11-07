/**
 * Seeds Firestore `branches` and `posts` collections from src/data/siteData.ts
 * using the Firestore REST API + a Google OAuth token (IAM-authenticated calls
 * bypass security rules, so no Firebase Auth user is needed for seeding).
 *
 * Usage:  npx tsx scripts/seed-firestore.ts
 * Token:  reads scripts/.gaccess.txt (minted by the OAuth refresh-token flow)
 */
import { readFileSync, existsSync } from 'node:fs';
import { siteData } from '../src/data/siteData';

const PROJECT = 'dr-ibrahim-hub';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const tokenPath = 'scripts/.gaccess.txt';
let token = existsSync(tokenPath) ? readFileSync(tokenPath, 'utf8').trim() : '';

if (!token) {
  console.error('No access token at scripts/.gaccess.txt — mint one first.');
  process.exit(1);
}

// Firestore REST value encoder
type V =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { mapValue: { fields: Record<string, V> } }
  | { arrayValue: { values: V[] } };

function enc(value: unknown): V {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number')
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(enc) } };
  if (typeof value === 'object') {
    const fields: Record<string, V> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v !== undefined) fields[k] = enc(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

async function putDoc(collection: string, id: string, data: unknown) {
  const url = `${BASE}/${collection}/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields: (enc(data) as { mapValue: { fields: Record<string, V> } }).mapValue.fields }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PUT ${collection}/${id} failed ${res.status}: ${body.slice(0, 300)}`);
  }
  console.log(`  ✓ ${collection}/${id}`);
}

async function main() {
  console.log(`Seeding ${siteData.branches.length} branches + ${siteData.posts.length} posts → ${PROJECT}`);

  for (const branch of siteData.branches) {
    await putDoc('branches', branch.id, branch);
  }
  for (const post of siteData.posts) {
    await putDoc('posts', post.id, post);
  }
  console.log('Done.');
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
