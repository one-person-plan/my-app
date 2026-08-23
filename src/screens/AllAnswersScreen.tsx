import { ArrowLeft, ChevronRight, Quote } from 'lucide-react';
import { useMemo } from 'react';
import { useApp } from '@/store/AppContext';
import { isFuture } from '@/lib/date';
import type { OogiriAnswer, OogiriQuestion } from '@/data/types';

export function AllAnswersScreen({
  onBack,
  onOpenAnswerDetail,
}: {
  onBack: () => void;
  onOpenAnswerDetail: (
    question: OogiriQuestion,
    answer: OogiriAnswer
  ) => void;
}) {
  const { events, favoriteAnswers } = useApp();

  const answers = useMemo(() => {
    const favoriteIds = new Set(
      favoriteAnswers.map(({ answer }) => answer.id)
    );

    return events
      .filter((event) => !isFuture(event.date))
      .flatMap((event) =>
        event.questions.flatMap((question) =>
          question.answers
            .filter((answer) => !favoriteIds.has(answer.id))
            .map((answer) => ({
              answer,
              question,
              event,
            }))
        )
      );
  }, [events, favoriteAnswers]);

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
              今日のしがみ
            </h1>
            <p className="text-[11px] text-faint font-medium">
              回答 {answers.length}件
            </p>
          </div>

          <div className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center">
            <Quote size={16} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-4 pt-4 space-y-2.5">
          {answers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border-strong p-8 text-center">
              <Quote
                size={32}
                className="text-faint mx-auto mb-2"
              />
              <p className="text-sm text-muted">
                まだ回答がありません
              </p>
              <p className="text-xs text-faint mt-1">
                しがむ画面からイベントを登録しよう
              </p>
            </div>
          ) : (
            answers.map(({ answer, question, event }) => (
              <button
                key={answer.id}
                onClick={() =>
                  onOpenAnswerDetail(question, answer)
                }
                className="w-full text-left bg-gradient-to-br from-surface to-surface-2 rounded-2xl p-4 border border-border shadow-sm active:scale-[0.98] transition"
              >
                <p className="text-[11px] text-faint font-bold mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  お題：{question.text}
                </p>

                {question.imageUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img
                      src={question.imageUrl}
                      alt="お題画像"
                      className="w-full max-h-48 object-cover"
                    />
                  </div>
                )}

                <p className="font-bold text-ink text-base leading-relaxed mb-2">
                  「{answer.text}」
                </p>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted font-medium">
                    {event.name} ／ {answer.answerer}
                  </span>

                  <span className="text-accent font-bold flex items-center gap-1">
                    <ChevronRight size={14} />
                    詳細
                  </span>
                </div>

                {answer.impression && (
                  <p className="text-xs text-muted mt-2 pt-2 border-t border-border italic">
                    「{answer.impression}」
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}