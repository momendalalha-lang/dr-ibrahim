import { useEffect, useRef } from 'react';

interface PixelCanvasProps {
  src: string;
  /** internal pixel grid resolution */
  resolution?: number;
  className?: string;
}

/**
 * Draws a photo onto a tiny offscreen canvas, then paints it onto a large
 * canvas with smoothing disabled — producing a crisp 16-bit style pixelation
 * without any external image processing.
 */
export default function PixelCanvas({ src, resolution = 112, className }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // square center-crop source region
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;

      const small = document.createElement('canvas');
      small.width = resolution;
      small.height = resolution;
      const sctx = small.getContext('2d');
      if (!sctx) return;
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(img, sx, sy, side, side, 0, 0, resolution, resolution);

      const size = 512;
      canvas.width = size;
      canvas.height = size;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small, 0, 0, size, size);
    };
    img.src = src;
  }, [src, resolution]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
