import { Check, Star } from 'lucide-react';
import { LANGUAGES } from '../lib/constants';

interface LanguageGridProps {
  selected: string[];
  onChange: (codes: string[]) => void;
  compact?: boolean;
}

export function LanguageGrid({ selected, onChange, compact = false }: LanguageGridProps) {
  const toggle = (code: string) => {
    const idx = selected.indexOf(code);
    if (idx !== -1) {
      if (selected.length === 1) return;
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div
      className={`grid gap-2 text-left ${
        compact
          ? 'grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(96px,1fr))] max-h-[min(280px,40dvh)] overflow-y-auto overscroll-contain border border-white/8 rounded-2xl p-2 bg-velvet/50'
          : 'grid-cols-3 min-[480px]:grid-cols-4 sm:grid-cols-[repeat(auto-fill,minmax(104px,1fr))]'
      }`}
    >
      {LANGUAGES.map((l) => {
        const idx = selected.indexOf(l.code);
        const sel = idx !== -1;
        const isPrimary = idx === 0;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => toggle(l.code)}
            aria-pressed={sel}
            className={`relative flex min-w-0 min-h-[68px] flex-col items-center justify-center gap-1 rounded-xl border transition-colors cursor-pointer font-[inherit] select-none [-webkit-tap-highlight-color:transparent] ${
              compact ? 'p-2' : 'p-2.5 sm:p-3'
            } ${
              sel
                ? 'border-brand bg-brand/12'
                : 'border-white/6 bg-surface-2/60 hover:border-brand/50'
            }`}
          >
            {isPrimary && (
              <span className="absolute top-1.5 left-1.5 text-brand" title="Primary language">
                <Star size={11} fill="currentColor" strokeWidth={0} />
              </span>
            )}
            <span className={compact ? 'text-xl' : 'text-2xl'}>{l.flag}</span>
            <span className={`w-full truncate font-medium text-center text-neutral-200 ${compact ? 'text-[0.7rem]' : 'text-xs'}`}>{l.name}</span>
            {sel && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-brand-ink">
                <Check size={10} strokeWidth={3.5} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
