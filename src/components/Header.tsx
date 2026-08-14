import { Sparkles, Settings } from 'lucide-react';

export function Header({
  onOpenSettings,
}: {
  onOpenSettings: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur-xl border-b border-border/70">
      <div className="px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md shadow-primary/25">
            <Sparkles
              size={18}
              className="text-white"
              strokeWidth={2.5}
            />
          </div>

          <div className="leading-none">
            <h1 className="font-display font-extrabold text-xl tracking-tight text-ink">
              Shigamoo<span className="text-primary">!</span>
            </h1>

            <p className="text-[9px] text-muted font-medium tracking-[0.18em] uppercase mt-0.5">
              大喜利しがみノート
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-muted hover:text-primary active:scale-90 transition"
          aria-label="設定"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
}
