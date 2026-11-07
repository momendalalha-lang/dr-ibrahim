import { useEffect, useMemo, useState } from 'react';
import { LangProvider } from './i18n';
import { siteData } from './data/siteData';
import type { BranchNode } from './types/content';
import { loadCustomBranches } from './lib/adminStore';
import { subscribeContent, type LiveContent } from './lib/contentStore';
import { initAnalytics } from './lib/analytics';
import Header from './components/Header';
import HeroProfile from './components/HeroProfile';
import ReelsMarquee from './components/ReelsMarquee';
import FolderExplorer from './components/FolderExplorer';
import NewsBlogFeed from './components/NewsBlogFeed';
import Footer from './components/Footer';
import ToastHost from './components/ToastHost';
import AdminPanel from './components/AdminPanel';

interface Route {
  path: string[];
  post: string | null;
  admin: boolean;
}

function parseHash(): Route {
  const h = window.location.hash;
  if (h.startsWith('#/admin')) return { path: [], post: null, admin: true };
  if (h.startsWith('#/branch/')) {
    return { path: h.slice('#/branch/'.length).split('/').filter(Boolean), post: null, admin: false };
  }
  if (h.startsWith('#/post/')) {
    return { path: [], post: h.slice('#/post/'.length) || null, admin: false };
  }
  return { path: [], post: null, admin: false };
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** slim mint progress hairline pinned to the top of the viewport */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        setP(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-mint-500 via-mint-400 to-royal-500 shadow-[0_0_10px_rgb(63_175_96/0.55)]"
        style={{ width: `${p * 100}%` }}
      />
    </div>
  );
}

function Site() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [customBranches, setCustomBranches] = useState<BranchNode[]>(() => loadCustomBranches());
  const [live, setLive] = useState<LiveContent>({ branches: null, posts: null });

  // live Firestore content — falls back to bundled seeds while loading/offline
  useEffect(() => subscribeContent(setLive), []);

  // GA4 — no-op until GA_ID is set in lib/analytics.ts
  useEffect(() => initAnalytics(), []);

  const branches = useMemo(
    () =>
      live.branches ?? [...siteData.branches, ...customBranches],
    [live.branches, customBranches]
  );

  const posts = live.posts ?? siteData.posts;

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    const refreshBranches = () => setCustomBranches(loadCustomBranches());
    window.addEventListener('hashchange', onHash);
    window.addEventListener('mus-branches-changed', refreshBranches);
    window.addEventListener('storage', refreshBranches);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('mus-branches-changed', refreshBranches);
      window.removeEventListener('storage', refreshBranches);
    };
  }, []);

  // deep links: scroll the relevant section into view when the route changes
  useEffect(() => {
    if (route.admin) return;
    if (route.post) scrollToId('news');
    else if (route.path.length > 0) scrollToId('branches');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.path.join('/'), route.post, route.admin]);

  const onNavigate = (id: string) => {
    // leaving a deep route → reset explorer/post state, then scroll
    if (window.location.hash.startsWith('#/')) window.location.hash = '';
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else scrollToId(id);
  };

  const onOpenBranch = (branchId: string) => {
    window.location.hash = `#/branch/${branchId}`;
  };

  const onBranchPathChange = (ids: string[]) => {
    window.location.hash = ids.length ? `#/branch/${ids.join('/')}` : '';
  };

  const onOpenPost = (id: string | null) => {
    window.location.hash = id ? `#/post/${id}` : '#news';
  };

  const onAdminBack = () => {
    window.location.hash = '';
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-canvas font-body text-ink">
      <ScrollProgress />
      <Header profile={siteData.profile} onNavigate={onNavigate} />

      <main key={route.admin ? 'admin' : 'site'} className="page-in">
        {route.admin ? (
          <AdminPanel
            branches={branches}
            posts={posts}
            onBack={onAdminBack}
          />
        ) : (
          <>
            <HeroProfile
              profile={siteData.profile}
              onOpenBranch={onOpenBranch}
              onScrollTo={onNavigate}
            />
            <ReelsMarquee />
            <FolderExplorer
              branches={branches}
              path={route.path}
              onNavigate={onBranchPathChange}
            />
            <NewsBlogFeed
              posts={posts}
              activePostId={route.post}
              onOpenPost={onOpenPost}
              onGoToBranch={onOpenBranch}
            />
          </>
        )}
      </main>

      <Footer profile={siteData.profile} instagram={siteData.instagram} onNavigate={onNavigate} />

      <ToastHost />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Site />
    </LangProvider>
  );
}
