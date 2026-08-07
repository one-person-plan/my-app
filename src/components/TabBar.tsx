import { List, Calendar, Timer } from 'lucide-react';
import type { ComponentType } from 'react';

export type TabKey = 'list' | 'calendar' | 'timer';

const tabs: { key: TabKey; label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }> }[] = [
  { key: 'list', label: '一覧', Icon: List },
  { key: 'calendar', label: 'しがむ', Icon: Calendar },
  { key: 'timer', label: 'こたえる', Icon: Timer },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (k: TabKey) => void }) {
  return (
    <nav className="sticky bottom-0 z-30 bg-surface/90 backdrop-blur-xl border-t border-border">
      <div className="grid grid-cols-3 h-16 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-col items-center justify-center gap-1 relative active:scale-90 transition"
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-b-full bg-primary" />
              )}
              <Icon
                size={22}
                strokeWidth={isActive ? 2.6 : 2}
                className={isActive ? 'text-primary' : 'text-faint'}
              />
              <span className={`text-[11px] font-bold tracking-wide ${isActive ? 'text-primary' : 'text-faint'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
