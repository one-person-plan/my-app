import {CalendarDays, ChevronRight, Clock, Hash, MessageCircle } from 'lucide-react';
import { fmtDate, isFuture, isPast, daysBetween, todayISO } from '@/lib/date';
import type { OogiriEvent } from '@/data/types';

export function EventCard({ event, onClick }: { event: OogiriEvent; onClick: () => void }) {
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