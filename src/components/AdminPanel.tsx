import { useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, Check, Copy, KeyRound, Lock, Plus, Trash2 } from 'lucide-react';
import { useLang } from '../i18n';
import type { BranchNode, CategoryTag, LocalizedText } from '../types/content';
import {
  addCustomBranch,
  deleteCustomBranch,
  isAdminAuthed,
  loadCustomBranches,
  setAdminAuthed,
} from '../lib/adminStore';
import { toast } from '../lib/toast';

interface AdminPanelProps {
  seedBranches: BranchNode[];
  adminPin: string;
  onBack: () => void;
}

const ICON_OPTIONS = [
  { value: '', label: 'Default folder' },
  { value: 'stethoscope', label: 'Stethoscope' },
  { value: 'heart', label: 'Heart' },
  { value: 'activity', label: 'Activity' },
  { value: 'scissors', label: 'Scissors' },
  { value: 'baby', label: 'Pediatrics' },
  { value: 'users', label: 'People' },
  { value: 'pill', label: 'Pill' },
  { value: 'microscope', label: 'Microscope' },
];

const TAG_OPTIONS: CategoryTag[] = ['lectures', 'handouts', 'cases', 'media', 'quizzes'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function ltToTs(v: LocalizedText | undefined): string {
  if (!v) return "{ en: '', ar: '' }";
  return `{ en: '${esc(v.en)}', ar: '${esc(v.ar)}' }`;
}

/** Generate a paste-ready TypeScript block for src/data/siteData.ts */
export function branchToSnippet(node: BranchNode): string {
  const tags = node.tags?.length ? `\n      tags: [${node.tags.map((t) => `'${t}'`).join(', ')}],` : '';
  const icon = node.icon ? `\n      icon: '${node.icon}',` : '';
  const desc = node.description ? `\n      description: ${ltToTs(node.description)},` : '';
  const dirs = node.directions ? `\n      directions: ${ltToTs(node.directions)},` : '';
  const res = (node.resources ?? [])[0];
  const resource = res
    ? `\n      resources: [\n        {\n          id: '${res.id}',\n          title: ${ltToTs(res.title)},\n          type: '${res.type}',\n          url: '${esc(res.url)}',${res.kindLabel ? `\n          kindLabel: '${esc(res.kindLabel)}',` : ''}${res.updatedAt ? `\n          updatedAt: '${res.updatedAt}',` : ''}${res.tags?.length ? `\n          tags: [${res.tags.map((t) => `'${t}'`).join(', ')}],` : ''}\n        },\n      ],`
    : '';
  return `    {\n      id: '${node.id}',\n      title: ${ltToTs(node.title)},${desc}${dirs}${icon}${tags}${resource}\n    },`;
}

const inputCls =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:border-royal-400 focus:outline-none focus:ring-4 focus:ring-royal-100';
const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-3';

export default function AdminPanel({ seedBranches, adminPin, onBack }: AdminPanelProps) {
  const { t, lt } = useLang();
  const [authed, setAuthed] = useState(isAdminAuthed());
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [custom, setCustom] = useState<BranchNode[]>(() => loadCustomBranches());

  // form state
  const [f, setF] = useState({
    titleEn: '',
    titleAr: '',
    descEn: '',
    descAr: '',
    dirsEn: '',
    dirsAr: '',
    url: '',
    kindLabel: 'Drive Folder',
    icon: '',
  });
  const [tags, setTags] = useState<CategoryTag[]>([]);
  const [snippet, setSnippet] = useState('');

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const toggleTag = (tag: CategoryTag) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));

  const refresh = () => setCustom(loadCustomBranches());

  const tryUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (pin.trim() === adminPin) {
      setAdminAuthed(true);
      setAuthed(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const titleEn = f.titleEn.trim();
    const titleAr = f.titleAr.trim() || titleEn;
    const url = f.url.trim();
    if (!titleEn || !url) return;

    const base = slugify(titleEn) || 'branch';
    const existing = new Set([...seedBranches, ...custom].map((b) => b.id));
    let id = base;
    let n = 2;
    while (existing.has(id)) id = `${base}-${n++}`;

    const today = new Date().toISOString().slice(0, 10);
    const node: BranchNode = {
      id,
      title: { en: titleEn, ar: titleAr },
      description:
        f.descEn.trim() || f.descAr.trim()
          ? { en: f.descEn.trim(), ar: f.descAr.trim() || f.descEn.trim() }
          : undefined,
      directions:
        f.dirsEn.trim() || f.dirsAr.trim()
          ? { en: f.dirsEn.trim(), ar: f.dirsAr.trim() || f.dirsEn.trim() }
          : undefined,
      icon: f.icon || undefined,
      tags: tags.length ? tags : undefined,
      resources: [
        {
          id: `${id}-drive`,
          title: { en: `${titleEn} — Google Drive`, ar: `${titleAr} — Google Drive` },
          type: 'drive-folder',
          url,
          kindLabel: f.kindLabel.trim() || 'Drive Folder',
          updatedAt: today,
          tags: tags.length ? tags : undefined,
        },
      ],
    };

    addCustomBranch(node);
    refresh();
    setSnippet(branchToSnippet(node));
    setF({ titleEn: '', titleAr: '', descEn: '', descAr: '', dirsEn: '', dirsAr: '', url: '', kindLabel: 'Drive Folder', icon: '' });
    setTags([]);
    toast(t('admin.added'));
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
    toast(t('admin.snippetCopied'));
  };

  const allBranches = useMemo(() => [...seedBranches, ...custom], [seedBranches, custom]);

  /* ── PIN gate ─────────────────────────────────────────────── */
  if (!authed) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-20">
        <form
          onSubmit={tryUnlock}
          className="rounded-2xl border border-line bg-surface p-8 text-center shadow-sm"
        >
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-royal-100 text-royal-700">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-semibold text-ink">{t('admin.pinTitle')}</h1>
          <p className="mt-2 text-sm text-ink-3">{t('admin.pinHint')}</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setPinError(false);
            }}
            placeholder={t('admin.pin')}
            className={`${inputCls} mt-5 text-center font-mono tracking-widest`}
            autoFocus
          />
          {pinError && <p className="mt-2 text-sm font-semibold text-red-600">{t('admin.wrongPin')}</p>}
          <button
            type="submit"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-royal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-royal-800"
          >
            <KeyRound className="h-4 w-4" />
            {t('admin.unlock')}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 text-sm font-semibold text-ink-4 hover:text-ink"
          >
            {t('admin.backToSite')}
          </button>
        </form>
      </section>
    );
  }

  /* ── manager ──────────────────────────────────────────────── */
  return (
    <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-3 hover:text-royal-700"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t('admin.backToSite')}
      </button>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-royal-700">{t('admin.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{t('admin.title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-3">{t('admin.subtitle')}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-100 px-3 py-1 text-xs font-bold text-mint-700">
          <Check className="h-3.5 w-3.5" />
          {custom.length} {t('admin.customCount')}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* ── add form ── */}
        <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Plus className="h-4.5 w-4.5 text-mint-600" />
            {t('admin.newBranch')}
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t('helper.titleEn')} *</label>
              <input className={inputCls} value={f.titleEn} onChange={set('titleEn')} required placeholder="Cardiology" />
            </div>
            <div>
              <label className={labelCls}>{t('helper.titleAr')}</label>
              <input className={inputCls} dir="rtl" value={f.titleAr} onChange={set('titleAr')} placeholder="أمراض القلب" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t('helper.descEn')}</label>
              <input className={inputCls} value={f.descEn} onChange={set('descEn')} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t('helper.descAr')}</label>
              <input className={inputCls} dir="rtl" value={f.descAr} onChange={set('descAr')} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t('helper.url')} *</label>
              <input
                className={`${inputCls} font-mono text-xs`}
                dir="ltr"
                type="url"
                value={f.url}
                onChange={set('url')}
                required
                placeholder="https://drive.google.com/drive/folders/..."
              />
            </div>
            <div>
              <label className={labelCls}>{t('helper.kindLabel')}</label>
              <input className={inputCls} value={f.kindLabel} onChange={set('kindLabel')} placeholder="Drive Folder" />
            </div>
            <div>
              <label className={labelCls}>{t('helper.icon')}</label>
              <select className={inputCls} value={f.icon} onChange={set('icon')}>
                {ICON_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t('helper.directionsEn')}</label>
              <textarea className={`${inputCls} min-h-[64px]`} value={f.dirsEn} onChange={set('dirsEn')} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>{t('helper.directionsAr')}</label>
              <textarea className={`${inputCls} min-h-[64px]`} dir="rtl" value={f.dirsAr} onChange={set('dirsAr')} />
            </div>
          </div>

          {/* tags */}
          <div className="mt-4">
            <label className={labelCls}>{t('helper.tags')}</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-royal-700 text-white'
                        : 'border border-line bg-muted text-ink-3 hover:border-royal-300 hover:text-royal-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-mint-700"
          >
            <Plus className="h-4 w-4" />
            {t('admin.addBranch')}
          </button>
        </form>

        {/* ── list + publish ── */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-ink">{t('admin.customBranches')}</h2>
            {custom.length === 0 ? (
              <p className="mt-3 text-sm text-ink-4">{t('admin.empty')}</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {custom.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{lt(b.title)}</p>
                      <p className="font-mono text-[10px] text-ink-4" dir="ltr">
                        #{b.id}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(t('admin.deleteConfirm'))) {
                          deleteCustomBranch(b.id);
                          refresh();
                        }
                      }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-4 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={t('admin.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-mint-200 bg-mint-50 p-6">
            <h2 className="font-display text-lg font-semibold text-mint-800">{t('admin.publishTitle')}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mint-800/80">{t('admin.publishNote')}</p>
            {snippet ? (
              <button
                onClick={copySnippet}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-royal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-royal-800"
              >
                <Copy className="h-4 w-4" />
                {t('admin.copySnippet')}
              </button>
            ) : (
              <p className="mt-3 text-xs text-mint-800/60">{t('admin.publishHint')}</p>
            )}
          </div>
        </div>
      </div>

      {/* live count across merged tree (debug-ish reassurance) */}
      <p className="mt-8 text-center font-mono text-[11px] text-ink-4">
        {allBranches.length} {t('admin.totalBranches')} · {t('admin.onlyOne')}
      </p>
    </section>
  );
}
