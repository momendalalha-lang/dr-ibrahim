import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  FolderTree,
  LogOut,
  Newspaper,
  Pencil,
  Pin,
  Plus,
  Trash2,
} from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useLang } from '../i18n';
import type {
  BlogPost,
  BranchNode,
  CategoryTag,
  LocalizedText,
  PostCategory,
  ResourceType,
} from '../types/content';
import { auth, ADMIN_EMAIL } from '../lib/firebase';
import {
  adminSignIn,
  adminSignOut,
  deleteBranch,
  deletePost,
  saveBranch,
  savePost,
} from '../lib/contentStore';
import { toast } from '../lib/toast';

interface AdminPanelProps {
  branches: BranchNode[];
  posts: BlogPost[];
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
const RES_TYPES: { value: ResourceType; key: 'admin.typeDriveFolder' | 'admin.typeDriveFile' | 'admin.typeExternal' }[] = [
  { value: 'drive-folder', key: 'admin.typeDriveFolder' },
  { value: 'drive-file', key: 'admin.typeDriveFile' },
  { value: 'external', key: 'admin.typeExternal' },
];
const CATEGORIES: { value: PostCategory; key: 'admin.catNews' | 'admin.catDirections' | 'admin.catUpdate' | 'admin.catArticle' }[] = [
  { value: 'news', key: 'admin.catNews' },
  { value: 'directions', key: 'admin.catDirections' },
  { value: 'update', key: 'admin.catUpdate' },
  { value: 'article', key: 'admin.catArticle' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/* ── tree helpers ─────────────────────────────────────────── */

interface FlatNode {
  node: BranchNode;
  depth: number;
  topId: string;
}

function flatten(nodes: BranchNode[], depth = 0, topId = '', out: FlatNode[] = []): FlatNode[] {
  for (const n of nodes) {
    const tid = depth === 0 ? n.id : topId;
    out.push({ node: n, depth, topId: tid });
    if (n.children?.length) flatten(n.children, depth + 1, tid, out);
  }
  return out;
}

function collectIds(n: BranchNode, out = new Set<string>()): Set<string> {
  out.add(n.id);
  n.children?.forEach((c) => collectIds(c, out));
  return out;
}

function findTop(branches: BranchNode[], id: string): BranchNode | null {
  for (const b of branches) {
    if (b.id === id || collectIds(b).has(id)) return b;
  }
  return null;
}

function mapTree(
  nodes: BranchNode[],
  id: string,
  fn: (n: BranchNode) => BranchNode
): BranchNode[] {
  return nodes.map((n) => {
    if (n.id === id) return fn(n);
    if (n.children?.length) {
      return { ...n, children: mapTree(n.children, id, fn) };
    }
    return n;
  });
}

function removeTree(nodes: BranchNode[], id: string): BranchNode[] {
  return nodes.flatMap((n) => {
    if (n.id === id) return [];
    return [
      {
        ...n,
        children: n.children?.length ? removeTree(n.children, id) : n.children,
      },
    ];
  });
}

function allIds(branches: BranchNode[]): Set<string> {
  const s = new Set<string>();
  branches.forEach((b) => collectIds(b, s));
  return s;
}

const inputCls =
  'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-4 focus:border-royal-400 focus:outline-none focus:ring-4 focus:ring-royal-100';
const labelCls = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-3';

const emptyBranchForm = {
  titleEn: '',
  titleAr: '',
  descEn: '',
  descAr: '',
  dirsEn: '',
  dirsAr: '',
  parentId: '',
  url: '',
  kindLabel: 'Drive Folder',
  resType: 'drive-folder' as ResourceType,
  icon: '',
};

const emptyPostForm = {
  titleEn: '',
  titleAr: '',
  excerptEn: '',
  excerptAr: '',
  bodyEn: '',
  bodyAr: '',
  category: 'news' as PostCategory,
  date: new Date().toISOString().slice(0, 10),
  readMinutes: '2',
  pinned: false,
  linkedBranchId: '',
};

export default function AdminPanel({ branches, posts, onBack }: AdminPanelProps) {
  const { t, lt } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [tab, setTab] = useState<'branches' | 'posts'>('branches');

  // login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');

  // branch form
  const [bf, setBf] = useState(emptyBranchForm);
  const [tags, setTags] = useState<CategoryTag[]>([]);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);

  // post form
  const [pf, setPf] = useState(emptyPostForm);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u && u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? u : null);
      setAuthReady(true);
    });
  }, []);

  const flat = useMemo(() => flatten(branches), [branches]);
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.date.localeCompare(a.date)),
    [posts]
  );

  const setB = (k: keyof typeof emptyBranchForm) => (e: { target: { value: string } }) =>
    setBf((p) => ({ ...p, [k]: e.target.value }));
  const setP = (k: keyof typeof emptyPostForm) => (e: { target: { value: string } }) =>
    setPf((p) => ({ ...p, [k]: e.target.value }));

  const toggleTag = (tag: CategoryTag) =>
    setTags((prev) => (prev.includes(tag) ? prev.filter((x) => x !== tag) : [...prev, tag]));

  /* ── auth ────────────────────────────────────────────────── */
  const tryLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError('');
    try {
      await adminSignIn(email, password);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setLoginError(
        code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
          ? t('admin.wrongCreds')
          : code === 'auth/unauthorized'
            ? t('admin.emailNotAllowed')
            : t('admin.saveFailed')
      );
    } finally {
      setLoginBusy(false);
    }
  };

  /* ── branch CRUD ─────────────────────────────────────────── */
  const resetBranchForm = () => {
    setBf(emptyBranchForm);
    setTags([]);
    setEditingBranchId(null);
  };

  const startEditBranch = (id: string) => {
    const found = flat.find((f) => f.node.id === id);
    if (!found) return;
    const n = found.node;
    const res = n.resources?.[0];
    setBf({
      titleEn: n.title.en,
      titleAr: n.title.ar,
      descEn: n.description?.en ?? '',
      descAr: n.description?.ar ?? '',
      dirsEn: n.directions?.en ?? '',
      dirsAr: n.directions?.ar ?? '',
      parentId: '',
      url: res?.url ?? '',
      kindLabel: res?.kindLabel ?? 'Drive Folder',
      resType: res?.type ?? 'drive-folder',
      icon: n.icon ?? '',
    });
    setTags(n.tags ?? []);
    setEditingBranchId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitBranch = async (e: FormEvent) => {
    e.preventDefault();
    const titleEn = bf.titleEn.trim();
    const titleAr = bf.titleAr.trim() || titleEn;
    const url = bf.url.trim();
    if (!titleEn) return;

    const today = new Date().toISOString().slice(0, 10);
    const lt = (en: string, ar: string): LocalizedText | undefined =>
      en.trim() || ar.trim() ? { en: en.trim(), ar: ar.trim() || en.trim() } : undefined;

    try {
      if (editingBranchId) {
        // update the node inside its top-level ancestor doc
        const found = flat.find((f) => f.node.id === editingBranchId);
        if (!found) return;
        const original = found.node;
        const updated: BranchNode = {
          ...original,
          title: { en: titleEn, ar: titleAr },
          description: lt(bf.descEn, bf.descAr),
          directions: lt(bf.dirsEn, bf.dirsAr),
          icon: bf.icon || undefined,
          tags: tags.length ? tags : undefined,
          resources: url
            ? [
                {
                  ...(original.resources?.[0] ?? {
                    id: `${original.id}-drive`,
                    title: { en: `${titleEn} — Google Drive`, ar: `${titleAr} — Google Drive` },
                  }),
                  title: { en: `${titleEn} — Link`, ar: `${titleAr} — رابط` },
                  type: bf.resType,
                  url,
                  kindLabel: bf.kindLabel.trim() || 'Drive',
                  updatedAt: today,
                  tags: tags.length ? tags : undefined,
                },
              ]
            : original.resources,
        };
        const top = findTop(branches, editingBranchId);
        if (!top) return;
        const newTop = mapTree([top], editingBranchId, () => updated)[0];
        await saveBranch(newTop);
        toast(t('admin.saved'));
        resetBranchForm();
      } else {
        // create new node (top-level or child of selected parent)
        const existing = allIds(branches);
        const base = slugify(titleEn) || 'branch';
        let id = base;
        let n = 2;
        while (existing.has(id)) id = `${base}-${n++}`;

        const node: BranchNode = {
          id,
          title: { en: titleEn, ar: titleAr },
          description: lt(bf.descEn, bf.descAr),
          directions: lt(bf.dirsEn, bf.dirsAr),
          icon: bf.icon || undefined,
          tags: tags.length ? tags : undefined,
          resources: url
            ? [
                {
                  id: `${id}-link`,
                  title: { en: `${titleEn} — Google Drive`, ar: `${titleAr} — Google Drive` },
                  type: bf.resType,
                  url,
                  kindLabel: bf.kindLabel.trim() || 'Drive Folder',
                  updatedAt: today,
                  tags: tags.length ? tags : undefined,
                },
              ]
            : undefined,
        };

        if (bf.parentId) {
          const top = findTop(branches, bf.parentId);
          if (!top) return;
          const newTop = mapTree([top], bf.parentId, (p) => ({
            ...p,
            children: [...(p.children ?? []), node],
          }))[0];
          await saveBranch(newTop);
        } else {
          await saveBranch(node);
        }
        toast(t('admin.saved'));
        resetBranchForm();
      }
    } catch {
      toast(t('admin.saveFailed'));
    }
  };

  const removeBranch = async (id: string) => {
    if (!window.confirm(t('admin.deleteBranchConfirm'))) return;
    try {
      const top = findTop(branches, id);
      if (!top) return;
      if (top.id === id) {
        await deleteBranch(id);
      } else {
        const [newTop] = removeTree([top], id);
        if (newTop) await saveBranch(newTop);
      }
      if (editingBranchId === id) resetBranchForm();
      toast(t('admin.deleted'));
    } catch {
      toast(t('admin.saveFailed'));
    }
  };

  /* ── post CRUD ───────────────────────────────────────────── */
  const resetPostForm = () => {
    setPf(emptyPostForm);
    setEditingPostId(null);
  };

  const startEditPost = (id: string) => {
    const p = posts.find((x) => x.id === id);
    if (!p) return;
    setPf({
      titleEn: p.title.en,
      titleAr: p.title.ar,
      excerptEn: p.excerpt.en,
      excerptAr: p.excerpt.ar,
      bodyEn: p.body.map((b) => b.en).join('\n'),
      bodyAr: p.body.map((b) => b.ar).join('\n'),
      category: p.category,
      date: p.date,
      readMinutes: String(p.readMinutes ?? 2),
      pinned: !!p.pinned,
      linkedBranchId: p.linkedBranchId ?? '',
    });
    setEditingPostId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const paragraphs = (text: string): LocalizedText[] => {
    const enLines = text.split('\n').map((s) => s.trim()).filter(Boolean);
    return enLines.map((en) => ({ en, ar: en }));
  };

  const submitPost = async (e: FormEvent) => {
    e.preventDefault();
    const titleEn = pf.titleEn.trim();
    if (!titleEn) return;
    const titleAr = pf.titleAr.trim() || titleEn;
    const bodyEn = paragraphs(pf.bodyEn);
    const bodyArLines = pf.bodyAr.split('\n').map((s) => s.trim()).filter(Boolean);
    // pair AR lines with EN paragraphs by index; fall back to EN text
    const body: LocalizedText[] = bodyEn.map((b, i) => ({
      en: b.en,
      ar: bodyArLines[i] ?? b.en,
    }));

    const post: BlogPost = {
      id: editingPostId ?? (slugify(titleEn) || `post-${Date.now()}`),
      title: { en: titleEn, ar: titleAr },
      excerpt: {
        en: pf.excerptEn.trim() || titleEn,
        ar: pf.excerptAr.trim() || titleAr,
      },
      body: body.length ? body : [{ en: titleEn, ar: titleAr }],
      category: pf.category,
      date: pf.date || new Date().toISOString().slice(0, 10),
      readMinutes: Math.max(1, parseInt(pf.readMinutes, 10) || 2),
      pinned: pf.pinned || undefined,
      linkedBranchId: pf.linkedBranchId || undefined,
    };

    try {
      await savePost(post);
      toast(t('admin.postSaved'));
      resetPostForm();
    } catch {
      toast(t('admin.saveFailed'));
    }
  };

  const removePost = async (id: string) => {
    if (!window.confirm(t('admin.deletePostConfirm'))) return;
    try {
      await deletePost(id);
      if (editingPostId === id) resetPostForm();
      toast(t('admin.deleted'));
    } catch {
      toast(t('admin.saveFailed'));
    }
  };

  /* ── login gate ──────────────────────────────────────────── */
  if (!authReady) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-ink-4">
        {t('admin.loading')}
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-20">
        <form
          onSubmit={tryLogin}
          className="rounded-2xl border border-line bg-surface p-8 shadow-sm"
        >
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-royal-100 text-royal-700">
            <Newspaper className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-center font-display text-2xl font-semibold text-ink">
            {t('admin.loginTitle')}
          </h1>
          <p className="mt-2 text-center text-sm text-ink-3">{t('admin.subtitle')}</p>
          <div className="mt-5 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('admin.email')}
              className={inputCls}
              autoComplete="email"
            />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('admin.password')}
              className={inputCls}
              autoComplete="current-password"
            />
          </div>
          {loginError && <p className="mt-3 text-center text-sm font-semibold text-red-600">{loginError}</p>}
          <button
            type="submit"
            disabled={loginBusy}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-royal-700 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-royal-800 disabled:opacity-60"
          >
            {loginBusy ? t('admin.signingIn') : t('admin.signIn')}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 w-full text-center text-sm font-semibold text-ink-4 hover:text-ink"
          >
            {t('admin.backToSite')}
          </button>
        </form>
      </section>
    );
  }

  /* ── manager ─────────────────────────────────────────────── */
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-3 hover:text-royal-700"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('admin.backToSite')}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-ink-4">
            {t('admin.signedInAs')} <span className="font-mono">{user.email}</span>
          </span>
          <button
            onClick={() => adminSignOut()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink-3 transition-colors hover:border-red-300 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t('admin.signOut')}
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-royal-700">{t('admin.eyebrow')}</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{t('admin.title')}</h1>
        </div>
        {/* tabs */}
        <div className="flex rounded-xl border border-line bg-surface p-1">
          {(
            [
              ['branches', FolderTree, t('admin.tabBranches')],
              ['posts', Newspaper, t('admin.tabPosts')],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                tab === key ? 'bg-royal-700 text-white' : 'text-ink-3 hover:text-royal-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'branches' ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* ── branch form ── */}
          <form onSubmit={submitBranch} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Plus className="h-4.5 w-4.5 text-mint-600" />
              {editingBranchId ? t('admin.saveChanges') : t('admin.newBranch')}
            </h2>
            {editingBranchId && (
              <p className="mt-1 font-mono text-[11px] text-ink-4" dir="ltr">
                editing #{editingBranchId}
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t('helper.titleEn')} *</label>
                <input className={inputCls} value={bf.titleEn} onChange={setB('titleEn')} required placeholder="Cardiology" />
              </div>
              <div>
                <label className={labelCls}>{t('helper.titleAr')}</label>
                <input className={inputCls} dir="rtl" value={bf.titleAr} onChange={setB('titleAr')} placeholder="أمراض القلب" />
              </div>
              {!editingBranchId && (
                <div className="sm:col-span-2">
                  <label className={labelCls}>{t('admin.parentBranch')}</label>
                  <select className={inputCls} value={bf.parentId} onChange={setB('parentId')}>
                    <option value="">{t('admin.topLevel')}</option>
                    {flat.map((f) => (
                      <option key={f.node.id} value={f.node.id}>
                        {'— '.repeat(f.depth)}
                        {lt(f.node.title)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('helper.descEn')}</label>
                <input className={inputCls} value={bf.descEn} onChange={setB('descEn')} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('helper.descAr')}</label>
                <input className={inputCls} dir="rtl" value={bf.descAr} onChange={setB('descAr')} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('helper.url')}</label>
                <input
                  className={`${inputCls} font-mono text-xs`}
                  dir="ltr"
                  type="url"
                  value={bf.url}
                  onChange={setB('url')}
                  placeholder="https://drive.google.com/drive/folders/..."
                />
              </div>
              <div>
                <label className={labelCls}>{t('admin.resType')}</label>
                <select className={inputCls} value={bf.resType} onChange={setB('resType')}>
                  {RES_TYPES.map((rt) => (
                    <option key={rt.value} value={rt.value}>
                      {t(rt.key)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t('helper.kindLabel')}</label>
                <input className={inputCls} value={bf.kindLabel} onChange={setB('kindLabel')} placeholder="Drive Folder" />
              </div>
              <div>
                <label className={labelCls}>{t('helper.icon')}</label>
                <select className={inputCls} value={bf.icon} onChange={setB('icon')}>
                  {ICON_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('helper.directionsEn')}</label>
                <textarea className={`${inputCls} min-h-[64px]`} value={bf.dirsEn} onChange={setB('dirsEn')} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('helper.directionsAr')}</label>
                <textarea className={`${inputCls} min-h-[64px]`} dir="rtl" value={bf.dirsAr} onChange={setB('dirsAr')} />
              </div>
            </div>

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

            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-mint-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-mint-700"
              >
                <Plus className="h-4 w-4" />
                {editingBranchId ? t('admin.saveChanges') : t('admin.addBranch')}
              </button>
              {editingBranchId && (
                <button
                  type="button"
                  onClick={resetBranchForm}
                  className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-3 hover:text-ink"
                >
                  {t('admin.cancel')}
                </button>
              )}
            </div>
          </form>

          {/* ── branch list ── */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-ink">{t('admin.branchesList')}</h2>
            <ul className="mt-4 space-y-2">
              {flat.map(({ node, depth }) => (
                <li
                  key={node.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-2.5"
                  style={{ marginInlineStart: `${depth * 20}px` }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{lt(node.title)}</p>
                    <p className="font-mono text-[10px] text-ink-4" dir="ltr">
                      #{node.id}
                      {node.children?.length ? ` · ${node.children.length} sub` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => startEditBranch(node.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-4 transition-colors hover:bg-royal-50 hover:text-royal-700"
                      aria-label={t('admin.edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeBranch(node.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-4 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={t('admin.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center font-mono text-[11px] text-ink-4">
              {flat.length} {t('admin.totalBranches')} · {t('admin.onlyOne')}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* ── post form ── */}
          <form onSubmit={submitPost} className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
              <Plus className="h-4.5 w-4.5 text-mint-600" />
              {editingPostId ? t('admin.saveChanges') : t('admin.newPost')}
            </h2>
            {editingPostId && (
              <p className="mt-1 font-mono text-[11px] text-ink-4" dir="ltr">
                editing #{editingPostId}
              </p>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t('helper.titleEn')} *</label>
                <input className={inputCls} value={pf.titleEn} onChange={setP('titleEn')} required />
              </div>
              <div>
                <label className={labelCls}>{t('helper.titleAr')}</label>
                <input className={inputCls} dir="rtl" value={pf.titleAr} onChange={setP('titleAr')} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('admin.excerptEn')}</label>
                <input className={inputCls} value={pf.excerptEn} onChange={setP('excerptEn')} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('admin.excerptAr')}</label>
                <input className={inputCls} dir="rtl" value={pf.excerptAr} onChange={setP('excerptAr')} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('admin.bodyEn')}</label>
                <textarea className={`${inputCls} min-h-[110px]`} value={pf.bodyEn} onChange={setP('bodyEn')} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{t('admin.bodyAr')}</label>
                <textarea className={`${inputCls} min-h-[110px]`} dir="rtl" value={pf.bodyAr} onChange={setP('bodyAr')} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.category')}</label>
                <select
                  className={inputCls}
                  value={pf.category}
                  onChange={(e) => setPf((p) => ({ ...p, category: e.target.value as PostCategory }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {t(c.key)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t('admin.linkedBranch')}</label>
                <select
                  className={inputCls}
                  value={pf.linkedBranchId}
                  onChange={(e) => setPf((p) => ({ ...p, linkedBranchId: e.target.value }))}
                >
                  <option value="">{t('admin.noBranch')}</option>
                  {flat.map((f) => (
                    <option key={f.node.id} value={f.node.id}>
                      {'— '.repeat(f.depth)}
                      {lt(f.node.title)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t('admin.date')}</label>
                <input className={inputCls} type="date" value={pf.date} onChange={setP('date')} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.readMinutes')}</label>
                <input className={inputCls} type="number" min={1} value={pf.readMinutes} onChange={setP('readMinutes')} />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={pf.pinned}
                  onChange={(e) => setPf((p) => ({ ...p, pinned: e.target.checked }))}
                  className="h-4 w-4 accent-royal-700"
                />
                <Pin className="h-3.5 w-3.5 text-royal-600" />
                {t('admin.pinned')}
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-mint-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-mint-700"
              >
                <Plus className="h-4 w-4" />
                {editingPostId ? t('admin.saveChanges') : t('admin.addPost')}
              </button>
              {editingPostId && (
                <button
                  type="button"
                  onClick={resetPostForm}
                  className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-3 hover:text-ink"
                >
                  {t('admin.cancel')}
                </button>
              )}
            </div>
          </form>

          {/* ── posts list ── */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-ink">{t('admin.postsList')}</h2>
            {sortedPosts.length === 0 ? (
              <p className="mt-3 text-sm text-ink-4">{t('admin.postsEmpty')}</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {sortedPosts.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
                        {p.pinned && <Pin className="h-3 w-3 shrink-0 fill-royal-600 text-royal-600" />}
                        {lt(p.title)}
                      </p>
                      <p className="font-mono text-[10px] text-ink-4" dir="ltr">
                        #{p.id} · {p.date} · {p.category}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => startEditPost(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-4 transition-colors hover:bg-royal-50 hover:text-royal-700"
                        aria-label={t('admin.edit')}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removePost(p.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-ink-4 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={t('admin.delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
