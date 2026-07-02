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
          ? 'grid-cols-[repeat(auto-fill,minmax(90px,1fr))] max-h-[280px] overflow-y-auto border border-white/7 rounded-lg p-2 bg-black/20'
          : 'grid-cols-[repeat(auto-fill,minmax(100px,1fr))] max-sm:grid-cols-3 mb-7'
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
            className={`relative flex flex-col items-center gap-1 rounded-lg border-2 transition-all cursor-pointer font-[inherit] ${
              compact ? 'p-2' : 'p-3'
            } ${
              sel
                ? 'border-joyflix-red bg-joyflix-red/18'
                : 'border-transparent bg-neutral-800 hover:border-joyflix-red hover:bg-joyflix-red/10'
            }`}
          >
            {isPrimary && <span className="absolute top-1 left-1.5 text-[0.65rem] text-[#f5c518] font-bold">★</span>}
            <span className={compact ? 'text-xl' : 'text-2xl'}>{l.flag}</span>
            <span className={`font-medium text-center text-neutral-200 ${compact ? 'text-[0.7rem]' : 'text-xs'}`}>{l.name}</span>
            {sel && <span className="absolute top-1 right-1.5 text-[0.7rem] text-joyflix-red font-bold">✓</span>}
          </button>
        );
      })}
    </div>
  );
}
