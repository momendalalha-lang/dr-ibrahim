import { ArrowUpRight, Copy, FileText, FolderOpen, ExternalLink, HardDrive } from 'lucide-react';
import { useLang } from '../i18n';
import type { DriveResource } from '../types/content';
import { toast } from '../lib/toast';

interface DriveResourceCardProps {
  resource: DriveResource;
  /** breadcrumb label of where this resource lives, e.g. "Internal Medicine / Cardiology" */
  pathLabel?: string;
}

const TYPE_META = {
  'drive-folder': { icon: FolderOpen, badge: 'card.type.folder', chip: 'bg-royal-100 text-royal-700' },
  'drive-file': { icon: FileText, badge: 'card.type.file', chip: 'bg-muted text-ink-3' },
  external: { icon: ExternalLink, badge: 'card.type.external', chip: 'bg-royal-100 text-royal-700' },
} as const;

export default function DriveResourceCard({ resource, pathLabel }: DriveResourceCardProps) {
  const { t, lt, lang } = useLang();
  const meta = TYPE_META[resource.type];
  const Icon = meta.icon;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(resource.url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = resource.url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast(t('card.copied'));
  };

  const formattedDate = resource.updatedAt
    ? new Date(resource.updatedAt + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <article className="card-lift group flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-sm">
      {/* header row */}
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.chip}`}>
          <Icon className="h-3.5 w-3.5" />
          {t(meta.badge)}
        </span>
        {resource.kindLabel && (
          <span className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-3">
            {resource.kindLabel}
          </span>
        )}
      </div>

      {/* title + desc */}
      <h3 className="mt-3 font-display text-[17px] font-bold leading-snug text-ink">
        {lt(resource.title)}
      </h3>
      {resource.description && (
        <p className="mt-1.5 text-sm leading-relaxed text-ink-3">{lt(resource.description)}</p>
      )}
      {pathLabel && (
        <p className="mt-2 font-mono text-[11px] text-ink-4" dir="ltr">
          {pathLabel}
        </p>
      )}

      {/* meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-4">
        {formattedDate && (
          <span>
            {t('card.updated')}: <span className="font-medium text-ink-3">{formattedDate}</span>
          </span>
        )}
        {resource.sizeLabel && <span className="font-mono">{resource.sizeLabel}</span>}
      </div>

      {/* actions */}
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-mint-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-mint-600/25 transition-all hover:bg-mint-700 active:scale-[0.99]"
        >
          <HardDrive className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {resource.type === 'external' ? t('card.openLink') : t('card.openDrive')}
          </span>
          <ArrowUpRight className="h-4 w-4 shrink-0 rtl:-scale-x-100" />
        </a>
        <button
          onClick={copyLink}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-muted px-4 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:border-royal-300 hover:bg-royal-50 hover:text-royal-700"
          title={t('card.copyLink')}
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">{t('card.copyLink')}</span>
        </button>
      </div>
    </article>
  );
}
