import { create } from 'zustand';
import {
  DEFAULT_PROVIDER,
  LANGS_STORE,
  LANG_STORE,
  LANGUAGES,
  PROVIDER_STORE,
  REGION_STORE,
  WELCOMED_KEY,
} from '../lib/constants';

function readLangs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LANGS_STORE) || '["en-US"]');
  } catch {
    return ['en-US'];
  }
}

function persistLangs(langs: string[]) {
  localStorage.setItem(LANGS_STORE, JSON.stringify(langs));
  localStorage.setItem(LANG_STORE, langs[0]);
}

interface SettingsState {
  langs: string[];
  region: string;
  providerId: string;
  welcomed: boolean;
  settingsOpen: boolean;
  contentRevision: number;
  primaryLang: string;
  setLangs: (langs: string[]) => void;
  setRegion: (region: string) => void;
  setProviderId: (providerId: string) => void;
  openSettings: () => void;
  closeSettings: () => void;
  completeOnboarding: (langs: string[]) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initialLangs = readLangs();

  return {
    langs: initialLangs,
    region: localStorage.getItem(REGION_STORE) || 'US',
    providerId: localStorage.getItem(PROVIDER_STORE) || DEFAULT_PROVIDER,
    welcomed: !!localStorage.getItem(WELCOMED_KEY),
    settingsOpen: false,
    contentRevision: 0,
    primaryLang: initialLangs[0],

    setLangs: (langs) => {
      const next = langs.length ? langs : ['en-US'];
      persistLangs(next);
      set({
        langs: next,
        primaryLang: next[0],
        contentRevision: get().contentRevision + 1,
      });
    },

    setRegion: (region) => {
      localStorage.setItem(REGION_STORE, region);
      set({ region, contentRevision: get().contentRevision + 1 });
    },

    setProviderId: (providerId) => {
      localStorage.setItem(PROVIDER_STORE, providerId);
      set({ providerId });
    },

    openSettings: () => set({ settingsOpen: true }),
    closeSettings: () => set({ settingsOpen: false }),

    completeOnboarding: (langs) => {
      const next = langs.length ? langs : ['en-US'];
      const prim = LANGUAGES.find((l) => l.code === next[0]);
      const region = prim?.region || 'US';
      persistLangs(next);
      localStorage.setItem(REGION_STORE, region);
      localStorage.setItem(WELCOMED_KEY, '1');
      set({
        langs: next,
        primaryLang: next[0],
        region,
        welcomed: true,
        contentRevision: get().contentRevision + 1,
      });
    },
  };
});

export function getSettingsSnapshot() {
  const { langs, primaryLang, region, providerId } = useSettingsStore.getState();
  return { langs, primaryLang, region, providerId };
}
