/**
 * Google Analytics 4 (gtag.js).
 *
 * Paste the Measurement ID (G-XXXXXXXXXX) from GA4 → Admin → Data Streams
 * into GA_ID below. Until then every call is a safe no-op, so the site
 * works identically with or without analytics.
 */
const GA_ID = 'G-XXXXXXXXXX';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const enabled = !GA_ID.startsWith('G-XXX');

export function initAnalytics() {
  if (!enabled || typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  if (enabled && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
}
