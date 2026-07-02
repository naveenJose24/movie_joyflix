import { useCallback, useEffect, useRef, useState } from 'react';

export function useMediaRowScroll() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    updateEdges();
    el.addEventListener('scroll', updateEdges, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', updateEdges);
      ro.disconnect();
    };
  }, [updateEdges]);

  // Desktop drag only — touch uses native overflow scroll; no wheel hijacking.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let drag: {
      startX: number;
      scrollLeft: number;
      pointerId: number;
      active: boolean;
    } | null = null;
    let suppressClick = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (e.button !== 0) return;
      drag = {
        startX: e.clientX,
        scrollLeft: el.scrollLeft,
        pointerId: e.pointerId,
        active: false,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startX;
      if (!drag.active) {
        if (Math.abs(dx) < 8) return;
        drag.active = true;
        el.setPointerCapture(drag.pointerId);
        el.classList.add('is-dragging');
      }
      el.scrollLeft = drag.scrollLeft - dx;
    };

    const endDrag = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      if (drag.active) {
        suppressClick = true;
        el.releasePointerCapture(e.pointerId);
        el.classList.remove('is-dragging');
        window.setTimeout(() => { suppressClick = false; }, 0);
      }
      drag = null;
    };

    const onClickCapture = (e: MouseEvent) => {
      if (!suppressClick) return;
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('click', onClickCapture, true);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  const scrollByPage = useCallback((direction: 'prev' | 'next') => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.78, 280);
    el.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' });
  }, []);

  return { scrollerRef, canPrev, canNext, scrollByPage };
}
