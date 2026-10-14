import { useState } from 'react';
import { X } from 'lucide-react';
import { PROVIDERS, REGIONS } from '../lib/constants';
import { useSettingsStore } from '../store/settingsStore';
import { LanguageGrid } from './LanguageGrid';
import { Wordmark } from './Wordmark';

export function SettingsModal() {
  const settingsOpen = useSettingsStore((s) => s.settingsOpen);
  const langs = useSettingsStore((s) => s.langs);
  const region = useSettingsStore((s) => s.region);
  const providerId = useSettingsStore((s) => s.providerId);
  const setLangs = useSettingsStore((s) => s.setLangs);
  const setRegion = useSettingsStore((s) => s.setRegion);
  const setProviderId = useSettingsStore((s) => s.setProviderId);
  const closeSettings = useSettingsStore((s) => s.closeSettings);

  if (!settingsOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      data-lenis-prevent
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center sm:p-4 bg-[rgba(14,9,19,0.8)] backdrop-blur-sm opacity-100 pointer-events-auto animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && closeSettings()}
    >
      <div className="bg-surface rounded-t-3xl sm:rounded-3xl w-full sm:max-w-[540px] ring-1 ring-white/8 max-h-[92dvh] sm:max-h-[min(90dvh,760px)] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-white/8 shrink-0">
          <h2 className="font-display text-xl font-bold text-ink">Settings</h2>
          <button type="button" onClick={closeSettings} aria-label="Close settings" className="text-ink bg-white/6 hover:bg-white/12 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain flex flex-col gap-6 flex-1 min-h-0">
          <div>
            <label className="text-sm font-semibold text-ink block">Languages</label>
            <p className="text-[0.8rem] text-neutral-400 mb-3">Titles and descriptions use the starred language. Each language also gets its own rows on Home.</p>
            <LanguageGrid selected={langs} onChange={setLangs} compact />
          </div>
          <div>
            <label htmlFor="settingsRegion" className="text-sm font-semibold text-ink block">Region</label>
            <p className="text-[0.8rem] text-neutral-400 mb-2">Used for the Now playing and Upcoming rows</p>
            <select
              id="settingsRegion"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="settings-select w-full"
            >
              {REGIONS.map((r) => (
                <option key={r.code} value={r.code}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="settingsProvider" className="text-sm font-semibold text-ink block">Default server</label>
            <p className="text-[0.8rem] text-neutral-400 mb-2">Tried first when you press Play. You can switch servers in the player.</p>
            <select
              id="settingsProvider"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="settings-select w-full"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:py-5 border-t border-white/8 flex justify-end shrink-0">
          <button
            type="button"
            onClick={closeSettings}
            className="inline-flex items-center justify-center bg-brand text-brand-ink font-semibold h-12 px-8 rounded-full hover:brightness-110 transition-[filter] max-sm:w-full"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function Onboarding() {
  const welcomed = useSettingsStore((s) => s.welcomed);
  const langs = useSettingsStore((s) => s.langs);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [pickedLangs, setPickedLangs] = useState<string[]>(langs);
  const [fadeOut, setFadeOut] = useState(false);

  if (welcomed) return null;

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(() => completeOnboarding(pickedLangs), 400);
  };

  return (
    <div
      data-lenis-prevent
      className={`fixed inset-0 z-[2000] bg-velvet flex items-center justify-center p-0 sm:p-4 ${fadeOut ? 'animate-fade-out' : 'animate-fade-in'}`}
    >
      <div className="bg-surface sm:rounded-3xl max-w-[760px] w-full h-dvh sm:h-auto sm:max-h-[min(90dvh,820px)] [@media(max-height:520px)]:h-dvh [@media(max-height:520px)]:max-h-none [@media(max-height:520px)]:rounded-none flex flex-col text-center sm:ring-1 ring-white/8 overflow-hidden animate-scale-in">
        <div className="shrink-0 px-5 sm:px-10 pt-[max(1.5rem,env(safe-area-inset-top))] sm:pt-10 pb-4 sm:pb-6 [@media(max-height:520px)]:py-3">
          <Wordmark className="block text-[2.4rem] sm:text-[3rem] mb-4 sm:mb-5 [@media(max-height:520px)]:hidden" />
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.02em] text-ink mb-1.5">What do you like to watch in?</h2>
          <p className="text-neutral-400 text-sm max-w-[46ch] mx-auto">Pick one or more. Your first pick is used for titles and descriptions.</p>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-10 pb-2">
          <LanguageGrid selected={pickedLangs} onChange={setPickedLangs} />
        </div>
        <div className="shrink-0 px-5 sm:px-10 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-10 [@media(max-height:520px)]:py-3 border-t border-white/8 sm:border-0 bg-surface">
          <button
            type="button"
            onClick={handleStart}
            className="inline-flex items-center justify-center bg-brand text-brand-ink font-semibold h-12 px-10 rounded-full hover:brightness-110 transition-[filter] w-full sm:w-auto sm:min-w-48"
          >
            Start browsing
          </button>
        </div>
      </div>
    </div>
  );
}
