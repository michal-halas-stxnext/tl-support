import { useEffect, useState } from 'preact/hooks';

export type Size = { w: number; h: number };
export type Viewport = { w: number; h: number };

export const SIZE_KEY = 'tl-support:size';
export const MIN_SIZE: Size = { w: 480, h: 320 };
const MARGIN = 16; // jak w fullscreen (inset)
const BOTTOM_OFFSET = 76; // panel anchored bottom-right above the TL button

/** Max = fullscreen area; height reduced by the bottom anchor offset so the panel does not leave the screen. */
export const maxSize = (vp: Viewport): Size => ({
  w: Math.max(MIN_SIZE.w, vp.w - 2 * MARGIN),
  h: Math.max(MIN_SIZE.h, vp.h - BOTTOM_OFFSET - MARGIN),
});

export const clampSize = (s: Size, vp: Viewport): Size => {
  const max = maxSize(vp);
  return {
    w: Math.round(Math.min(max.w, Math.max(MIN_SIZE.w, s.w))),
    h: Math.round(Math.min(max.h, Math.max(MIN_SIZE.h, s.h))),
  };
};

export function loadSize(): Size | undefined {
  try {
    const v = JSON.parse(localStorage.getItem(SIZE_KEY) ?? 'null');
    if (v && Number.isFinite(v.w) && Number.isFinite(v.h)) return { w: v.w, h: v.h };
  } catch {
    /* no access / bad JSON */
  }
  return undefined;
}

export function saveSize(s: Size | undefined) {
  try {
    if (s) localStorage.setItem(SIZE_KEY, JSON.stringify(s));
    else localStorage.removeItem(SIZE_KEY);
  } catch {
    /* no storage access — ignore */
  }
}

/** Current viewport; refreshes on window resize. */
export function useViewport(): Viewport {
  const read = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [vp, setVp] = useState(read);
  useEffect(() => {
    const on = () => setVp(read());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return vp;
}
