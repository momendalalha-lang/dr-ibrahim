import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** extra delay before this block animates, ms */
  delay?: number;
  /** children carry .stagger-children and cascade in instead of the block moving */
  stagger?: boolean;
}

/**
 * Scroll-into-view reveal. Adds `.is-in` once when the element enters the
 * viewport, then disconnects — pure CSS transition afterwards.
 */
export default function Reveal({ children, className = '', delay = 0, stagger = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${stagger ? ' stagger' : ''}${inView ? ' is-in' : ''} ${className}`}
      style={{ '--rd': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
