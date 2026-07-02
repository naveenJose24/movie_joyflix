import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect, type ReactNode } from 'react';
import { setLenisInstance } from '../lib/scroll';
import { useSettingsStore } from '../store/settingsStore';
import { useApp } from '../context/AppContext';
import 'lenis/dist/lenis.css';

function LenisController({ locked }: { locked: boolean }) {
  const lenis = useLenis();

  useEffect(() => {
    setLenisInstance(lenis ?? null);
    return () => setLenisInstance(null);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, [lenis, locked]);

  return null;
}

export function LenisScroll({ children }: { children: ReactNode }) {
  const { modalOpen, playerOpen } = useApp();
  const settingsOpen = useSettingsStore((s) => s.settingsOpen);
  const welcomed = useSettingsStore((s) => s.welcomed);
  const locked = modalOpen || playerOpen || settingsOpen || !welcomed;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.15,
        autoRaf: true,
      }}
    >
      <LenisController locked={locked} />
      {children}
    </ReactLenis>
  );
}
