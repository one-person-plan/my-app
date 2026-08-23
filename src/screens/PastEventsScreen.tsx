import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '@/store/AppContext';
import { isFuture } from '@/lib/date';
import { EventCard } from '@/components/EventCard';

export function PastEventsScreen({
  onBack,
  onOpenEvent,
}: {
  onBack: () => void;
  onOpenEvent: (id: string) => void;
}) {
  const { events } = useApp();

  const pastEvents = useMemo(
    () =>
      events
        .filter((e) => !isFuture(e.date))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [events]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur-xl border-b border-border/70">
        <div className="px-3 h-14 flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink active:scale-90 transition"
            aria-label="戻る"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm text-ink">
              記録したイベント
            </h1>
            <p className="text-[11px] text-faint font-medium">
              {pastEvents.length}件
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center">
            <CalendarDays size={16} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-4 pt-4 space-y-2.5">
          {pastEvents.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border-strong p-8 text-center">
              <CalendarDays
                size={32}
                className="text-faint mx-auto mb-2"
              />
              <p className="text-sm text-muted">
                記録したイベントがありません
              </p>
            </div>
          ) : (
            pastEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onOpenEvent(event.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}