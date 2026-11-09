import { useId } from 'react';
import { useLang } from '../i18n';
import type { SiteProfile } from '../types/content';
import PixelCanvas from './PixelCanvas';

interface MascotCoinProps {
  profile: SiteProfile;
  /** css px diameter of the emblem */
  size?: number;
  /** 'logo' = compact badge, 'hero' = badge + curved MEDICINE arc */
  variant?: 'logo' | 'hero';
}

/**
 * Dr Ibrahim's mascot emblem: a smooth portrait bust on a plain white
 * medallion (no coin frame, no pixelation) with the word "MEDICINE"
 * curved along a semicircle above it.
 */
export default function MascotCoin({ profile, size = 216, variant = 'hero' }: MascotCoinProps) {
  const { lang } = useLang();
  const uid = useId();
  const isSprite = profile.avatarMode === 'sprite' && !!profile.avatarSpriteSrc;
  const showArc = variant === 'hero';
  const arcText = lang === 'ar' ? 'الطب' : 'MEDICINE';

  return (
    <div
      className="group relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={profile.name}
    >
      {/* white medallion — 62% of the emblem, centered at (50%, 63%) */}
      <div
        className="avatar-float absolute overflow-hidden rounded-full bg-white shadow-[0_16px_36px_-14px_rgb(43_33_21/0.4)] ring-1 ring-line"
        style={{
          left: '19%',
          top: variant === 'hero' ? '32%' : '19%',
          width: '62%',
          height: '62%',
        }}
      >
        {isSprite ? (
          <img
            src={profile.avatarSpriteSrc}
            alt={profile.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 30%, #E4F3E6 0%, #C2E7C9 55%, #94D6A4 100%)',
              }}
            />
            <PixelCanvas
              src={profile.avatarSrc}
              resolution={112}
              className="pixelated relative h-full w-full object-cover"
            />
          </>
        )}
      </div>

      {/* curved MEDICINE arc */}
      {showArc && (
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <path id={`mascot-arc-${uid}`} d="M 26 126 A 74 74 0 0 1 174 126" fill="none" />
          </defs>
          {/* anchor dots where the arc meets the badge */}
          <circle cx="38" cy="126" r="2.4" fill="#7C5CE0" />
          <circle cx="162" cy="126" r="2.4" fill="#7C5CE0" />
          <text
            fontFamily="'Playfair Display', 'IBM Plex Sans Arabic', serif"
            fontWeight="600"
            fontSize="15"
            fill="#1c5b2e"
          >
            <textPath
              href={`#mascot-arc-${uid}`}
              startOffset="50%"
              textAnchor="middle"
              textLength="205"
              lengthAdjust="spacing"
              dy="-2"
            >
              {arcText}
            </textPath>
          </text>
        </svg>
      )}
    </div>
  );
}
