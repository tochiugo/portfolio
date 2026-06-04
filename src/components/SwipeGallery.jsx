import React, { useState, useRef, useEffect, useCallback } from 'react';

// Reusable swipeable gallery.
// - swipe left/right (touch + mouse drag), arrow keys, on-screen arrows, dot indicators
// - click to open a fullscreen lightbox (also swipeable)
// - phone | wide | square framing presets
// Images use native lazy-loading + WebP, so the (image-free) homepage loads instantly
// and gallery images only fetch as their section nears the viewport on real browsers.
export function SwipeGallery({ images = [], captions = [], frame = 'wide', accent = '#00E87A', label = '' }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const drag = useRef({ active: false, startX: 0, dx: 0 });
  const [dx, setDx] = useState(0);
  const trackRef = useRef(null);

  const count = images.length;
  const clamp = useCallback((i) => Math.max(0, Math.min(count - 1, i)), [count]);
  const go = useCallback((i) => setIndex((cur) => clamp(typeof i === 'function' ? i(cur) : i)), [clamp]);
  const next = useCallback(() => go((i) => i + 1), [go]);
  const prev = useCallback(() => go((i) => i - 1), [go]);

  const onDown = (x) => { drag.current = { active: true, startX: x, dx: 0 }; };
  const onMove = (x) => {
    if (!drag.current.active) return;
    drag.current.dx = x - drag.current.startX;
    setDx(drag.current.dx);
  };
  const onUp = () => {
    if (!drag.current.active) return;
    const moved = drag.current.dx;
    drag.current.active = false;
    setDx(0);
    const threshold = 60;
    if (moved <= -threshold) next();
    else if (moved >= threshold) prev();
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, next, prev]);

  if (!count) return null;

  const frameClass =
    frame === 'phone' ? 'aspect-[9/19.5] max-w-[300px] mx-auto'
    : frame === 'square' ? 'aspect-square'
    : 'aspect-[16/10]';

  const Track = ({ inLightbox }) => (
    <div
      ref={inLightbox ? null : trackRef}
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 select-none ${inLightbox ? 'w-full h-full flex items-center justify-center' : frameClass}`}
      style={{ touchAction: 'pan-y' }}
      onMouseDown={(e) => onDown(e.clientX)}
      onMouseMove={(e) => onMove(e.clientX)}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={(e) => onDown(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onUp}
    >
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(calc(${-index * 100}% + ${dx}px))`,
          transition: drag.current.active ? 'none' : 'transform 360ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {images.map((src, i) => (
          <div key={src} className="min-w-full h-full flex items-center justify-center p-1">
            <img
              src={src}
              alt={captions[i] || `${label} screenshot ${i + 1}`}
              loading="lazy"
              decoding="async"
              draggable={false}
              onClick={() => !inLightbox && Math.abs(drag.current.dx) < 6 && setLightbox(true)}
              className={`max-h-full max-w-full object-contain ${inLightbox ? '' : 'cursor-zoom-in'} ${frame === 'phone' ? 'rounded-[1.6rem]' : 'rounded-lg'}`}
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            disabled={index === 0}
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 backdrop-blur border border-white/15 text-white grid place-items-center hover:bg-black/80 disabled:opacity-25 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            disabled={index === count - 1}
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 backdrop-blur border border-white/15 text-white grid place-items-center hover:bg-black/80 disabled:opacity-25 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      {count > 1 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 font-mono text-[10px] text-zinc-300">
          {index + 1} / {count}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <Track inLightbox={false} />

      {captions[index] && (
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed min-h-[2.5rem]">
          <span className="font-mono text-[11px] mr-2" style={{ color: accent }}>{String(index + 1).padStart(2, '0')}</span>
          {captions[index]}
        </p>
      )}

      {count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-1.5 rounded-full transition-all"
              style={{ width: i === index ? 22 : 6, background: i === index ? accent : 'rgba(255,255,255,0.22)' }}
            />
          ))}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/92 backdrop-blur-sm flex flex-col" onClick={() => setLightbox(false)}>
          <div className="flex items-center justify-between px-5 py-4 text-zinc-400">
            <span className="font-mono text-xs">{label} · {index + 1}/{count}</span>
            <button aria-label="Close" className="p-2 hover:text-white" onClick={() => setLightbox(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 min-h-0 px-4 pb-4" onClick={(e) => e.stopPropagation()}>
            <Track inLightbox={true} />
          </div>
          {captions[index] && (
            <p className="px-6 pb-6 text-center text-sm text-zinc-300 max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
              {captions[index]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SwipeGallery;
