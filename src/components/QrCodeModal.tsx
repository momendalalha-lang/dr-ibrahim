import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, X } from 'lucide-react';
import { useLang } from '../i18n';

interface QrCodeModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
}

export default function QrCodeModal({ open, onClose, url }: QrCodeModalProps) {
  const { t } = useLang();
  const [dataUrl, setDataUrl] = useState<string>('');
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(url, {
      width: 320,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then(setDataUrl);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, url, onClose]);

  if (!open) return null;

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'dr-ibrahim-medical-hub-qr.png';
    a.click();
  };

  return (
    <div
      className="anim-overlay fixed inset-0 z-[80] grid place-items-center bg-ink/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('hero.qrTitle')}
    >
      <div
        className="anim-modal relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute end-4 top-4 rounded-lg p-1.5 text-ink-4 transition-colors hover:bg-muted hover:text-ink"
          aria-label={t('hero.close')}
        >
          <X className="h-4 w-4" />
        </button>

        <p className="eyebrow text-royal-700">QR</p>
        <h3 className="mt-1 font-display text-lg font-bold text-ink">{t('hero.qrTitle')}</h3>
        <p className="mt-1 text-sm text-ink-3">{t('hero.qrHint')}</p>

        <div className="mx-auto mt-4 w-fit rounded-xl border-2 border-ink/10 bg-white p-3 shadow-inner">
          {dataUrl ? (
            <img src={dataUrl} alt={t('hero.qrTitle')} className="h-44 w-44" />
          ) : (
            <div className="h-44 w-44 animate-pulse rounded bg-muted" />
          )}
        </div>

        <p className="mt-3 truncate font-mono text-[11px] text-ink-4" dir="ltr">
          {url}
        </p>

        <button
          onClick={download}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-2"
        >
          <Download className="h-4 w-4" />
          {t('hero.downloadQR')}
        </button>
      </div>
    </div>
  );
}
