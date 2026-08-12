import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { initialEvents, uid, type OogiriEvent, type OogiriQuestion, type OogiriAnswer } from '@/data/types';
import { favoriteKey, loadFavoriteKeys, saveFavoriteKeys } from '@/lib/favorites';

export interface FavoriteAnswer {
  event: OogiriEvent;
  question: OogiriQuestion;
  answer: OogiriAnswer;
}

function applyFavoriteKeys(events: OogiriEvent[], keys: Set<string>): OogiriEvent[] {
  return events.map((ev) => ({
    ...ev,
    questions: ev.questions.map((q) => ({
      ...q,
      answers: q.answers.map((a) => ({
        ...a,
        favorite: keys.has(favoriteKey(ev.id, q.id, a.id)),
      })),
    })),
  }));
}

interface AppState {
  events: OogiriEvent[];
  favoriteAnswers: FavoriteAnswer[];
  addEvent: (e: { name: string; date: string; time?: string; hashtag?: string }) => void;
  updateEvent: (id: string, patch: Partial<Omit<OogiriEvent, 'id' | 'questions' | 'createdAt'>>) => void;
  deleteEvent: (id: string) => void;
  addQuestion: (eventId: string, text: string, imageUrl?: string) => void;
  deleteQuestion: (eventId: string, questionId: string) => void;
  addAnswer: (
    eventId: string, 
    questionId: string, 
    a: { 
      answerer: string; 
      text: string; 
      impression: string 
      source?: 'event' | 'answer';
    }
  ) => void;
  deleteAnswer: (eventId: string, questionId: string, answerId: string) => void;
  updateAnswer: (
    eventId: string,
    questionId: string,
    answerId: string,
    patch: {
      answerer: string;
      text: string;
      impression: string;
    }
  ) => void;
  toggleFavorite: (eventId: string, questionId: string, answerId: string) => void;
  eventsByDate: (date: string) => OogiriEvent[];
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<OogiriEvent[]>(() =>
    applyFavoriteKeys(initialEvents, loadFavoriteKeys())
  );

  const addEvent: AppState['addEvent'] = (e) => {
    setEvents((prev) => [
      {
        id: uid(),
        name: e.name,
        date: e.date,
        time: e.time,
        hashtag: e.hashtag,
        questions: [],
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  };

  const updateEvent: AppState['updateEvent'] = (id, patch) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)));
  };

  const deleteEvent: AppState['deleteEvent'] = (id) => {
    const keys = loadFavoriteKeys();
    const ev = events.find((e) => e.id === id);
    if (ev) {
      for (const q of ev.questions) {
        for (const a of q.answers) {
          keys.delete(favoriteKey(ev.id, q.id, a.id));
        }
      }
      saveFavoriteKeys(keys);
    }
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const addQuestion: AppState['addQuestion'] = (eventId, text, imageUrl) => {
    const q: OogiriQuestion = { id: uid(), text, imageUrl, answers: [] };
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, questions: [...ev.questions, q] } : ev))
    );
  };

  const deleteQuestion: AppState['deleteQuestion'] = (eventId, questionId) => {
    const keys = loadFavoriteKeys();
    const ev = events.find((e) => e.id === eventId);
    const q = ev?.questions.find((item) => item.id === questionId);
    if (q) {
      for (const a of q.answers) {
        keys.delete(favoriteKey(eventId, questionId, a.id));
      }
      saveFavoriteKeys(keys);
    }
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId ? { ...ev, questions: ev.questions.filter((q) => q.id !== questionId) } : ev
      )
    );
  };

  const addAnswer: AppState['addAnswer'] = (eventId, questionId, a) => {
    const ans: OogiriAnswer = {
      id: uid(),
      answerer: a.answerer,
      text: a.text,
      impression: a.impression,
      source: a.source ?? 'event',
      createdAt: Date.now(),
    };
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              questions: ev.questions.map((q) =>
                q.id === questionId ? { ...q, answers: [...q.answers, ans] } : q
              ),
            }
          : ev
      )
    );
  };

  const deleteAnswer: AppState['deleteAnswer'] = (eventId, questionId, answerId) => {
    const key = favoriteKey(eventId, questionId, answerId);
    const keys = loadFavoriteKeys();
    if (keys.has(key)) {
      keys.delete(key);
      saveFavoriteKeys(keys);
    }
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              questions: ev.questions.map((q) =>
                q.id === questionId ? { ...q, answers: q.answers.filter((a) => a.id !== answerId) } : q
              ),
            }
          : ev
      )
    );
  };

  const updateAnswer: AppState['updateAnswer'] = (
    eventId,
    questionId,
    answerId,
    patch
  ) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              questions: ev.questions.map((q) =>
                q.id === questionId
                  ? {
                      ...q,
                      answers: q.answers.map((a) =>
                        a.id === answerId
                          ? {
                              ...a,
                              answerer: patch.answerer,
                              text: patch.text,
                              impression: patch.impression,
                            }
                          : a
                      ),
                    }
                  : q
              ),
            }
          : ev
      )
    );
  };

  const toggleFavorite: AppState['toggleFavorite'] = (eventId, questionId, answerId) => {
    const key = favoriteKey(eventId, questionId, answerId);
    const keys = loadFavoriteKeys();
    let nextFavorite = false;

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          questions: ev.questions.map((q) => {
            if (q.id !== questionId) return q;
            return {
              ...q,
              answers: q.answers.map((a) => {
                if (a.id !== answerId) return a;
                nextFavorite = !a.favorite;
                if (nextFavorite) keys.add(key);
                else keys.delete(key);
                return { ...a, favorite: nextFavorite };
              }),
            };
          }),
        };
      })
    );

    saveFavoriteKeys(keys);
  };

  const favoriteAnswers = useMemo(
    () =>
      events.flatMap((event) =>
        event.questions.flatMap((question) =>
          question.answers
            .filter((answer) => answer.favorite)
            .map((answer) => ({ event, question, answer }))
        )
      ),
    [events]
  );

  const eventsByDate: AppState['eventsByDate'] = (date) => events.filter((e) => e.date === date);

  return (
    <Ctx.Provider
      value={{
        events,
        favoriteAnswers,
        addEvent,
        updateEvent,
        deleteEvent,
        addQuestion,
        deleteQuestion,
        addAnswer,
        deleteAnswer,
        updateAnswer,
        toggleFavorite,
        eventsByDate,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
