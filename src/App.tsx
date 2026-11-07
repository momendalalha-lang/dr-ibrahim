import { useEffect, useMemo, useState } from 'react';
import { LangProvider } from './i18n';
import { siteData } from './data/siteData';
import type { BranchNode } from './types/content';
import { loadCustomBranches } from './lib/adminStore';
import { subscribeContent, type LiveContent } from './lib/contentStore';
import Header from './components/Header';
import HeroProfile from './components/HeroProfile';
import ReelsMarquee from './components/ReelsMarquee';
import FolderExplorer from './components/FolderExplorer';
import NewsBlogFeed from './components/NewsBlogFeed';
import Footer from './components/Footer';
import ToastHost from './components/ToastHost';
import ContentHelperModal from './components/ContentHelperModal';
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

function Site() {
  const [route, setRoute] = useState<Route>(parseHash);
  const [helperOpen, setHelperOpen] = useState(false);
  const [customBranches, setCustomBranches] = useState<BranchNode[]>(() => loadCustomBranches());
  const [live, setLive] = useState<LiveContent>({ branches: null, posts: null });

  // live Firestore content — falls back to bundled seeds while loading/offline
  useEffect(() => subscribeContent(setLive), []);

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
      <Header profile={siteData.profile} onNavigate={onNavigate} />

      <main>
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
              onOpenHelper={() => setHelperOpen(true)}
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
      <ContentHelperModal
        open={helperOpen}
        onClose={() => setHelperOpen(false)}
        branches={branches}
      />
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
