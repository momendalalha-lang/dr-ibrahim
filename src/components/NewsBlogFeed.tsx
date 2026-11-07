import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Clock, Newspaper, Pin } from 'lucide-react';
import { useLang, type DictKey } from '../i18n';
import type { BlogPost } from '../types/content';
import ArticleModal, { PostCategoryChip } from './ArticleModal';
import Reveal from './Reveal';
import { trackEvent } from '../lib/analytics';

interface NewsBlogFeedProps {
  posts: BlogPost[];
  activePostId: string | null;
  onOpenPost: (id: string | null) => void;
  onGoToBranch: (branchId: string) => void;
}

const FILTERS: { key: string; labelKey: DictKey }[] = [
  { key: 'all', labelKey: 'explorer.all' },
  { key: 'news', labelKey: 'news.cat.news' },
  { key: 'directions', labelKey: 'news.cat.directions' },
  { key: 'update', labelKey: 'news.cat.update' },
  { key: 'article', labelKey: 'news.cat.article' },
];

export default function NewsBlogFeed({ posts, activePostId, onOpenPost, onGoToBranch }: NewsBlogFeedProps) {
  const { t } = useLang();
  const [filter, setFilter] = useState('all');

  const sorted = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
      return b.date.localeCompare(a.date);
    });
  }, [posts]);

  const visible = filter === 'all' ? sorted : sorted.filter((p) => p.category === filter);
  const activePost = posts.find((p) => p.id === activePostId) ?? null;

  return (
    <section id="news" className="relative scroll-mt-20 bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* header */}
        <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-royal-700">{t('news.eyebrow')}</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {t('news.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-3">
              {t('news.subtitle')}
            </p>
          </div>
        </div>
        </Reveal>

        {/* filters */}
        <Reveal delay={80}>
        <div className="mt-7 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => {
                  trackEvent('post_filter', { filter: f.key });
                  setFilter(f.key);
                }}
                className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all ${
                  active
                    ? 'bg-royal-700 text-white shadow-sm'
                    : 'border border-line bg-canvas text-ink-3 hover:border-royal-300 hover:text-royal-700'
                }`}
              >
                {t(f.labelKey)}
              </button>
            );
          })}
        </div>
        </Reveal>

        {/* posts grid — remounts per filter so the stagger replays */}
        {visible.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-canvas/60 px-6 py-14 text-center">
            <Newspaper className="mx-auto h-8 w-8 text-ink-4" />
            <p className="mt-3 text-sm text-ink-3">{t('news.empty')}</p>
          </div>
        ) : (
          <Reveal
            key={filter}
            stagger
            className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 stagger-children"
          >
            {visible.map((post) => (
              <PostCard key={post.id} post={post} onOpen={() => onOpenPost(post.id)} />
            ))}
          </Reveal>
        )}
      </div>

      <ArticleModal post={activePost} onClose={() => onOpenPost(null)} onGoToBranch={onGoToBranch} />
    </section>
  );
}

function PostCard({ post, onOpen }: { post: BlogPost; onOpen: () => void }) {
  const { t, lt, lang } = useLang();
  const date = new Date(post.date + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const open = () => {
    trackEvent('post_open', { post: post.id, category: post.category });
    onOpen();
  };

  return (
    <article
      className={`card-lift group flex cursor-pointer flex-col rounded-2xl border bg-surface p-6 shadow-sm transition-shadow hover:shadow-lg ${
        post.pinned ? 'border-mint-300 ring-1 ring-mint-200' : 'border-line'
      }`}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <PostCategoryChip category={post.category} />
        {post.pinned && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-mint-700">
            <Pin className="h-3 w-3" />
            {t('news.pinned')}
          </span>
        )}
      </div>

      <h3 className="mt-3.5 font-display text-lg font-bold leading-snug text-ink transition-colors group-hover:text-royal-700">
        {lt(post.title)}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-3">{lt(post.excerpt)}</p>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
        <div className="flex items-center gap-3 text-xs text-ink-4">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {date}
          </span>
          {post.readMinutes && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readMinutes} {t('news.readTime')}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-royal-700">
          {t('news.read')}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
        </span>
      </div>
    </article>
  );
}
