import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowUp,
  Baby,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  HeartPulse,
  Microscope,
  Pill,
  Scissors,
  Search,
  Stethoscope,
  Users,
  Wand2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useLang, type DictKey } from '../i18n';
import type { BranchNode, CategoryTag, DriveResource } from '../types/content';
import DriveResourceCard from './DriveResourceCard';
import Reveal from './Reveal';
import { trackEvent } from '../lib/analytics';

const ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  heart: HeartPulse,
  activity: Activity,
  scissors: Scissors,
  baby: Baby,
  users: Users,
  pill: Pill,
  microscope: Microscope,
};

const FILTERS: { key: string; dictKey: DictKey; tags?: CategoryTag[] }[] = [
  { key: 'all', dictKey: 'explorer.all' },
  { key: 'lectures', dictKey: 'explorer.lectures', tags: ['lectures'] },
  { key: 'handouts', dictKey: 'explorer.handouts', tags: ['handouts', 'quizzes'] },
  { key: 'cases', dictKey: 'explorer.cases', tags: ['cases'] },
  { key: 'media', dictKey: 'explorer.media', tags: ['media'] },
];

function iconFor(node: BranchNode): LucideIcon {
  return (node.icon && ICONS[node.icon]) || FolderOpen;
}

function matchesTags(tags: CategoryTag[] | undefined, filter: (typeof FILTERS)[number]): boolean {
  if (!filter.tags) return true;
  return (tags ?? []).some((t) => filter.tags!.includes(t));
}

interface Resolved {
  node: BranchNode | null;
  trail: { node: BranchNode; ids: string[] }[];
}

function resolvePath(branches: BranchNode[], ids: string[]): Resolved {
  const trail: { node: BranchNode; ids: string[] }[] = [];
  let siblings = branches;
  let current: BranchNode | null = null;
  const used: string[] = [];

  for (const id of ids) {
    const found = siblings.find((b) => b.id === id);
    if (!found) break;
    used.push(id);
    current = found;
    trail.push({ node: found, ids: [...used] });
    siblings = found.children ?? [];
  }
  return { node: current, trail };
}

interface BranchHit {
  kind: 'branch';
  node: BranchNode;
  ids: string[];
  label: string;
}
interface ResourceHit {
  kind: 'resource';
  resource: DriveResource;
  ids: string[];
  label: string;
}
type Hit = BranchHit | ResourceHit;

function searchTree(
  branches: BranchNode[],
  rootLabel: string,
  lt: (v: BranchNode['title']) => string,
  query: string
): Hit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: Hit[] = [];

  const walk = (nodes: BranchNode[], ids: string[], trailTitles: string[]) => {
    for (const node of nodes) {
      const pathIds = [...ids, node.id];
      const pathTitles = [...trailTitles, lt(node.title)];
      const hay = `${node.title.en} ${node.title.ar} ${node.description?.en ?? ''} ${node.description?.ar ?? ''}`.toLowerCase();
      if (hay.includes(q)) {
        hits.push({ kind: 'branch', node, ids: pathIds, label: [rootLabel, ...pathTitles].join(' / ') });
      }
      for (const res of node.resources ?? []) {
        const rhay = `${res.title.en} ${res.title.ar} ${res.description?.en ?? ''} ${res.description?.ar ?? ''} ${res.kindLabel ?? ''}`.toLowerCase();
        if (rhay.includes(q)) {
          hits.push({
            kind: 'resource',
            resource: res,
            ids: pathIds,
            label: [rootLabel, ...pathTitles].join(' / '),
          });
        }
      }
      if (node.children?.length) walk(node.children, pathIds, pathTitles);
    }
  };
  walk(branches, [], []);
  return hits.slice(0, 40);
}

interface FolderExplorerProps {
  branches: BranchNode[];
  path: string[];
  onNavigate: (ids: string[]) => void;
  onOpenHelper: () => void;
}

export default function FolderExplorer({ branches, path, onNavigate, onOpenHelper }: FolderExplorerProps) {
  const { t, lt, lang } = useLang();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>(FILTERS[0]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const onSearchChange = (v: string) => {
    setQuery(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const q = v.trim();
      if (q.length >= 2) trackEvent('search', { search_term: q });
    }, 800);
  };

  useEffect(() => {
    setQuery('');
  }, [path]);

  const { node: current, trail } = useMemo(() => resolvePath(branches, path), [branches, path]);
  const children = current?.children ?? branches;
  const resources = current?.resources ?? [];

  const searching = query.trim().length >= 2;
  const hits = useMemo(
    () => (searching ? searchTree(branches, t('explorer.root'), lt, query) : []),
    [searching, branches, query, lt, t]
  );

  const visibleChildren = children.filter((b) => matchesTags(b.tags, filter));
  const visibleResources = resources.filter((r) => matchesTags(r.tags, filter));

  const branchHits = hits.filter((h): h is BranchHit => h.kind === 'branch');
  const resourceHits = hits.filter((h): h is ResourceHit => h.kind === 'resource');

  const Chevron = lang === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <section id="branches" className="relative scroll-mt-20 bg-canvas py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* header */}
        <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-royal-700">{t('explorer.eyebrow')}</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {t('explorer.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-3">
              {t('explorer.subtitle')}
            </p>
          </div>
          <button
            onClick={onOpenHelper}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-2 shadow-sm transition-all hover:border-royal-300 hover:text-royal-700"
            title={t('explorer.addContent')}
          >
            <Wand2 className="h-4 w-4 text-royal-600" />
            <span className="hidden sm:inline">{t('explorer.addContent')}</span>
          </button>
        </div>
        </Reveal>

        {/* toolbar: search + filters */}
        <Reveal delay={80}>
        <div className="mt-8 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-ink-4" />
            <input
              type="search"
              value={query}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('explorer.search')}
              className="w-full rounded-2xl border border-line bg-surface py-3.5 ps-11 pe-11 text-[15px] text-ink shadow-sm placeholder:text-ink-4 focus:border-royal-400 focus:outline-none focus:ring-4 focus:ring-royal-100"
              aria-label={t('explorer.search')}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-4 hover:bg-muted hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter categories">
            {FILTERS.map((f) => {
              const active = filter.key === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all ${
                    active
                      ? 'bg-ink text-white shadow-sm'
                      : 'border border-line bg-surface text-ink-3 hover:border-royal-300 hover:text-royal-700'
                  }`}
                >
                  {t(f.dictKey)}
                </button>
              );
            })}
          </div>
        </div>
        </Reveal>

        {/* breadcrumb */}
        <Reveal delay={140}>
        <nav
          className="mt-6 flex items-center gap-1 overflow-x-auto rounded-xl border border-line bg-surface px-3 py-2.5 shadow-sm"
          aria-label="Breadcrumb"
        >
          <button
            onClick={() => onNavigate([])}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold transition-colors ${
              trail.length === 0 ? 'bg-royal-100 text-royal-800' : 'text-ink-3 hover:bg-muted hover:text-ink'
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {t('explorer.root')}
          </button>
          {trail.map((step, i) => {
            const isLast = i === trail.length - 1;
            return (
              <span key={step.ids.join('/')} className="flex shrink-0 items-center gap-1">
                <Chevron className="h-3.5 w-3.5 text-ink-4 rtl:rotate-180" />
                <button
                  onClick={() => onNavigate(step.ids)}
                  className={`rounded-lg px-2.5 py-1 text-[13px] font-semibold transition-colors ${
                    isLast ? 'bg-royal-100 text-royal-800' : 'text-ink-3 hover:bg-muted hover:text-ink'
                  }`}
                >
                  {lt(step.node.title)}
                </button>
              </span>
            );
          })}
          {trail.length > 0 && (
            <button
              onClick={() => onNavigate(trail[trail.length - 2]?.ids ?? [])}
              className="ms-auto flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold text-ink-4 transition-colors hover:bg-muted hover:text-ink"
            >
              <ArrowUp className="h-3.5 w-3.5 rtl:rotate-180" />
              {t('explorer.goUp')}
            </button>
          )}
        </nav>
        </Reveal>

        {/* content — remounts on branch navigation so reveals replay */}
        <div className="mt-6" key={path.join('/')}>
          {searching ? (
            hits.length === 0 ? (
              <EmptyState text={t('explorer.noResults')} />
            ) : (
              <div className="space-y-8">
                {branchHits.length > 0 && (
                  <ResultGroup title={t('explorer.matchingBranches')} count={branchHits.length}>
                    <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                      {branchHits.map((hit) => (
                        <BranchCard
                          key={hit.ids.join('/')}
                          node={hit.node}
                          onOpen={() => onNavigate(hit.ids)}
                          pathLabel={hit.label}
                        />
                      ))}
                    </Reveal>
                  </ResultGroup>
                )}
                {resourceHits.length > 0 && (
                  <ResultGroup title={t('explorer.matchingFiles')} count={resourceHits.length}>
                    <Reveal stagger className="grid gap-4 md:grid-cols-2 stagger-children">
                      {resourceHits.map((hit) => (
                        <div key={`${hit.ids.join('/')}:${hit.resource.id}`} className="space-y-2">
                          <DriveResourceCard resource={hit.resource} pathLabel={hit.label} />
                          <button
                            onClick={() => onNavigate(hit.ids)}
                            className="text-[13px] font-semibold text-royal-700 underline-offset-2 hover:underline"
                          >
                            {t('explorer.openFolder')} →
                          </button>
                        </div>
                      ))}
                    </Reveal>
                  </ResultGroup>
                )}
              </div>
            )
          ) : (
            <>
              {/* directions box */}
              {current?.directions && (
                <Reveal className="mb-6">
                <div className="rounded-2xl border border-royal-200 bg-royal-50/70 p-5">
                  <p className="eyebrow flex items-center gap-2 text-royal-700">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-royal-600" />
                    {t('explorer.directionsTitle')}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">{lt(current.directions)}</p>
                  <p className="mt-2 text-xs text-ink-4">{t('explorer.directionsHint')}</p>
                </div>
                </Reveal>
              )}

              {/* sub-branches */}
              {visibleChildren.length > 0 && (
                <div>
                  <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-4">
                    {visibleChildren.length} {t('explorer.folders')}
                  </p>
                  <Reveal stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                    {visibleChildren.map((child) => (
                      <BranchCard
                        key={child.id}
                        node={child}
                        onOpen={() => onNavigate([...path, child.id])}
                      />
                    ))}
                  </Reveal>
                </div>
              )}

              {/* resources */}
              {visibleResources.length > 0 && (
                <div className={visibleChildren.length > 0 ? 'mt-10' : ''}>
                  <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-4">
                    {visibleResources.length} {t('explorer.resources')}
                  </p>
                  <Reveal stagger className="grid gap-4 md:grid-cols-2 stagger-children">
                    {visibleResources.map((res) => (
                      <DriveResourceCard key={res.id} resource={res} />
                    ))}
                  </Reveal>
                </div>
              )}

              {visibleChildren.length === 0 && visibleResources.length === 0 && (
                <EmptyState text={t('explorer.empty')} />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── small pieces ─────────────────────────────────────────────── */

function BranchCard({
  node,
  onOpen,
  pathLabel,
}: {
  node: BranchNode;
  onOpen: () => void;
  pathLabel?: string;
}) {
  const { lt } = useLang();
  const Icon = iconFor(node);
  const folderCount = node.children?.length ?? 0;
  const resourceCount = node.resources?.length ?? 0;

  return (
    <button
      onClick={() => {
        trackEvent('branch_open', { branch: node.id });
        onOpen();
      }}
      className="card-lift group flex w-full flex-col rounded-2xl border border-line bg-surface p-5 text-start shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-royal-100 to-royal-50 text-royal-700 ring-1 ring-royal-200 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-5.5 w-5.5" />
        </span>
        <ChevronRight className="mt-1 h-5 w-5 text-ink-4 transition-all group-hover:translate-x-0.5 group-hover:text-royal-600 rtl:-scale-x-100" />
      </div>
      <h3 className="mt-4 font-display text-[17px] font-bold leading-snug text-ink">
        {lt(node.title)}
      </h3>
      {node.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-3">{lt(node.description)}</p>
      )}
      {pathLabel && (
        <p className="mt-2 font-mono text-[10px] text-ink-4" dir="ltr">
          {pathLabel}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3 border-t border-line pt-3 text-xs font-medium text-ink-4">
        {folderCount > 0 && <span>{folderCount} folders</span>}
        {resourceCount > 0 && <span>{resourceCount} files</span>}
        {folderCount === 0 && resourceCount === 0 && <span className="italic">Open →</span>}
      </div>
    </button>
  );
}

function ResultGroup({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ink-4">
        {title} · {count}
      </p>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface/60 px-6 py-14 text-center">
      <FolderOpen className="mx-auto h-8 w-8 text-ink-4" />
      <p className="mt-3 text-sm text-ink-3">{text}</p>
    </div>
  );
}
