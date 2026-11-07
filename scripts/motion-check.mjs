// motion-check.mjs — verify reveal/entrance/progress motion layer on the built site
import { createRequire } from 'node:module';
const require = createRequire('D:/Projects/MUS-Site/package.json');
const { chromium } = require('playwright');

const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errors = [];
p.on('pageerror', e => errors.push(e.message));
await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('.hero-in', { timeout: 15000 });
await p.waitForTimeout(800);

// 1) hero entrance classes present
const hero = await p.evaluate(() => document.querySelectorAll('.hero-in').length);
console.log('hero-in elements:', hero);

// 2) reveals exist and fire
const rev = await p.evaluate(async () => {
  const els = [...document.querySelectorAll('.reveal')];
  const before = els.filter(e => !e.classList.contains('is-in')).length;
  window.scrollTo(0, document.body.scrollHeight * 0.55);
  await new Promise(r => setTimeout(r, 1200));
  const after = els.filter(e => e.classList.contains('is-in')).length;
  return { total: els.length, hiddenBefore: before, inViewAfter: after };
});
console.log('reveals:', JSON.stringify(rev));

// 3) scroll progress width changes with scroll
const prog = await p.evaluate(async () => {
  const bar = document.querySelector('.fixed.inset-x-0.top-0 .h-full');
  const w0 = bar ? bar.style.width : null;
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 300));
  const wTop = bar.style.width;
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 300));
  const wBot = bar.style.width;
  return { w0, wTop, wBot };
});
console.log('progress:', JSON.stringify(prog));

// 4) stagger children get --cd delays
const stag = await p.evaluate(() => {
  const g = document.querySelector('.stagger-children');
  if (!g) return null;
  const kids = [...g.children].slice(0, 3).map(c => getComputedStyle(c).transitionDelay);
  return kids;
});
console.log('stagger delays:', JSON.stringify(stag));

// 5) nav-link underline class
console.log('nav-links:', await p.evaluate(() => document.querySelectorAll('.nav-link').length));
console.log('errors:', errors.length ? errors : 'none');
await b.close();
