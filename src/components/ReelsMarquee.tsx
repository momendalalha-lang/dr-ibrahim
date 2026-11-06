import { ArrowUpRight, Camera, Play } from 'lucide-react';
import { useLang } from '../i18n';
import { instagramProfile, reels } from '../data/reels';

/**
 * Moving banner of the latest Instagram reels.
 * The track renders the reel row twice for a seamless loop;
 * hovering the band pauses the scroll.
 */
export default function ReelsMarquee() {
  const { lt, t } = useLang();
  const row = [...reels, ...reels];

  return (
    <section
      id="reels"
      className="paper-grain relative overflow-hidden bg-plum-900 py-12 text-[#f3ecdd] sm:py-14"
      aria-label="Instagram reels"
    >
      {/* soft glows */}
      <div
        className="pointer-events-none absolute -top-24 start-1/4 h-64 w-64 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7C5CE0, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 end-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #3FAF60, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow inline-flex items-center gap-2 text-mint-300">
              <Camera className="h-3.5 w-3.5" />
              {t('reels.eyebrow')}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {instagramProfile.name}
              <span className="ms-2 align-middle text-sm font-normal text-[#b9a8d6]" dir="ltr">
                @{instagramProfile.handle}
              </span>
            </h2>
          </div>
          <a
            href={instagramProfile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-[#f3ecdd] transition-colors hover:border-mint-400/60 hover:text-mint-300"
          >
            <span className="font-mono text-xs">
              {instagramProfile.followers} {t('reels.followers')}
            </span>
            <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
          </a>
        </div>
      </div>

      {/* moving banner */}
      <div className="marquee-band relative mt-8 overflow-hidden" dir="ltr">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-plum-900 to-transparent sm:w-28" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-plum-900 to-transparent sm:w-28" aria-hidden="true" />

        <div className="marquee-track gap-4 px-4">
          {row.map((reel, i) => (
            <a
              key={`${reel.id}-${i}`}
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-44 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-colors hover:border-mint-400/50 sm:w-52"
              aria-label={lt(reel.caption)}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={reel.thumb}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
                  <span className="grid h-10 w-10 scale-75 place-items-center rounded-full bg-mint-500 text-white opacity-0 shadow-lg transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <Play className="ms-0.5 h-4 w-4 fill-current" />
                  </span>
                </span>
                <span className="absolute bottom-2 end-2 rounded-md bg-black/55 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white">
                  {t('reels.badge')}
                </span>
              </div>
              <p className="line-clamp-2 min-h-[2.6em] px-3 py-2.5 text-[12.5px] leading-snug text-[#d8cdea]">
                {lt(reel.caption)}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
