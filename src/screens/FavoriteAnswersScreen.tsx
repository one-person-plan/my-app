import { useState } from 'react';
import { Star, ArrowLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import type { OogiriAnswer, OogiriQuestion } from '@/data/types';

type FavoriteSortOrder =
  | 'default'
  | 'answer-new'
  | 'answer-old'
  | 'event-new'
  | 'event-old';

const sortOrderLabels: Record<FavoriteSortOrder, string> = {
  default: '元の順番',
  'answer-new': '回答が新しい順',
  'answer-old': '回答が古い順',
  'event-new': 'イベントが新しい順',
  'event-old': 'イベントが古い順',
};

export function FavoriteAnswersScreen({
  onBack,
  onOpenAnswerDetail,
}: {
  onBack: () => void;
  onOpenAnswerDetail: (
    question: OogiriQuestion,
    answer: OogiriAnswer
  ) => void;
}) {
  const { favoriteAnswers } = useApp();

  const [sortOrder, setSortOrder] =
  useState<FavoriteSortOrder>('default');

  const [sortMenuOpen, setSortMenuOpen] =
  useState(false);

  const sortedFavoriteAnswers = [...favoriteAnswers].sort((a, b) => {
    if (sortOrder === 'default') {
      return 0;
    }
  
    if (sortOrder === 'answer-new') {
      return (b.answer.createdAt ?? 0) - (a.answer.createdAt ?? 0);
    }
  
    if (sortOrder === 'answer-old') {
      return (a.answer.createdAt ?? 0) - (b.answer.createdAt ?? 0);
    }
  
    if (sortOrder === 'event-new') {
      return b.event.date.localeCompare(a.event.date);
    }
  
    if (sortOrder === 'event-old') {
      return a.event.date.localeCompare(b.event.date);
    }
  
    return 0;
  });

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
              ベスト回答
            </h1>
            <p className="text-[11px] text-faint font-medium">
              お気に入り {favoriteAnswers.length}件
            </p>
          </div>

          <div className="relative">
            <button
             onClick={() => setSortMenuOpen((prev) => !prev)}
             className="h-9 px-3 rounded-full bg-surface border border-border flex items-center gap-1.5 text-xs font-bold text-ink active:scale-95 transition"
            >
             <SlidersHorizontal size={14} />
             {sortOrder === 'default'
               ? '▼ 順番を並びかえる'
               : `▼ ${sortOrderLabels[sortOrder]}`}
            </button>

            {sortMenuOpen && (
              <div className="absolute right-0 top-11 z-30 w-48 rounded-2xl bg-surface border border-border shadow-lg p-1.5">
                {(Object.keys(sortOrderLabels) as FavoriteSortOrder[]).map(
                  (order) => (
                    <button
                      key={order}
                      onClick={() => {
                        setSortOrder(order);
                        setSortMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-bold text-ink hover:bg-surface-2 active:scale-[0.98] transition"
                    >
                      <span>{sortOrderLabels[order]}</span>
                      {sortOrder === order && (
                        <span className="text-primary">✓</span>
                      )}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-4 pt-4 space-y-2.5">
          {favoriteAnswers.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border-strong p-8 text-center">
              <Star
                size={32}
                className="text-faint mx-auto mb-2"
              />
              <p className="text-sm text-muted">
                お気に入りの回答がまだありません
              </p>
              <p className="text-xs text-faint mt-1">
                イベント詳細で ★ をタップして登録しよう
              </p>
            </div>
          ) : (
            sortedFavoriteAnswers.map(({ answer: a, question: q, event: e }) => (
              <button
                key={a.id}
                onClick={() => onOpenAnswerDetail(q, a)}
                className="w-full text-left bg-gradient-to-br from-gold-soft/80 to-surface rounded-2xl p-4 border border-gold/30 shadow-sm hover:border-gold/50 active:scale-[0.98] transition"
              >
                <p className="text-[11px] text-gold font-bold mb-1.5 flex items-center gap-1.5">
                  <Star size={11} fill="currentColor" />
                  お題：{q?.text ?? 'お題なし'}
                </p>

                {q?.imageUrl && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img
                      src={q.imageUrl}
                      alt="お題画像"
                      className="w-full max-h-48 object-cover"
                    />
                  </div>
                )}

                <p className="font-bold text-ink text-base leading-relaxed mb-2">
                  「{a?.text ?? '回答なし'}」
                </p>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted font-medium">
                    {e.name} ／ {a.answerer}
                  </span>

                  <span className="text-gold font-bold flex items-center gap-1">
                    <ChevronRight size={14} />
                    詳細
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
      </div>
    </div>
  );
}