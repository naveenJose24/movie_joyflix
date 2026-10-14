import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, ShieldOff, WifiOff } from 'lucide-react';
import { useOnline } from '../hooks/useOnline';
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
  const blockPopups = useSettingsStore((s) => !s.popupAllowed.includes(s.providerId));
  const togglePopupBlock = useSettingsStore((s) => s.togglePopupBlock);

  const [iframeSrc, setIframeSrc] = useState('');
  const online = useOnline();

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
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-4 px-6 max-md:px-3 pt-[max(1rem,env(safe-area-inset-top))] pb-4 max-md:gap-2 bg-linear-to-b from-black/85 to-transparent">
        <button
          type="button"
          onClick={historyBack}
          aria-label="Back"
          title="Back"
          className="flex items-center justify-center w-10 h-10 -ml-2 shrink-0 rounded-full text-white hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="font-display text-ink font-bold max-md:text-sm flex-1 min-w-0 truncate">{displayTitle}</span>
        <button
          type="button"
          onClick={() => togglePopupBlock(providerId)}
          aria-pressed={blockPopups}
          title={blockPopups
            ? 'Pop-up blocking on. If this server won’t play, tap to turn it off for this server.'
            : 'Pop-up blocking off for this server. Tap to turn it back on.'}
          className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-full border text-xs font-semibold backdrop-blur-md transition-colors ${
            blockPopups
              ? 'border-brand/50 bg-brand/15 text-brand'
              : 'border-white/20 bg-velvet/70 text-neutral-300'
          }`}
        >
          {blockPopups ? <ShieldCheck size={15} /> : <ShieldOff size={15} />}
          <span className="max-sm:hidden">{blockPopups ? 'Pop-ups blocked' : 'Pop-ups allowed'}</span>
        </button>
        <select
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          title="Switch server"
          className="shrink-0 bg-velvet/70 backdrop-blur-md border border-white/20 text-ink text-xs font-semibold h-9 px-3 rounded-full cursor-pointer max-md:max-w-[130px]"
        >
          {PROVIDERS.map((p) => (
            <option key={p.id} value={p.id} className="bg-surface">{p.name}</option>
          ))}
        </select>
      </div>
      {!online && (
        <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 px-8 text-center bg-velvet">
          <WifiOff size={40} strokeWidth={1.5} className="text-brand" />
          <p className="font-display text-xl font-bold text-ink">Playing needs a connection</p>
          <p className="text-sm text-neutral-400 max-w-[36ch]">Connect to Wi‑Fi or mobile data and this will start automatically.</p>
        </div>
      )}
      <iframe
        // Remount when the sandbox changes; browsers ignore sandbox edits on a loaded frame
        key={`${providerId}-${blockPopups ? 'sandboxed' : 'open'}`}
        // Without allow-popups / allow-top-navigation the player can't open ad tabs or redirect the app
        sandbox={blockPopups ? 'allow-scripts allow-same-origin allow-forms allow-presentation' : undefined}
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
