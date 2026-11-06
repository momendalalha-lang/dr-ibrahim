import { useMemo, useState } from 'react';
import { Check, Copy, Wand2, X } from 'lucide-react';
import { useLang, type DictKey } from '../i18n';
import type { BranchNode, CategoryTag, PostCategory, ResourceType } from '../types/content';
import { toast } from '../lib/toast';

interface ContentHelperModalProps {
  open: boolean;
  onClose: () => void;
  branches: BranchNode[];
}

type Kind = 'branch' | 'resource' | 'post';

const TAGS: CategoryTag[] = ['lectures', 'handouts', 'cases', 'media', 'quizzes'];
const CATEGORIES: PostCategory[] = ['news', 'directions', 'update', 'article'];
const RES_TYPES: ResourceType[] = ['drive-folder', 'drive-file', 'external'];
const ICON_CHOICES = ['folder', 'stethoscope', 'heart', 'activity', 'scissors', 'baby', 'users', 'pill', 'microscope'];

const TAG_LABEL: Record<CategoryTag, DictKey> = {
  lectures: 'explorer.lectures',
  handouts: 'explorer.handouts',
  quizzes: 'explorer.quizzes',
  cases: 'explorer.cases',
  media: 'explorer.media',
};

const CAT_LABEL: Record<PostCategory, DictKey> = {
  news: 'news.cat.news',
  directions: 'news.cat.directions',
  update: 'news.cat.update',
  article: 'news.cat.article',
};

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'new-item'
  );
}

const q = (s: string) => JSON.stringify(s);
const loc = (en: string, ar: string) => `{ en: ${q(en)}, ar: ${q(ar)} }`;
const optLoc = (en: string, ar: string) =>
  en.trim() || ar.trim() ? `\n  description: ${loc(en.trim(), ar.trim())},` : '';

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function flattenBranches(nodes: BranchNode[], prefix = ''): { id: string; label: string }[] {
  const out: { id: string; label: string }[] = [];
  for (const n of nodes) {
    const label = prefix ? `${prefix} / ${n.title.en}` : n.title.en;
    out.push({ id: n.id, label });
    if (n.children?.length) out.push(...flattenBranches(n.children, label));
  }
  return out;
}

export default function ContentHelperModal({ open, onClose, branches }: ContentHelperModalProps) {
  const { t } = useLang();

  const [kind, setKind] = useState<Kind>('branch');
  const [parentId, setParentId] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');
  const [dirEn, setDirEn] = useState('');
  const [dirAr, setDirAr] = useState('');
  const [url, setUrl] = useState('');
  const [resType, setResType] = useState<ResourceType>('drive-folder');
  const [kindLabel, setKindLabel] = useState('');
  const [icon, setIcon] = useState('folder');
  const [tags, setTags] = useState<CategoryTag[]>([]);
  const [excerptEn, setExcerptEn] = useState('');
  const [excerptAr, setExcerptAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [category, setCategory] = useState<PostCategory>('news');
  const [linkedBranchId, setLinkedBranchId] = useState('');
  const [snippet, setSnippet] = useState('');
  const [copied, setCopied] = useState(false);

  const flatBranches = useMemo(() => flattenBranches(branches), [branches]);

  if (!open) return null;

  const toggleTag = (tag: CategoryTag) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));

  const tagsLine = tags.length ? `\n  tags: [${tags.map((x) => `'${x}'`).join(', ')}],` : '';

  const generate = () => {
    let out = '';
    const id = slugify(titleEn || titleAr || 'item');
    const title = loc(titleEn, titleAr);
    const parentLabel = flatBranches.find((b) => b.id === parentId)?.label;
    const where =
      kind === 'post'
        ? '// → paste inside `posts` in src/data/siteData.ts\n'
        : parentId && parentLabel
          ? `// → paste inside branch: ${parentLabel}\n`
          : '// → paste at the top level of `branches` in src/data/siteData.ts\n';

    if (kind === 'branch') {
      out = `${where}{
  id: '${id}',
  title: ${title},${optLoc(descEn, descAr)}
  icon: '${icon}',${tagsLine}
  directions: ${loc(dirEn, dirAr)},
  children: [
    // sub-branches go here
  ],
  resources: [
    // drive resources go here
  ],
},`;
    } else if (kind === 'resource') {
      out = `${where}{
  id: '${id}',
  title: ${title},${optLoc(descEn, descAr)}
  type: '${resType}',
  url: ${q(url)},${kindLabel.trim() ? `\n  kindLabel: ${q(kindLabel.trim())},` : ''}${tagsLine}
},`;
    } else {
      const bodyEnParas = paragraphs(bodyEn);
      const bodyArParas = paragraphs(bodyAr);
      const maxLen = Math.max(bodyEnParas.length, bodyArParas.length);
      const bodyArr = Array.from({ length: maxLen }, (_, i) => {
        const enP = bodyEnParas[i] ?? '';
        const arP = bodyArParas[i] ?? '';
        return `    ${loc(enP, arP)}`;
      }).join(',\n');
      out = `${where}{
  id: '${id}',
  title: ${title},
  excerpt: ${loc(excerptEn, excerptAr)},
  body: [
${bodyArr}
  ],
  category: '${category}',
  date: '${new Date().toISOString().slice(0, 10)}',${linkedBranchId ? `\n  linkedBranchId: '${linkedBranchId}',` : ''}
},`;
    }
    setSnippet(out);
    setCopied(false);
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = snippet;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    toast(t('helper.copied'), 3200);
  };

  const inputCls =
    'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:border-royal-400 focus:outline-none focus:ring-4 focus:ring-royal-100';
  const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-3';

  return (
    <div
      className="anim-overlay fixed inset-0 z-[75] overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('helper.title')}
    >
      <div
        className="anim-modal mx-auto my-8 w-full max-w-2xl rounded-3xl border border-line bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="eyebrow flex items-center gap-2 text-royal-700">
              <Wand2 className="h-3.5 w-3.5" />
              {t('helper.title')}
            </p>
            <p className="mt-1.5 text-sm text-ink-3">{t('helper.hint')}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-4 transition-colors hover:bg-muted hover:text-ink"
            aria-label={t('helper.close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
          {/* kind */}
          <div>
            <label className={labelCls}>{t('helper.kind')}</label>
            <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              <option value="branch">{t('helper.kind.branch')}</option>
              <option value="resource">{t('helper.kind.resource')}</option>
              <option value="post">{t('helper.kind.post')}</option>
            </select>
          </div>

          {/* parent (branch/resource) */}
          {kind !== 'post' && (
            <div>
              <label className={labelCls}>{t('helper.parent')}</label>
              <select className={inputCls} value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">{t('helper.root')}</option>
                {flatBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* titles */}
          <div>
            <label className={labelCls}>{t('helper.titleEn')}</label>
            <input className={inputCls} value={titleEn} onChange={(e) => setTitleEn(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={labelCls}>{t('helper.titleAr')}</label>
            <input className={inputCls} value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" />
          </div>

          {/* descriptions */}
          <div>
            <label className={labelCls}>{t('helper.descEn')}</label>
            <input className={inputCls} value={descEn} onChange={(e) => setDescEn(e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={labelCls}>{t('helper.descAr')}</label>
            <input className={inputCls} value={descAr} onChange={(e) => setDescAr(e.target.value)} dir="rtl" />
          </div>

          {/* branch-only fields */}
          {kind === 'branch' && (
            <>
              <div>
                <label className={labelCls}>{t('helper.directionsEn')}</label>
                <input className={inputCls} value={dirEn} onChange={(e) => setDirEn(e.target.value)} dir="ltr" />
              </div>
              <div>
                <label className={labelCls}>{t('helper.directionsAr')}</label>
                <input className={inputCls} value={dirAr} onChange={(e) => setDirAr(e.target.value)} dir="rtl" />
              </div>
              <div>
                <label className={labelCls}>{t('helper.icon')}</label>
                <select className={inputCls} value={icon} onChange={(e) => setIcon(e.target.value)}>
                  {ICON_CHOICES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* resource-only fields */}
          {kind === 'resource' && (
            <>
              <div>
                <label className={labelCls}>{t('helper.url')}</label>
                <input
                  className={inputCls}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/…"
                  dir="ltr"
                />
              </div>
              <div>
                <label className={labelCls}>{t('helper.resourceType')}</label>
                <select className={inputCls} value={resType} onChange={(e) => setResType(e.target.value as ResourceType)}>
                  {RES_TYPES.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t('helper.kindLabel')}</label>
                <input className={inputCls} value={kindLabel} onChange={(e) => setKindLabel(e.target.value)} placeholder="PDF Pack" />
              </div>
            </>
          )}

          {/* post-only fields */}
          {kind === 'post' && (
            <>
              <div>
                <label className={labelCls}>{t('helper.excerptEn')}</label>
                <input className={inputCls} value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} dir="ltr" />
              </div>
              <div>
                <label className={labelCls}>{t('helper.excerptAr')}</label>
                <input className={inputCls} value={excerptAr} onChange={(e) => setExcerptAr(e.target.value)} dir="rtl" />
              </div>
              <div>
                <label className={labelCls}>{t('helper.bodyEn')}</label>
                <textarea className={`${inputCls} min-h-[88px]`} value={bodyEn} onChange={(e) => setBodyEn(e.target.value)} dir="ltr" />
              </div>
              <div>
                <label className={labelCls}>{t('helper.bodyAr')}</label>
                <textarea className={`${inputCls} min-h-[88px]`} value={bodyAr} onChange={(e) => setBodyAr(e.target.value)} dir="rtl" />
              </div>
              <div>
                <label className={labelCls}>{t('helper.category')}</label>
                <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as PostCategory)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(CAT_LABEL[c])}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t('helper.linkedBranch')}</label>
                <select className={inputCls} value={linkedBranchId} onChange={(e) => setLinkedBranchId(e.target.value)}>
                  <option value="">—</option>
                  {flatBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* tags — shared */}
          <div className="sm:col-span-2">
            <label className={labelCls}>{t('helper.tags')}</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      active ? 'bg-royal-700 text-white' : 'border border-line bg-canvas text-ink-3 hover:border-royal-300'
                    }`}
                  >
                    {t(TAG_LABEL[tag])}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* generate + output */}
        <div className="border-t border-line px-6 py-5">
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-2"
          >
            <Wand2 className="h-4 w-4" />
            {t('helper.generate')}
          </button>

          {snippet && (
            <div className="mt-4">
              <pre
                dir="ltr"
                className="max-h-64 overflow-auto rounded-xl border border-line bg-ink p-4 font-mono text-[12px] leading-relaxed text-mint-200"
              >
                {snippet}
              </pre>
              <button
                onClick={copySnippet}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-mint-600 hover:text-white"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {t('helper.copy')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
