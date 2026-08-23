import { useMemo } from 'react';
import { Quote, CalendarDays, ChevronRight, Clock, Hash, MessageCircle, Star, } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { fmtDate, isFuture, isPast, daysBetween, todayISO, } from '@/lib/date';
import type { OogiriAnswer, OogiriEvent, OogiriQuestion } from '@/data/types';
import { EventCard } from '@/components/EventCard';

function SectionTitle({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="w-7 h-7 rounded-xl bg-surface flex items-center justify-center text-primary shadow-sm border border-border">
        {icon}
      </div>
      <h2 className="font-display font-extrabold text-base text-ink tracking-tight">{title}</h2>
      {sub && <span className="text-xs text-faint font-medium ml-auto">{sub}</span>}
    </div>
  );
}

export function ListScreen({
  onOpenEvent,
  onAnswerQuestion,
  onOpenAnswerDetail,
  onOpenFavoriteAnswers,
  onOpenAllAnswers,
  onOpenPastEvents,
}: {
  onOpenEvent: (id: string) => void;
  onAnswerQuestion: (question: OogiriQuestion) => void;
  onOpenAnswerDetail: (
    question: OogiriQuestion,
    answer: OogiriAnswer
  ) => void;
  onOpenFavoriteAnswers: () => void;
  onOpenAllAnswers: () => void;
  onOpenPastEvents: () => void;
}) {
  const { events, favoriteAnswers } = useApp();

  const pastEvents = useMemo(
    () => events.filter((e) => !isFuture(e.date)).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [events]
  );
  const futureEvents = useMemo(
    () => events.filter((e) => isFuture(e.date)).sort((a, b) => (a.date < b.date ? -1 : 1)),
    [events]
  );

  const randomFavoriteAnswers = useMemo(() => {
    const shuffled = [...favoriteAnswers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [favoriteAnswers]);

  const randomNonFavoriteAnswers = useMemo(() => {
    const favoriteIds = new Set(
      randomFavoriteAnswers.map(({ answer }) => answer.id)
    );
  
    const all = events
      .filter((e) => !isFuture(e.date))
      .flatMap((e) =>
        e.questions.flatMap((q) =>
          q.answers
            .filter((a) => !favoriteIds.has(a.id))
            .map((a) => ({ a, q, e }))
        )
      );
  
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [events, randomFavoriteAnswers]);

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-4 pt-4 space-y-7">
        {/* best answers */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <SectionTitle
              icon={
                <Star
                  size={15}
                  strokeWidth={2.5}
                  fill="currentColor"
                />
              }
              title="ベスト回答"
              sub={
                favoriteAnswers.length > 0
                  ? `${favoriteAnswers.length}件`
                  : undefined
              }
            />

            {favoriteAnswers.length > 0 && (
              <button
                onClick={onOpenFavoriteAnswers}
                className="shrink-0 flex items-center gap-0.5 text-xs font-bold text-primary active:scale-95 transition"
              >
                すべて見る
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            {favoriteAnswers.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
                <Star size={28} className="text-faint mx-auto mb-2" />
                <p className="text-sm text-muted">お気に入りの回答がまだありません</p>
                <p className="text-xs text-faint mt-1">イベント詳細で ★ をタップして登録しよう</p>
              </div>
            ) : (
              randomFavoriteAnswers.map(({ answer: a, question: q, event: e }) => (
                <button
                  key={a.id}
                  onClick={() => onOpenAnswerDetail(q, a)}
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
          <div className="flex items-center justify-between mb-3">
            <SectionTitle
              icon={<Quote size={15} strokeWidth={2.5} />}
              title="今日のしがみ"
              sub="どんな一言が刺さった？"
            />

            {randomNonFavoriteAnswers.length > 0 && (
              <button
                onClick={onOpenAllAnswers}
                className="shrink-0 flex items-center gap-0.5 text-xs font-bold text-primary active:scale-95 transition"
              >
                すべて見る
                <ChevronRight size={14} />
              </button>
            )}
          </div>
          <div className="space-y-2.5">
            {randomNonFavoriteAnswers.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
                <p className="text-sm text-muted">まだ回答がありません</p>
                <p className="text-xs text-faint mt-1">しがむ画面からイベントを登録しよう</p>
              </div>
            )}
            {randomNonFavoriteAnswers.map(({ a, q, e }) => (
              <button
                key={a.id}
                onClick={() => onOpenAnswerDetail(q, a)}
                className="w-full text-left bg-gradient-to-br from-surface to-surface-2 rounded-2xl p-4 border border-border shadow-sm animate-slide-up activate:scale-[0.98] transition"
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
              </button>
            ))}
          </div>
        </section>

        {/* past events */}
        <section className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle
            icon={<CalendarDays size={15} strokeWidth={2.5} />}
            title="記録したイベント"
            sub={`${pastEvents.length}件`}
          />

          {pastEvents.length > 3 && (
            <button
              onClick={onOpenPastEvents}
              className="shrink-0 flex items-center gap-0.5 text-xs font-bold text-primary active:scale-95 transition"
            >
              すべて見る
              <ChevronRight size={14} />
            </button>
          )}
        </div>
          <div className="space-y-2.5">
            {pastEvents.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
                <p className="text-sm text-muted">過去のイベントがありません</p>
              </div>
            )}
            {pastEvents.slice(0, 3).map((e) => (
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
              {futureEvents.slice(0, 3).map((e) => (
                <EventCard key={e.id} event={e} onClick={() => onOpenEvent(e.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
