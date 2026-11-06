import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Clock, Newspaper, X } from 'lucide-react';
import { useLang } from '../i18n';
import type { BlogPost, PostCategory } from '../types/content';

interface ArticleModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onGoToBranch: (branchId: string) => void;
}

const CAT_STYLE: Record<PostCategory, string> = {
  news: 'bg-royal-100 text-royal-700',
  directions: 'bg-mint-100 text-mint-700',
  update: 'bg-muted text-ink-3',
  article: 'bg-royal-50 text-royal-800',
};

export function categoryLabelKey(cat: PostCategory) {
  return `news.cat.${cat}` as const;
}

export function PostCategoryChip({ category }: { category: PostCategory }) {
  const { t } = useLang();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${CAT_STYLE[category]}`}>
      {t(categoryLabelKey(category))}
    </span>
  );
}

export default function ArticleModal({ post, onClose, onGoToBranch }: ArticleModalProps) {
  const { t, lt } = useLang();

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [post, onClose]);

  if (!post) return null;

  const formattedDate = new Date(post.date + 'T00:00:00').toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="anim-overlay fixed inset-0 z-[70] overflow-y-auto bg-ink/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-start justify-center p-4 py-10 sm:p-6">
        <article
          className="anim-modal relative w-full max-w-2xl rounded-3xl border border-line bg-surface shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute end-4 top-4 z-10 rounded-lg bg-muted/80 p-2 text-ink-3 backdrop-blur transition-colors hover:bg-muted hover:text-ink"
            aria-label={t('hero.close')}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="border-b border-line px-6 py-6 sm:px-9 sm:py-8">
            <div className="flex flex-wrap items-center gap-3">
              <PostCategoryChip category={post.category} />
              {post.pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-mint-100 px-2.5 py-1 text-[11px] font-bold text-mint-700">
                  <Newspaper className="h-3 w-3" />
                  {t('news.pinned')}
                </span>
              )}
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
              {lt(post.title)}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-4">
              <span>
                {t('news.postedOn')} {formattedDate}
              </span>
              {post.readMinutes && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {post.readMinutes} {t('news.readTime')}
                </span>
              )}
            </div>
          </div>

          <div className="article-body px-6 py-6 text-[15px] leading-[1.85] text-ink-2 sm:px-9 sm:py-8">
            {post.body.map((para, i) => (
              <p key={i}>{lt(para)}</p>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-muted/50 px-6 py-4 sm:px-9">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-3 transition-colors hover:bg-muted hover:text-ink"
            >
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              {t('news.backToNews')}
            </button>
            {post.linkedBranchId && (
              <button
                onClick={() => {
                  onClose();
                  onGoToBranch(post.linkedBranchId!);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-mint-600 hover:text-white"
              >
                {t('news.goToBranch')}
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
