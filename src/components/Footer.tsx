import type { MouseEvent as ReactMouseEvent } from 'react';
import { ArrowUpRight, AtSign, BadgeCheck, Camera, Globe, Play, Send } from 'lucide-react';
import { useLang } from '../i18n';
import type { InstagramProfile, SiteProfile } from '../types/content';
import { useInstagramStats } from '../lib/useInstagramStats';
import MascotCoin from './MascotCoin';

interface FooterProps {
  profile: SiteProfile;
  instagram?: InstagramProfile;
  onNavigate: (sectionId: string) => void;
}

const SOCIAL_MAP: Record<string, typeof Globe> = {
  x: AtSign,
  youtube: Play,
  telegram: Send,
  instagram: Camera,
};

export default function Footer({ profile, instagram, onNavigate }: FooterProps) {
  const { t, lt } = useLang();
  const igStats = useInstagramStats();
  const year = new Date().getFullYear();

  const scrollTo = (id: string) => (e: ReactMouseEvent) => {
    e.preventDefault();
    onNavigate(id);
  };

  return (
    <footer id="connect" className="paper-grain scroll-mt-20 bg-plum-900 text-[#e9e0f2]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          {/* brand */}
          <div>
            <div className="flex items-center gap-3">
              <MascotCoin profile={profile} size={44} variant="logo" />
              <div>
                <p className="font-display text-lg font-semibold text-white">{profile.name}</p>
                <p className="text-xs text-[#b9a8d6]">{lt(profile.subtitle)}</p>
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#c9bce0]">
              {lt(profile.bio).split('.')[0]}.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-mint-400/25 bg-mint-500/10 px-3.5 py-1.5 text-xs font-semibold text-mint-300">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
              {lt(profile.statusLabel)}
            </p>
          </div>

          {/* explore */}
          <div>
            <h4 className="eyebrow text-mint-300">{t('footer.explore')}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {(
                [
                  ['nav.home', 'top'],
                  ['nav.branches', 'branches'],
                  ['nav.news', 'news'],
                  ['reels.eyebrow', 'reels'],
                ] as const
              ).map(([key, id]) => (
                <li key={key}>
                  <a
                    href={`#${id}`}
                    onClick={scrollTo(id)}
                    className="text-[#c9bce0] transition-colors hover:text-white"
                  >
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* connect — socials */}
          <div>
            <h4 className="eyebrow text-mint-300">{t('footer.connect')}</h4>
            <ul className="mt-4 space-y-2.5">
              {profile.socials.map((s) => {
                const SocialIcon = SOCIAL_MAP[s.id] ?? Globe;
                return (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target={s.url === '#' ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 text-sm text-[#c9bce0] transition-colors hover:text-white"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-[#c9bce0] transition-colors group-hover:border-mint-400/50 group-hover:text-mint-300">
                      <SocialIcon className="h-3.5 w-3.5" />
                    </span>
                    {lt(s.label)}
                  </a>
                </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Instagram contact card */}
        {instagram && (
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-mint-400/40 sm:flex-row sm:items-center"
          >
            <MascotCoin profile={profile} size={64} variant="logo" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 font-display text-base font-semibold text-white">
                {instagram.name}
                {instagram.verified && <BadgeCheck className="h-4 w-4 fill-mint-400 text-plum-900" />}
                <span className="font-mono text-xs font-normal text-[#b9a8d6]" dir="ltr">
                  @{instagram.handle}
                </span>
              </p>
              <p className="mt-0.5 text-sm text-[#c9bce0]">{lt(instagram.bio)}</p>
              <p className="mt-1.5 font-mono text-[11px] text-mint-300">
                {igStats.followers} {t('reels.followers')} · {igStats.following} following
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-mint-500 px-4 py-2 text-sm font-bold text-white transition-colors group-hover:bg-mint-400 sm:self-center">
              <Camera className="h-4 w-4" />
              Follow
              <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
            </span>
          </a>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-[#8f7fb0] sm:flex-row">
          <p>
            © {year} {profile.name}. {t('footer.rights')}
          </p>
          <p className="flex items-center gap-3 font-mono text-[11px] tracking-wide">
            <span>{t('footer.madeWith')}</span>
            <a href="#/admin" className="opacity-60 transition-opacity hover:opacity-100">
              admin
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
