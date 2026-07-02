import { useEffect, useState } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';
import { PROVIDERS } from '../lib/constants';
import { useApp } from '../context/AppContext';
import { useSettingsStore } from '../store/settingsStore';
import { getTitle } from '../lib/utils';

export function PlayerOverlay() {
  const {
    playerOpen, playerItem, playerIsTV, selectedSeason, selectedEpisode,
    getPlayerUrl, historyBack,
  } = useApp();
  const providerId = useSettingsStore((s) => s.providerId);
  const setProviderId = useSettingsStore((s) => s.setProviderId);

  const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    if (playerOpen && playerItem) {
      setIframeSrc(getPlayerUrl());
    } else {
      const t = setTimeout(() => setIframeSrc(''), 400);
      return () => clearTimeout(t);
    }
  }, [playerOpen, playerItem, getPlayerUrl, providerId, selectedSeason, selectedEpisode]);

  if (!playerItem) return null;

  const title = getTitle(playerItem);
  const displayTitle = playerIsTV
    ? `${title} — S${selectedSeason} E${selectedEpisode}`
    : title;

  return (
    <div
      className={`fixed inset-0 z-[2000] bg-black flex flex-col transition-opacity duration-400 ${
        playerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-4 px-6 max-md:px-4 py-4 bg-gradient-to-b from-black/90 to-transparent">
        <button
          type="button"
          onClick={historyBack}
          className="flex items-center gap-2 text-white text-sm font-semibold hover:opacity-70 transition-opacity bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <span className="text-white font-bold flex-1 min-w-0 truncate">{displayTitle}</span>
        <select
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          title="Switch server"
          className="bg-white/8 border border-white/20 text-white text-xs font-semibold px-2.5 py-1.5 rounded-md cursor-pointer max-md:max-w-[110px]"
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id} className="bg-[#181818]">{p.name}</option>
          ))}
        </select>
      </div>
      <iframe
        src={iframeSrc}
        title={displayTitle}
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        referrerPolicy="no-referrer"
        className="w-full h-full border-0 bg-black"
      />
    </div>
  );
}
