import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastState {
  id: number;
  message: string;
}

/** Global toast host — mount once near the app root. */
export default function ToastHost() {
  const [items, setItems] = useState<ToastState[]>([]);

  useEffect(() => {
    let id = 0;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string; durationMs?: number }>).detail;
      const next = { id: ++id, message: detail.message };
      setItems((prev) => [...prev.slice(-2), next]);
      const duration = detail.durationMs ?? 2400;
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== next.id));
      }, duration);
    };
    window.addEventListener('mus:toast', handler);
    return () => window.removeEventListener('mus:toast', handler);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex flex-col items-center gap-2 px-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="anim-toast pointer-events-auto flex items-center gap-2.5 rounded-full border border-mint-200 bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-xl"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 text-mint-400" />
          {item.message}
        </div>
      ))}
    </div>
  );
}
