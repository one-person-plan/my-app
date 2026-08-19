import { useEffect, useMemo, useRef, useState } from 'react';
import { Timer as TimerIcon, Play, Pause, RotateCcw, ChevronDown, ChevronRight, MessageCircle, Clock } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { fmtShort, fmtDate } from '@/lib/date';
import type { OogiriEvent, OogiriQuestion } from '@/data/types';

function Stepper({
  label,
  value,
  max,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1 text-center">
      <p className="text-[11px] font-bold text-muted mb-2 tracking-wide">{label}</p>
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-9 h-9 rounded-xl bg-surface-2 text-ink font-bold text-lg active:scale-90 transition hover:bg-border"
        >
          −
        </button>
        <span className="text-4xl font-extrabold text-ink font-display w-16 text-center tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-9 h-9 rounded-xl bg-surface-2 text-ink font-bold text-lg active:scale-90 transition hover:bg-border"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Ring({ progress, total, remaining }: { progress: number; total: number; remaining: number }) {
  const r = 120;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  const low = remaining <= 10 && remaining > 0;

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
        <circle cx="128" cy="128" r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth="14" />
        <circle
          cx="128"
          cy="128"
          r={r}
          fill="none"
          stroke={low ? 'var(--color-error)' : 'var(--color-primary)'}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display font-extrabold text-5xl tabular-nums ${low ? 'text-error' : 'text-ink'}`}
        >
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </span>
        <span className="text-xs text-faint font-bold mt-1 tracking-wide">
          {total > 0 ? (low ? 'まもなく終了' : '残り時間') : 'タイマー'}
        </span>
      </div>
    </div>
  );
}

function EventTopicItem({
  event,
  selectedQuestion,
  onPick,
}: {
  event: OogiriEvent;
  selectedQuestion?: OogiriQuestion;
  onPick: (q: OogiriQuestion) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasQuestions = event.questions.length > 0;

  return (
    <div className="rounded-2xl bg-surface border border-border overflow-hidden">
      <button
        onClick={() => hasQuestions && setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 p-3.5 ${hasQuestions ? 'hover:bg-surface-2 active:scale-[0.99]' : ''} transition`}
      >
        <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0 font-display font-extrabold text-sm">
          {fmtShort(event.date)}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="font-bold text-sm text-ink truncate">{event.name}</p>
          <p className="text-[11px] text-faint font-medium">{fmtDate(event.date)}</p>
        </div>
        {hasQuestions ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent-soft px-2 py-1 rounded-full">
            <MessageCircle size={11} /> {event.questions.length}
          </span>
        ) : (
          <span className="text-[10px] font-bold text-faint bg-surface-2 px-2 py-1 rounded-full">お題なし</span>
        )}
        {hasQuestions && (open ? <ChevronDown size={16} className="text-faint" /> : <ChevronRight size={16} className="text-faint" />)}
      </button>
      {open && hasQuestions && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-2 border-t border-border">
          {event.questions.map((q) => {
            const isSel = selectedQuestion?.id === q.id;
            return (
              <button
                key={q.id}
                onClick={() => onPick(q)}
                className={`w-full text-left p-3 rounded-xl text-sm font-medium transition active:scale-[0.98] ${
                  isSel
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-surface-2 text-ink hover:bg-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  {q.imageUrl && (
                    <img
                      src={q.imageUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold mb-0.5 opacity-70">
                      お題
                    </p>
                    <p className="leading-relaxed">
                      {q.text || '画像のお題'}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getAnswerLabel(number: number) {
  const circled = [
    '①', '②', '③', '④', '⑤',
    '⑥', '⑦', '⑧', '⑨', '⑩',
    '⑪', '⑫', '⑬', '⑭', '⑮',
    '⑯', '⑰', '⑱', '⑲', '⑳',
  ];

  return circled[number - 1] ?? `${number}`;
}

export function TimerScreen({
    initialQuestion,
  }: {
    initialQuestion?: OogiriQuestion;
  }) {
  const { events, addAnswer } = useApp();
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<OogiriQuestion | undefined>(
    initialQuestion
  );
  const [finished, setFinished] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [answerCount, setAnswerCount] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const total = minutes * 60 + seconds;

  useEffect(() => {
    setSelectedQuestion(initialQuestion);
  }, [initialQuestion]);

  useEffect(() => {
    setAnswerText('');
    setAnswerCount(0);
    setTimerEnabled(false);
    setRunning(false);
    setRemaining(0);
    setFinished(false);
  }, [selectedQuestion]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current!);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  const submitAnswer = () => {
    if (!selectedQuestion || !answerText.trim()) return;
  
    const event = events.find((e) =>
      e.questions.some((q) => q.id === selectedQuestion.id)
    );
    
    if (!event) return;
    
    const question = event.questions.find(
      (q) => q.id === selectedQuestion.id
    );
    
    if (!question) return;
    
    const answerCount = question.answers.filter((a) =>
      a.answerer.startsWith('こたえる')
    ).length;
    
    const nextNumber = answerCount + 1;
    
    addAnswer(event.id, selectedQuestion.id, {
      answerer: `こたえる${getAnswerLabel(nextNumber)}`,
      text: answerText.trim(),
      impression: '',
      source: 'answer',
    });
  
    setAnswerText('');
    setAnswerCount((count) => count + 1);
  };

  const start = () => {
    if (total <= 0) return;
    setRemaining(total);
    setFinished(false);
    setAnswerCount(0);
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const resume = () => setRunning(true);
  const reset = () => {
    setRunning(false);
    setRemaining(0);
    setFinished(false);
  };

  const progress = total > 0 ? remaining / total : 0;
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [events]
  );

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-4 pt-4 space-y-5">
        {/* topic picker */}
        <section>
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-7 h-7 rounded-xl bg-surface flex items-center justify-center text-accent shadow-sm border border-border">
              <MessageCircle size={15} strokeWidth={2.5} />
            </div>
            <h2 className="font-display font-extrabold text-base text-ink tracking-tight">お題を選ぶ</h2>
          </div>

          {selectedQuestion && (
            <div className="mb-3 rounded-2xl bg-primary-soft border border-primary/20 p-3.5 animate-pop">
              <p className="text-[10px] font-bold text-primary mb-1">選択中のお題</p>
              <p className="font-bold text-sm text-ink leading-relaxed">{selectedQuestion.text}</p>
              <button
                onClick={() => setSelectedQuestion(undefined)}
                className="text-[11px] text-primary font-bold mt-2 underline underline-offset-2"
              >
                選択を解除
              </button>
            </div>
          )}

        {!selectedQuestion && (
         <div className="space-y-2.5">
          {sortedEvents.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-border-strong p-6 text-center">
              <p className="text-sm text-muted">イベントがありません</p>
              <p className="text-xs text-faint mt-1">しがむ画面で登録してください</p>
            </div>
          )}

          {sortedEvents.map((e) => (
            <EventTopicItem
              key={e.id}
              event={e}
              selectedQuestion={selectedQuestion}
              onPick={(q) => setSelectedQuestion(q)}
            />
           ))}
         </div>
        )}

        </section>

        {/* answer */}
        <section className="bg-surface rounded-3xl p-5 border border-border shadow-sm">
         <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-surface-2 flex items-center justify-center text-primary">
            <MessageCircle size={15} strokeWidth={2.5} />
          </div>
          <h2 className="font-display font-extrabold text-base text-ink tracking-tight">回答する</h2>
        </div>
        <div className="flex items-center justify-between mb-3">
         <span className="text-xs font-bold text-muted">練習タイマー</span>
         <button
          type="button"
         onClick={() => setTimerEnabled((v) => !v)}
         disabled={!selectedQuestion}
         className={`relative w-12 h-7 rounded-full transition ${
          timerEnabled ? 'bg-primary' : 'bg-border'
          }`}
>
         <span
           className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition ${
            timerEnabled ? 'left-6' : 'left-1'
            }`}
          />
         </button>
      </div>
        <textarea
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          disabled={!selectedQuestion}
          placeholder={selectedQuestion ? 'ここに回答を入力' : '先にお題を選んでください'}
          rows={4}
          className="w-full rounded-2xl border border-border bg-surface-2 p-3.5 text-sm text-ink placeholder:text-faint resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </section>
      <button
       type="button"
       onClick={submitAnswer}
       disabled={!selectedQuestion || !answerText.trim()}
       className="w-full h-12 mt-3 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition"
        >
        回答を保存する
      </button>
      {timerEnabled && (
        <section className="bg-surface rounded-3xl p-5 border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-xl bg-surface-2 flex items-center justify-center text-primary">
              <TimerIcon size={15} strokeWidth={2.5} />
            </div>
            <h2 className="font-display font-extrabold text-base text-ink tracking-tight">練習タイマー</h2>
          </div>

          <Ring progress={progress} total={total} remaining={remaining} />

          <div className="mt-4 text-center">
           <p className="text-3xl font-extrabold text-primary font-display tabular-nums">
               {answerCount}答
           </p>
           <p className="text-[11px] text-faint font-bold mt-1">
            現在の回答数
           </p>
          </div>

          {finished && (
            <div className="mt-4 text-center rounded-2xl bg-success/10 py-3 animate-pop">
              <p className="font-bold text-success text-sm">
               タイムアップ！
              </p>
              <p className="font-display font-extrabold text-success text-2xl mt-1">
               {answerCount}答出せました！
              </p>
            </div>
          )}

          {remaining === 0 && !finished && (
            <div className="mt-6">
              <p className="text-center text-xs text-muted font-bold mb-3 tracking-wide">時間を設定</p>
              <div className="flex items-center justify-center gap-2">
                <Stepper label="分" value={minutes} max={59} onChange={setMinutes} />
                <span className="text-3xl font-extrabold text-faint font-display pb-6">:</span>
                <Stepper label="秒" value={seconds} max={59} onChange={setSeconds} />
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {running ? (
              <button
                onClick={pause}
                className="flex-1 h-14 rounded-2xl bg-surface-2 text-ink font-bold flex items-center justify-center gap-2 hover:bg-border active:scale-95 transition"
              >
                <Pause size={20} fill="currentColor" /> 一時停止
              </button>
            ) : remaining > 0 ? (
              <button
                onClick={resume}
                className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-95 transition shadow-lg shadow-primary/25"
              >
                <Play size={20} fill="currentColor" /> 再開
              </button>
            ) : (
              <button
                onClick={start}
                disabled={total <= 0}
                className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-95 transition shadow-lg shadow-primary/25 disabled:opacity-40"
              >
                <Play size={20} fill="currentColor" /> スタート
              </button>
            )}
            <button
              onClick={reset}
              className="w-14 h-14 rounded-2xl bg-surface-2 text-muted flex items-center justify-center hover:bg-border active:scale-90 transition"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          <p className="text-center text-[11px] text-faint font-medium mt-4 flex items-center justify-center gap-1">
            <Clock size={12} />
            {selectedQuestion ? 'お題を選択中 — 終了で自動停止' : 'お題を選ぶと集中しやすいよ'}
          </p>
        </section>
      )}
      </div>
    </div>
  );
}
