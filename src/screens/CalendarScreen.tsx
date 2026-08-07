import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Dot, CalendarDays } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { fmtDate, fmtMonthYear, isFuture, isToday, todayISO } from '@/lib/date';
import { BottomSheet } from '@/components/ui/Sheet';
import { TextField, PrimaryButton, GhostButton } from '@/components/ui/Field';

const WEEK = ['日', '月', '火', '水', '木', '金', '土'];

function CalendarGrid({
  year,
  month,
  selected,
  eventDates,
  onPick,
}: {
  year: number;
  month: number;
  selected: string;
  eventDates: Set<string>;
  onPick: (iso: string) => void;
}) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayISO();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 mb-1.5">
        {WEEK.map((w, i) => (
          <div
            key={w}
            className={`text-center text-[11px] font-bold py-1 ${i === 0 ? 'text-error' : i === 6 ? 'text-accent' : 'text-faint'}`}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const isSel = iso === selected;
          const isTodayCell = iso === today;
          const hasEvent = eventDates.has(iso);
          const dow = i % 7;
          return (
            <button
              key={iso}
              onClick={() => onPick(iso)}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition active:scale-90 ${
                isSel
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : isTodayCell
                  ? 'bg-primary-soft text-primary'
                  : 'hover:bg-surface-2'
              }`}
            >
              <span
                className={`text-sm font-bold font-display ${
                  isSel ? 'text-white' : dow === 0 && !isTodayCell ? 'text-error' : dow === 6 && !isTodayCell ? 'text-accent' : 'text-ink'
                }`}
              >
                {d}
              </span>
              {hasEvent && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-primary'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarScreen({ onOpenEvent }: { onOpenEvent: (id: string) => void }) {
  const { events, eventsByDate, addEvent } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState(todayISO());
  const [sheetOpen, setSheetOpen] = useState(false);

  // form
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [hashtag, setHashtag] = useState('');

  const eventDates = useMemo(() => new Set(events.map((e) => e.date)), [events]);
  const dayEvents = eventsByDate(selected);

  const prevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };

  const openForm = (iso: string) => {
    setSelected(iso);
    setSheetOpen(true);
    setName('');
    setTime('');
    setHashtag('');
  };

  const submit = () => {
    if (!name.trim()) return;
    addEvent({
      name: name.trim(),
      date: selected,
      time: time.trim() || undefined,
      hashtag: hashtag.trim() ? (hashtag.trim().startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`) : undefined,
    });
    setSheetOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-4 pt-4">
        {/* month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted hover:bg-surface-2 active:scale-90 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="font-display font-extrabold text-lg text-ink tracking-tight">{fmtMonthYear(year, month)}</h2>
            <p className="text-[11px] text-faint font-medium mt-0.5">日付をタップしてイベント登録</p>
          </div>
          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center text-muted hover:bg-surface-2 active:scale-90 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* calendar */}
        <div className="bg-surface rounded-3xl p-4 border border-border shadow-sm">
          <CalendarGrid
            year={year}
            month={month}
            selected={selected}
            eventDates={eventDates}
            onPick={(iso) => {
              setSelected(iso);
              if (eventsByDate(iso).length === 0) openForm(iso);
            }}
          />
        </div>

        {/* selected day detail */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className={`font-display font-extrabold text-base tracking-tight ${isToday(selected) ? 'text-primary' : 'text-ink'}`}>
              {isToday(selected) ? '今日 ' : ''}{fmtDate(selected)}
            </h3>
            <button
              onClick={() => openForm(selected)}
              className="flex items-center gap-1 text-xs font-bold text-primary bg-primary-soft px-3 h-8 rounded-full hover:brightness-95 active:scale-95 transition"
            >
              <Plus size={14} strokeWidth={3} /> イベント追加
            </button>
          </div>

          {dayEvents.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
              <CalendarDays size={28} className="text-faint mx-auto mb-2" />
              <p className="text-sm text-muted font-medium">この日のイベントはありません</p>
              <button
                onClick={() => openForm(selected)}
                className="text-xs text-primary font-bold mt-2 underline underline-offset-2"
              >
                新規登録する
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dayEvents.map((e) => {
                const upcoming = isFuture(e.date);
                return (
                  <button
                    key={e.id}
                    onClick={() => onOpenEvent(e.id)}
                    className="w-full text-left bg-surface rounded-2xl p-4 border border-border hover:border-border-strong active:scale-[0.98] transition shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-ink truncate">{e.name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted font-medium flex-wrap">
                          {e.time && <span>{e.time}</span>}
                          {e.hashtag && (
                            <span className="text-accent font-bold flex items-center">
                              <Dot size={14} className="-ml-1" />
                              {e.hashtag}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${
                          upcoming ? 'bg-gold-soft text-gold' : 'bg-accent-soft text-accent'
                        }`}
                      >
                        {upcoming ? '予定' : `お題${e.questions.length}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* event form sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={`イベントを登録 — ${fmtDate(selected)}`}
        footer={
          <div className="flex gap-3">
            <GhostButton className="flex-1" onClick={() => setSheetOpen(false)}>
              キャンセル
            </GhostButton>
            <PrimaryButton className="flex-[2]" onClick={submit} disabled={!name.trim()}>
              保存する
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <TextField
            label="会名"
            placeholder="例：月イチ大喜利会"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            label="時間"
            placeholder="例：18:00〜22:00"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            hint="※任意。予定の時間帯をメモ"
          />
          <TextField
            label="ハッシュタグ"
            placeholder="例：#月イチ大喜利"
            value={hashtag}
            onChange={(e) => setHashtag(e.target.value)}
            hint="※任意。# は自動で付きます"
          />
          <div className="rounded-2xl bg-accent-soft p-3.5 text-[11px] text-accent-dark font-medium leading-relaxed">
            未来のイベントは、お題を入力しなくても保存できます。予定として残しておきましょう。
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
