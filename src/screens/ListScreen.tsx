import { useMemo } from 'react';
import { Quote, CalendarDays, ChevronRight, Clock, Hash, MessageCircle, Star } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { fmtDate, isFuture, isPast, daysBetween, todayISO } from '@/lib/date';
import type { OogiriEvent } from '@/data/types';

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 px-1">
      <div className="w-7 h-7 rounded-xl bg-surface flex items-center justify-center text-primary shadow-sm border border-border">
        {icon}
      </div>
      <h2 className="font-display font-extrabold text-base text-ink tracking-tight">{title}</h2>
      {sub && <span className="text-xs text-faint font-medium ml-auto">{sub}</span>}
    </div>
  );
}

function EventCard({ event, onClick }: { event: OogiriEvent; onClick: () => void }) {
  const past = isPast(event.date);
  const upcoming = isFuture(event.date);
  const daysAway = upcoming ? daysBetween(todayISO(), event.date) : 0;
  const answerCount = event.questions.reduce((sum, q) => sum + q.answers.length, 0);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface rounded-2xl p-4 border border-border hover:border-border-strong active:scale-[0.98] transition shadow-sm flex gap-3.5"
    >
      <div
        className={`shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center ${
          upcoming ? 'bg-gold-soft text-gold' : 'bg-primary-soft text-primary'
        }`}
      >
        <span className="text-[10px] font-bold opacity-70">{new Date(event.date + 'T00:00:00').getMonth() + 1}月</span>
        <span className="text-lg font-extrabold leading-none font-display">
          {new Date(event.date + 'T00:00:00').getDate()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-sm text-ink truncate">{event.name}</h3>
          {upcoming && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-soft text-gold">
              あと{daysAway}日
            </span>
          )}
          {past && event.questions.length === 0 && (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-2 text-muted">
              未記録
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted font-medium flex-wrap">
          <span className="flex items-center gap-1">
            <CalendarDays size={12} /> {fmtDate(event.date)}
          </span>
          {event.time && (
            <span className="flex items-center gap-1">
              <Clock size={12} /> {event.time}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[11px]">
          {event.hashtag && (
            <span className="flex items-center gap-0.5 text-accent font-bold">
              <Hash size={11} /> {event.hashtag.replace('#', '')}
            </span>
          )}
          {past && (
            <span className="flex items-center gap-1 text-faint ml-auto">
              <MessageCircle size={12} /> お題{event.questions.length} / 回答{answerCount}
            </span>
          )}
          {upcoming && (
            <span className="flex items-center gap-1 text-faint ml-auto">
              <MessageCircle size={12} /> お題{event.questions.length}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={18} className="text-faint shrink-0 self-center" />
    </button>
  );
}

export function ListScreen({ onOpenEvent }: { onOpenEvent: (id: string) => void }) {
  const { events, favoriteAnswers } = useApp();

  const pastEvents = useMemo(
    () => events.filter((e) => !isFuture(e.date)).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [events]
  );
  const futureEvents = useMemo(
    () => events.filter((e) => isFuture(e.date)).sort((a, b) => (a.date < b.date ? -1 : 1)),
    [events]
  );

  const randomAnswers = useMemo(() => {
    const all = events
      .filter((e) => !isFuture(e.date))
      .flatMap((e) => e.questions.flatMap((q) => q.answers.map((a) => ({ a, q, e }))));
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [events]);

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-4 pt-4 space-y-7">
        {/* best answers */}
        <section className="animate-fade-in">
          <SectionTitle
            icon={<Star size={15} strokeWidth={2.5} fill="currentColor" />}
            title="ベスト回答"
            sub={favoriteAnswers.length > 0 ? `${favoriteAnswers.length}件` : undefined}
          />
          <div className="space-y-2.5">
            {favoriteAnswers.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
                <Star size={28} className="text-faint mx-auto mb-2" />
                <p className="text-sm text-muted">お気に入りの回答がまだありません</p>
                <p className="text-xs text-faint mt-1">イベント詳細で ★ をタップして登録しよう</p>
              </div>
            ) : (
              favoriteAnswers.map(({ answer: a, question: q, event: e }) => (
                <button
                  key={a.id}
                  onClick={() => onOpenEvent(e.id)}
                  className="w-full text-left bg-gradient-to-br from-gold-soft/80 to-surface rounded-2xl p-4 border border-gold/30 shadow-sm animate-slide-up hover:border-gold/50 active:scale-[0.98] transition"
                >
                  <p className="text-[11px] text-gold font-bold mb-1.5 flex items-center gap-1.5">
                    <Star size={11} fill="currentColor" />
                    お題：{q?.text ?? "お題なし"}
                  </p>
                  <p className="font-bold text-ink text-base leading-relaxed mb-2">「{a?.text ?? "回答なし"}」</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted font-medium">
                      {e.name} ／ {a.answerer}
                    </span>
                    <span className="text-gold font-bold flex items-center gap-1">
                      <ChevronRight size={14} /> 詳細
                    </span>
                  </div>
                  {a.impression && (
                    <p className="text-xs text-muted mt-2 pt-2 border-t border-gold/20 italic">
                      「{a.impression}」
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </section>

        {/* hero: today's one-liners */}
        <section className="animate-fade-in">
          <SectionTitle
            icon={<Quote size={15} strokeWidth={2.5} />}
            title="今日の大喜利"
            sub="どんな一言が刺さった？"
          />
          <div className="space-y-2.5">
            {randomAnswers.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
                <p className="text-sm text-muted">まだ回答がありません</p>
                <p className="text-xs text-faint mt-1">しがむ画面からイベントを登録しよう</p>
              </div>
            )}
            {randomAnswers.map(({ a, q, e }) => (
              <div
                key={a.id}
                className="bg-gradient-to-br from-surface to-surface-2 rounded-2xl p-4 border border-border shadow-sm animate-slide-up"
              >
                <p className="text-[11px] text-faint font-bold mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  お題：{q.text}
                </p>
                <p className="font-bold text-ink text-base leading-relaxed mb-2">「{a.text}」</p>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted font-medium">
                    {e.name} ／ {a.answerer}
                  </span>
                  {a.impression && (
                    <span className="text-accent font-bold flex items-center gap-1">
                      <Quote size={11} /> 感想あり
                    </span>
                  )}
                </div>
                {a.impression && (
                  <p className="text-xs text-muted mt-2 pt-2 border-t border-border italic">
                    「{a.impression}」
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* past events */}
        <section className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <SectionTitle
            icon={<CalendarDays size={15} strokeWidth={2.5} />}
            title="記録したイベント"
            sub={`${pastEvents.length}件`}
          />
          <div className="space-y-2.5">
            {pastEvents.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
                <p className="text-sm text-muted">過去のイベントがありません</p>
              </div>
            )}
            {pastEvents.map((e) => (
              <EventCard key={e.id} event={e} onClick={() => onOpenEvent(e.id)} />
            ))}
          </div>
        </section>

        {/* future events */}
        {futureEvents.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <SectionTitle
              icon={<CalendarDays size={15} strokeWidth={2.5} />}
              title="今後のイベント"
              sub={`${futureEvents.length}件`}
            />
            <div className="space-y-2.5">
              {futureEvents.map((e) => (
                <EventCard key={e.id} event={e} onClick={() => onOpenEvent(e.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
