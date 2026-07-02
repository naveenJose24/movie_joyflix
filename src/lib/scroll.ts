import type Lenis from 'lenis';

let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function scrollToTop(options?: { immediate?: boolean }) {
  if (lenisInstance) {
    lenisInstance.scrollTo(0, {
      duration: options?.immediate ? 0 : 1.1,
      force: true,
    });
    return;
  }
  window.scrollTo({ top: 0, behavior: options?.immediate ? 'auto' : 'smooth' });
}

export function getScrollY(): number {
  return lenisInstance?.scroll ?? window.scrollY;
}
