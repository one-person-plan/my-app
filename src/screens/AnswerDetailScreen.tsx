import { ArrowLeft, Quote, MessageCircle, User, PenLine } from 'lucide-react';
import type { OogiriQuestion, OogiriAnswer } from '@/data/types';

export function AnswerDetailScreen({
  question,
  answer,
  onBack,
  onAnswerQuestion,
}: {
  question: OogiriQuestion;
  answer: OogiriAnswer;
  onBack: () => void;
  onAnswerQuestion: (question: OogiriQuestion) => void;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur-xl border-b border-border/70">
        <div className="px-3 h-14 flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink active:scale-90 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="font-bold text-sm text-ink">
            回答の詳細
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="px-4 pt-5 space-y-4">

          {/* お題 */}
          <section className="bg-surface rounded-2xl p-4 border border-border shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] text-primary font-bold mb-2">
              <MessageCircle size={13} />
              お題
            </div>

            <p className="font-bold text-base text-ink leading-relaxed">
              {question.text || '画像のお題'}
            </p>

            {question.imageUrl && (
              <img
                src={question.imageUrl}
                alt="お題画像"
                className="w-full max-h-64 object-cover rounded-xl mt-3"
              />
            )}
          </section>

          {/* 回答 */}
          <section className="bg-surface rounded-2xl p-5 border border-border shadow-sm">
            <div className="flex items-center gap-1.5 text-[11px] text-accent font-bold mb-3">
              <PenLine size={13} />
              回答
            </div>

            <p className="font-bold text-lg text-ink leading-relaxed">
              「{answer.text}」
            </p>

            <div className="flex items-center gap-1.5 text-xs text-muted mt-4 pt-3 border-t border-border">
              <User size={13} />
              {answer.answerer}
            </div>
          </section>

          {/* 感想 */}
          {answer.impression && (
            <section className="bg-surface rounded-2xl p-4 border border-border shadow-sm">
              <div className="flex items-center gap-1.5 text-[11px] text-accent font-bold mb-2">
                <Quote size={13} />
                感想
              </div>

              <p className="text-sm text-muted italic leading-relaxed">
                「{answer.impression}」
              </p>
            </section>
          )}

          {/* このお題で答える */}
          <button
            onClick={() => onAnswerQuestion(question)}
            className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20 active:scale-[0.98] transition"
          >
            <PenLine size={17} />
            このお題で答える
          </button>

        </div>
      </div>
    </div>
  );
}