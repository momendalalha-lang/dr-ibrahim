import { useEffect, useState } from 'react';
import { instagramProfile } from '../data/reels';

export interface IgStats {
  followers: string;
  following: string;
  updatedAt?: string;
}

const RAW_STATS_URL =
  'https://raw.githubusercontent.com/momendalalha-lang/dr-ibrahim/main/public/ig-stats.json';

/**
 * Returns the latest Instagram follower/following counts.
 * Starts with the build-time value from `reels.ts`, then checks both local
 * `ig-stats.json` and the GitHub repo's `public/ig-stats.json` (cache-busted)
 * so any update committed by the scheduled runner appears immediately.
 */
export function useInstagramStats(): IgStats {
  const [stats, setStats] = useState<IgStats>({
    followers: instagramProfile.followers,
    following: instagramProfile.following,
  });

  useEffect(() => {
    let cancelled = false;
    const bust = `?t=${Date.now()}`;

    async function load() {
      for (const url of [`ig-stats.json${bust}`, `${RAW_STATS_URL}${bust}`]) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) continue;
          const data = await res.json();
          if (!cancelled && data?.followers) {
            setStats({
              followers: String(data.followers),
              following: String(data.following ?? instagramProfile.following),
              updatedAt: data.updatedAt,
            });
            break;
          }
        } catch {
          /* ignore and try next source */
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}
