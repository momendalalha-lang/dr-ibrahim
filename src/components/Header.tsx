import type { MouseEvent as ReactMouseEvent } from 'react';
import { Languages } from 'lucide-react';
import { useLang } from '../i18n';
import type { SiteProfile } from '../types/content';
import MascotCoin from './MascotCoin';
import { trackEvent } from '../lib/analytics';

interface HeaderProps {
  profile: SiteProfile;
  onNavigate: (sectionId: string) => void;
}

export default function Header({ profile, onNavigate }: HeaderProps) {
  const { lang, setLang, t, lt } = useLang();

  const scrollTo = (id: string) => (e: ReactMouseEvent) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <header className="paper-grain sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* brand — mascot coin logo */}
        <a
          href="#top"
          onClick={scrollTo('top')}
          className="group flex items-center gap-3"
          aria-label={lt(profile.name)}
        >
          <MascotCoin profile={profile} size={42} variant="logo" />
          <span className="leading-tight">
            <span className="block font-display text-lg font-semibold tracking-tight text-ink">
              {lt(profile.name)}
            </span>
            <span className="eyebrow block text-ink-4">
              {lang === 'ar' ? 'مركز المعرفة الطبية' : 'Medical Hub'}
            </span>
          </span>
        </a>

        {/* nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {(
            [
              ['nav.home', 'top'],
              ['nav.branches', 'branches'],
              ['nav.news', 'news'],
              ['nav.connect', 'connect'],
            ] as const
          ).map(([key, id]) => (
            <a
              key={key}
              href={`#${id}`}
              onClick={scrollTo(id)}
              className="nav-link rounded-lg px-3 py-2 text-sm font-medium text-ink-3 transition-colors hover:bg-royal-50 hover:text-royal-700"
            >
              {t(key)}
            </a>
          ))}
        </nav>

        {/* language toggle */}
        <button
          onClick={() => {
            const next = lang === 'en' ? 'ar' : 'en';
            trackEvent('language_switch', { lang: next });
            setLang(next);
          }}
          className="flex items-center gap-2 rounded-full border border-line bg-muted px-3.5 py-1.5 text-sm font-semibold text-ink-2 transition-all hover:border-royal-300 hover:bg-royal-50 hover:text-royal-700"
          aria-label={t('lang.label')}
          title={t('lang.label')}
        >
          <Languages className="h-4 w-4" />
          <span className="font-mono text-xs tracking-wide">{t('lang.toggle')}</span>
        </button>
      </div>
    </header>
  );
}
