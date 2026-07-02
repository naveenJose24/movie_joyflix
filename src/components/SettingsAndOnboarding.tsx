import { useState } from 'react';
import { Check, FilmStrip, GearSix, Play, X } from '@phosphor-icons/react';
import { PROVIDERS, REGIONS } from '../lib/constants';
import { useSettingsStore } from '../store/settingsStore';
import { LanguageGrid } from './LanguageGrid';

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
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/80 opacity-100 pointer-events-auto"
      onClick={(e) => e.target === e.currentTarget && closeSettings()}
    >
      <div className="bg-[#181818] rounded-2xl w-full max-w-[480px] border border-white/8 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/7 shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GearSix size={20} /> Settings
          </h2>
          <button type="button" onClick={closeSettings} className="text-white bg-black/75 border border-white/15 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex flex-col gap-6 flex-1">
          <div>
            <label className="text-sm font-semibold text-white block">Languages</label>
            <p className="text-xs text-neutral-400 mb-2">Select one or more. First selected = primary language for titles &amp; descriptions. Changes apply instantly.</p>
            <LanguageGrid selected={langs} onChange={setLangs} compact />
          </div>
          <div>
            <label htmlFor="settingsRegion" className="text-sm font-semibold text-white block">Content Region</label>
            <p className="text-xs text-neutral-400 mb-2">Region for Now Playing and Upcoming lists</p>
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
            <label htmlFor="settingsProvider" className="text-sm font-semibold text-white block">Default Streaming Server</label>
            <p className="text-xs text-neutral-400 mb-2">Preferred server when playing content</p>
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
        <div className="px-6 py-5 border-t border-white/7 flex justify-end shrink-0">
          <button
            type="button"
            onClick={closeSettings}
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-7 py-2.5 rounded-md hover:bg-white/85 transition-all"
          >
            <Check weight="fill" size={18} /> Done
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
    <div className={`fixed inset-0 z-[2000] bg-black/97 flex items-center justify-center p-4 ${fadeOut ? 'animate-fade-out' : 'animate-fade-in'}`}>
      <div className="bg-[#181818] rounded-[20px] p-10 max-md:p-6 max-w-[720px] w-full text-center border border-white/8 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="text-[2.4rem] font-black text-joyflix-red tracking-tight mb-4 flex items-center justify-center gap-1.5">
          <FilmStrip weight="fill" size={32} /> Joy<span className="text-white">Flix</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Welcome! Choose your languages</h2>
        <p className="text-neutral-400 text-sm mb-6">Select one or more — first pick sets the primary language for titles</p>
        <LanguageGrid selected={pickedLangs} onChange={setPickedLangs} />
        <button
          type="button"
          onClick={handleStart}
          className="inline-flex items-center gap-2 bg-white text-black font-bold px-7 py-2.5 rounded-md hover:bg-white/85 transition-all min-w-40 mx-auto mt-2"
        >
          <Play weight="fill" size={18} /> Get Started
        </button>
      </div>
    </div>
  );
}
