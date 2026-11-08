# Task List: Medical Personal Brand, News Blog & Branching Drive Resource Hub (`MUS-Site`)

## Task 1: Project Scaffolding & Design System Setup
**Description:** Initialize the web application in `D:\Projects\MUS-Site` with Vite, React, TypeScript, and Tailwind CSS. Configure the custom color palette tokens (Deep Navy `#0F172A`, Editorial Purple `#5B21B6`/`#7C3AED`, Alabaster White `#F8FAFC`, Slate Gray `#475569`/`#F1F5F9`, and Vital Emerald Green `#10B981`) along with the typography stack (`Space Grotesk`, `Plus Jakarta Sans`, `JetBrains Mono`, `Silkscreen`).

**Acceptance criteria:**
- [x] Color tokens for Navy, Purple, White, Gray, and Green are defined in CSS variables and utility classes
- [x] Google Fonts (`Space Grotesk`, `Plus Jakarta Sans`, `JetBrains Mono`, `Silkscreen`) load properly
- [x] Base layout shell renders cleanly on desktop and mobile

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Verify color palette swatches and typography hierarchy in browser

**Dependencies:** None

**Files likely touched:**
- `package.json`
- `index.html`
- `src/index.css`
- `src/App.tsx`

**Estimated scope:** Medium (3-5 files)

---

## Task 2: Structured Content Schema & Seed Data
**Description:** Create TypeScript interfaces and a centralized content file (`src/data/siteData.ts`) that models the personal profile, social/action links, nested folder branches (supporting arbitrary sub-branches and Google Drive folder links with step-by-step user directions), and blog/news posts.

**Acceptance criteria:**
- [x] Supports nested folders/branches (`BranchNode` with children and `DriveResourceItem[]`)
- [x] Each resource item supports title, instructions/directions, file type badge, and Google Drive URL
- [x] News/blog items support title, date, category tag, summary, full body, and linked folder branch ID

**Verification:**
- [x] Typecheck passes: `npx tsc --noEmit`
- [x] Manual check: Verify seed data covers sample medical branches and news items

**Dependencies:** Task 1

**Files likely touched:**
- `src/types/content.ts`
- `src/data/siteData.ts`

**Estimated scope:** Small (2 files)

---

## Checkpoint: After Tasks 1-2 (Foundation)
- [x] Application compiles with zero TypeScript errors
- [x] Design system tokens and data structures are ready for UI components

---

## Task 3: Pixel-Art Game Ring Avatar Component & Media Team Asset Slot
**Description:** Build the `<PixelRingAvatar />` component featuring an interactive RPG/game-style segmented ring in Deep Navy, Royal Purple, and Emerald Green. Include an automatic 16-bit pixel-art canvas renderer using the reference photo (`public/assets/profile-reference.png`) so the site looks like a pixel game character in a ring immediately, while allowing a seamless swap when the Production Media Team delivers the final hand-drawn sprite.

**Acceptance criteria:**
- [x] Circular game ring frame renders with Navy, Purple, and Green pixel/HUD accents
- [x] Reference portrait is copied to `public/assets/` and rendered with crisp pixelated styling (`image-rendering: pixelated`) plus toggleable resolution/sprite swap
- [x] Includes a downloadable/viewable "Production Media Team Spec Card" or easy config switch for the final sprite

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Inspect the avatar ring animation and pixelated portrait rendering

**Dependencies:** Task 1, Task 2

**Files likely touched:**
- `src/components/PixelRingAvatar.tsx`
- `public/assets/profile-reference.png`

**Estimated scope:** Small (2 files)

---

## Task 4: Personal Brand Hero & Quick-Action Bar (Share, Copy Link, QR Code)
**Description:** Build the Hero section showcasing the Pixel Ring Avatar, creator name, medical specialty tagline, pinned urgent directions banner, and the 4-button action bar inspired by the reference screenshot (Follow/Connect, Share Profile, Copy Link with toast confirmation, and an interactive QR Code modal).

**Acceptance criteria:**
- [x] Displays avatar, name, bio, and "Live / Updated" emerald green badge
- [x] Action buttons (Follow, Share Profile, Copy Link, QR Code) work interactively
- [x] Pinned directions banner highlights key announcements and scrolls to the target folder branch

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Test Copy Link feedback and QR Code modal open/close

**Dependencies:** Task 3

**Files likely touched:**
- `src/components/HeroProfile.tsx`
- `src/components/QrCodeModal.tsx`

**Estimated scope:** Small (2 files)

---

## Checkpoint: After Tasks 3-4 (Brand Identity & Hero)
- [x] Hero section matches the calm, educational, respectful Navy/Purple/White/Gray/Green aesthetic
- [x] Pixel ring avatar and quick-share actions work across mobile and desktop

---

## Task 5: Multi-Level Folder / Branch Tree Explorer
**Description:** Implement the branching folder directory where visitors can browse main medical branches, drill down into nested sub-folders, navigate via a breadcrumb bar (`All Branches / Branch / Sub-branch`), and filter or search across all folders and resources.

**Acceptance criteria:**
- [x] Users can click any folder card to enter that branch and view its sub-folders or resources
- [x] Breadcrumb navigation and "Back" button allow effortless upward navigation
- [x] Instant search input filters branches and Drive resources in real time
- [x] URL hash updates (`#branch/...`) so specific folders can be shared directly via link

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Click through 2+ levels of nested folders and verify breadcrumb & back navigation

**Dependencies:** Task 2

**Files likely touched:**
- `src/components/FolderExplorer.tsx`
- `src/components/BreadcrumbBar.tsx`

**Estimated scope:** Medium (2-3 files)

---

## Task 6: Branch Detail View & Google Drive Download Gateway Cards
**Description:** Build the resource view inside each branch/folder. Each item displays clear step-by-step directions ("Read before downloading"), file/folder metadata, and a prominent Emerald Green CTA button (`Click Here to Open Google Drive Folder ↗`) that directs the user to the Google Drive folder in a new tab, alongside a one-click "Copy Drive Link" button.

**Acceptance criteria:**
- [x] Displays branch-level directions alert box when present
- [x] Each resource card shows title, description, tags, and a high-contrast Emerald Green CTA button linking to Google Drive (`target="_blank" rel="noopener noreferrer"`)
- [x] Users can copy the direct Google Drive link with a single click

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Verify clicking the CTA opens the configured Google Drive URL and copying link works

**Dependencies:** Task 5

**Files likely touched:**
- `src/components/DriveResourceCard.tsx`
- `src/components/FolderExplorer.tsx`

**Estimated scope:** Small (2 files)

---

## Checkpoint: After Tasks 5-6 (Branching Folder & Drive Gateway)
- [x] Full user journey from landing page -> clicking a medical branch -> entering a subfolder -> clicking "Click Here to Open Google Drive Folder" works seamlessly

---

## Task 7: News, Directions & Personal Blog Feed
**Description:** Build the personal blog and news section for publishing updates, study directions, and news about the creator or medical topics. Includes category tag filtering, pinned news cards, a clean article reader modal/view, and direct buttons inside posts that jump straight to a related folder branch.

**Acceptance criteria:**
- [x] Displays news/blog cards with date, category pill, title, and excerpt
- [x] Clicking a post opens the full formatted article with directions and links
- [x] Posts linked to a folder branch show a "Go to Folder Branch" button that opens that exact folder

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Filter blog posts by category, open an article, and jump to a linked folder branch

**Dependencies:** Task 2, Task 5

**Files likely touched:**
- `src/components/NewsBlogFeed.tsx`
- `src/components/ArticleModal.tsx`

**Estimated scope:** Small (2 files)

---

## Task 8: Easy Content Builder Modal & Final Responsive/Accessibility Verification
**Description:** Add a built-in "Quick Add Link / Folder Generator" helper so the site owner can fill in a simple form (Folder Name, Parent Branch, Directions, Google Drive Link) and copy the ready-to-paste config block, followed by a full responsive & visual polish pass.

**Acceptance criteria:**
- [x] Content helper modal generates valid `siteData.ts` entries for new folders and blog posts
- [x] Mobile, tablet, and desktop layouts pass visual and contrast checks
- [x] Production build succeeds with zero warnings or errors

**Verification:**
- [x] Build succeeds: `npm run build`
- [x] Manual check: Verify full responsive layout at 375px, 768px, and 1440px widths

**Dependencies:** Task 6, Task 7

**Files likely touched:**
- `src/components/ContentHelperModal.tsx`
- `src/App.tsx`

**Estimated scope:** Small (2 files)

---

## Round 2 — Matte Paper Redesign, Instagram Integration & Admin Panel

**Description:** Restyle the whole site from the arcade theme to a calm "paper matte" editorial design (cream `#F5EFE1`, paper white, editorial purple, vivid leaf green), keep the pixel coin purely as the mascot/logo, add the real Instagram profile (@dr.ibrahem_musadaq) with a moving reels banner, and add a single-admin branch manager.

**Acceptance criteria:**
- [x] Matte paper palette: cream canvas, purple ink accents, eye-catching calm green CTAs; arcade fonts/effects removed
- [x] Pixel coin is the logo at the upper-left of the header + hero medallion (no arcade frame)
- [x] Moving banner marquee shows 10 real IG reels with local thumbnails linking to instagram.com/dr.ibrahem_musadaq
- [x] Footer "Connect" section includes the real IG profile card (name, handle, followers, bio, Follow button)
- [x] `#/admin` route: single PIN (`siteData.admin.pin`) unlocks a branch manager — add/delete branches live via localStorage + copy-publish-snippet for permanence
- [x] Bilingual EN/AR strings added for all new UI; RTL still works

**Verification:**
- [x] `npm run build` + typecheck clean
- [x] Playwright: no console/page errors; wrong PIN rejected, correct PIN unlocks; RTL dir=rtl; marquee animation running; reel thumbnails load locally

**Files touched:**
- `src/index.css`, `index.html` (fonts/tokens)
- `src/data/reels.ts` (new), `src/data/siteData.ts`, `src/types/content.ts`
- `src/components/MascotCoin.tsx` (new, replaces PixelRingAvatar), `ReelsMarquee.tsx` (new), `AdminPanel.tsx` (new), `Header.tsx`, `HeroProfile.tsx`, `Footer.tsx`
- `src/lib/adminStore.ts` (new), `src/App.tsx`, `src/i18n.tsx`

---

## Round 3 — Firebase CMS, Live Instagram Stats & Fluid Motion Layer

**Description:** Moved content to Cloud Firestore (public read, admin-only write via Firebase Auth email `dr.ibrahem@mus-hub.com`), added live follower count via Playwright refresh (`public/ig-stats.json`, 6h cron), and upgraded scroll/motion to an elite fluid feel.

**Acceptance criteria:**
- [x] `#/admin` = real email/password login; add/edit/delete branches (nested), Drive links, and news posts — live for all visitors, no redeploy
- [x] Firestore rules: public read, write restricted server-side to admin email (verified: unauth write → 403)
- [x] Follower count auto-refreshes (Playwright Chromium) and renders in hero pill, reels banner, footer card
- [x] Motion layer: `Reveal` component + staggered grids, hero entrance, scroll progress hairline, nav underline sweep, page-in transition; `prefers-reduced-motion` respected
- [x] Deployed to Firebase Hosting (`dr-ibrahim-hub.web.app`) + GitHub Pages mirror via one workflow

**Verification (2026-11-07, live site):**
- [x] `npm run typecheck && vite build` clean (only >500kB chunk warning)
- [x] `scripts/motion-check.mjs` + live Playwright probe: 12 reveals all reach `is-in` on scroll, stagger delays 0.04/0.11/0.18s, progress bar 0%→100%, admin login renders, Arabic toggle → `dir=rtl`, zero console/page errors
- [x] Live bundle hash `index-IsSbuX7N.js` matches local `dist/` on both hosts

**Known follow-ups:**
- [x] Admin email resolved: the live account is `dr.ibrahim@mus-hub.com` (with "i"); rules match; login + write verified 2026-11-07
- [ ] Instagram updater on pure cloud: GitHub IPs are login-walled → migrating to Meta Graph API. Full runbook: `tasks/instagram-api-migration.md`. Interim: local `MUS-IG-Stats` scheduled task every 30 min (works, residential IP). Needs: IG→Professional + Meta app token from user
- [ ] Optional: code-split the >500kB JS chunk; tune motion timing after human review
