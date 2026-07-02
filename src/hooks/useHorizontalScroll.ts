import { useEffect } from 'react';

interface TouchState {
  startX: number;
  startY: number;
  scrollLeft: number;
  lock: 'x' | 'y' | null;
  lastX: number;
  lastTime: number;
  velocity: number;
}

const horizontalTouchState = new WeakMap<HTMLElement, TouchState>();

/** Touch momentum + wheel redirect for the genre bar only. Rows use native smooth scroll. */
export function useGlobalHorizontalScroll() {
  useEffect(() => {
    const selector = '.genre-bar-scroll';

    const onTouchStart = (e: TouchEvent) => {
      const track = (e.target as Element).closest(selector) as HTMLElement | null;
      if (!track || e.touches.length !== 1) return;
      const el = track as HTMLElement & { _momentumId?: number };
      if (el._momentumId) {
        cancelAnimationFrame(el._momentumId);
        el._momentumId = undefined;
      }
      horizontalTouchState.set(track, {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        scrollLeft: track.scrollLeft,
        lock: null,
        lastX: e.touches[0].clientX,
        lastTime: Date.now(),
        velocity: 0,
      });
    };

    const onTouchMove = (e: TouchEvent) => {
      const track = (e.target as Element).closest(selector) as HTMLElement | null;
      if (!track || e.touches.length !== 1) return;
      const state = horizontalTouchState.get(track);
      if (!state) return;
      const dx = e.touches[0].clientX - state.startX;
      const dy = e.touches[0].clientY - state.startY;
      if (state.lock === null) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        state.lock = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      if (state.lock !== 'x' || track.scrollWidth <= track.clientWidth) return;
      e.preventDefault();
      const now = Date.now();
      const dt = now - state.lastTime;
      if (dt > 0) state.velocity = (state.lastX - e.touches[0].clientX) / dt;
      state.lastX = e.touches[0].clientX;
      state.lastTime = now;
      track.scrollLeft = state.scrollLeft - dx;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const track = (e.target as Element).closest(selector) as HTMLElement | null;
      if (!track) return;
      const state = horizontalTouchState.get(track);
      if (state?.lock === 'x' && e.type === 'touchend') {
        let v = state.velocity * 16;
        const el = track as HTMLElement & { _momentumId?: number };
        const step = () => {
          if (Math.abs(v) < 0.5) {
            el._momentumId = undefined;
            return;
          }
          track.scrollLeft += v;
          v *= 0.92;
          el._momentumId = requestAnimationFrame(step);
        };
        el._momentumId = requestAnimationFrame(step);
      }
      horizontalTouchState.delete(track);
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);
}
