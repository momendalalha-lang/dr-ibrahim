import { useState } from 'react';
import {
  ArrowDown,
  Copy,
  QrCode,
  Share2,
  UserPlus,
  Pin,
} from 'lucide-react';
import { useLang } from '../i18n';
import type { SiteProfile } from '../types/content';
import MascotCoin from './MascotCoin';
import QrCodeModal from './QrCodeModal';
import { toast } from '../lib/toast';

interface HeroProfileProps {
  profile: SiteProfile;
  onOpenBranch: (branchId: string) => void;
  onScrollTo: (sectionId: string) => void;
}

export default function HeroProfile({ profile, onOpenBranch, onScrollTo }: HeroProfileProps) {
  const { t, lt } = useLang();
  const [qrOpen, setQrOpen] = useState(false);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      toast(t('hero.copied'));
    } catch {
      const ta = document.createElement('textarea');
      ta.value = siteUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      toast(t('hero.copied'));
    }
  };

  const shareProfile = async () => {
    const shareData = {
      title: `${profile.name} — Medical Knowledge Hub`,
      text: lt(profile.subtitle),
      url: siteUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        /* user cancelled or unsupported — fall through to copy */
      }
    }
    await copyLink();
    toast(t('hero.shareFail'));
  };

  const scrollToConnect = () => onScrollTo('connect');

  return (
    <section id="top" className="paper-grain relative overflow-hidden hero-wash">
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto] lg:gap-14">
          {/* ── intro ── */}
          <div className="text-center lg:text-start">
            <p className="eyebrow inline-flex items-center gap-2 rounded-full border border-mint-300 bg-mint-50 px-4 py-1.5 text-mint-700">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-500" />
              {t('hero.badge')}
            </p>

            <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              {profile.name}
            </h1>
            <p className="mt-3 font-display text-lg italic text-royal-700 sm:text-xl">
              {lt(profile.subtitle)}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-3 lg:mx-0">
              {lt(profile.bio)}
            </p>

            {/* status pill */}
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-mint-200 bg-mint-50 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint-500" />
              </span>
              <span className="text-sm font-semibold text-mint-700">{lt(profile.statusLabel)}</span>
            </div>

            {/* action bar */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <button
                onClick={scrollToConnect}
                className="inline-flex items-center gap-2 rounded-xl bg-mint-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-mint-600/25 transition-all hover:bg-mint-700 active:scale-[0.98]"
              >
                <UserPlus className="h-4 w-4" />
                {t('hero.follow')}
              </button>
              <button
                onClick={shareProfile}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-2 shadow-sm transition-all hover:border-royal-300 hover:text-royal-700 active:scale-[0.98]"
              >
                <Share2 className="h-4 w-4" />
                {t('hero.share')}
              </button>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-2 shadow-sm transition-all hover:border-royal-300 hover:text-royal-700 active:scale-[0.98]"
              >
                <Copy className="h-4 w-4" />
                {t('hero.copyLink')}
              </button>
              <button
                onClick={() => setQrOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-2 shadow-sm transition-all hover:border-royal-300 hover:text-royal-700 active:scale-[0.98]"
              >
                <QrCode className="h-4 w-4" />
                {t('hero.qr')}
              </button>
            </div>
          </div>

          {/* ── mascot coin in a paper frame ── */}
          <div className="relative mx-auto w-fit">
            <div className="relative rotate-2 rounded-2xl border border-line bg-surface p-4 pb-5 shadow-[0_18px_40px_-18px_rgb(43_33_21/0.4)] transition-transform duration-500 hover:rotate-0">
              {/* tape strips */}
              <span className="absolute -top-2.5 left-6 h-5 w-16 -rotate-6 rounded-sm bg-mint-200/70" aria-hidden="true" />
              <span className="absolute -top-2 right-8 h-5 w-14 rotate-3 rounded-sm bg-royal-200/70" aria-hidden="true" />
              <MascotCoin profile={profile} size={224} />
              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-4">
                {profile.name} · {t('hero.mascotTag')}
              </p>
            </div>
          </div>
        </div>

        {/* pinned directions banner */}
        <div className="mt-14 w-full rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-mint-100 text-mint-700 ring-1 ring-mint-200">
                <Pin className="h-4 w-4" />
              </span>
              <div>
                <p className="eyebrow text-mint-700">{t('pinned.eyebrow')}</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-ink sm:text-xl">
                  {lt(profile.pinned.title)}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-3">{lt(profile.pinned.body)}</p>
              </div>
            </div>
            <button
              onClick={() => onOpenBranch(profile.pinned.branchId)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-royal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-royal-800"
            >
              {lt(profile.pinned.ctaLabel)}
              <ArrowDown className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>

      <QrCodeModal open={qrOpen} onClose={() => setQrOpen(false)} url={siteUrl} />
    </section>
  );
}
