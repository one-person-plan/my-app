import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  initialEvents,
  uid,
  type OogiriEvent,
  type OogiriQuestion,
  type OogiriAnswer,
} from '@/data/types';
import {
  favoriteKey,
  loadFavoriteKeys,
  saveFavoriteKeys,
} from '@/lib/favorites';

export interface FavoriteAnswer {
  event: OogiriEvent;
  question: OogiriQuestion;
  answer: OogiriAnswer;
}

const EVENTS_STORAGE_KEY = 'oogiri-events';
const EVENTS_BACKUP_STORAGE_KEY = 'oogiri-events-backup';
const EVENTS_STORAGE_VERSION = 1;

interface StoredEvents {
  version: number;
  savedAt: number;
  events: OogiriEvent[];
}

function applyFavoriteKeys(
  events: OogiriEvent[],
  keys: Set<string>
): OogiriEvent[] {
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

/**
 * 保存データが最低限正しいイベント配列か確認する
 */
function isValidEvents(value: unknown): value is OogiriEvent[] {
  if (!Array.isArray(value)) return false;

  return value.every(
    (event) =>
      event &&
      typeof event === 'object' &&
      typeof event.id === 'string' &&
      typeof event.name === 'string' &&
      typeof event.date === 'string' &&
      Array.isArray(event.questions)
  );
}

/**
 * localStorageからイベントを読み込む
 */
function loadEvents(): OogiriEvent[] {
  const favoriteKeys = loadFavoriteKeys();

  try {
    const saved = localStorage.getItem(EVENTS_STORAGE_KEY);

    if (saved) {
      const parsed: unknown = JSON.parse(saved);

      // 新しい保存形式
      if (
        parsed &&
        typeof parsed === 'object' &&
        'events' in parsed
      ) {
        const stored = parsed as StoredEvents;

        if (isValidEvents(stored.events)) {
          console.log(
            `イベントデータを読み込みました（保存日時: ${
              stored.savedAt
                ? new Date(stored.savedAt).toLocaleString()
                : '不明'
            }）`
          );

          return applyFavoriteKeys(stored.events, favoriteKeys);
        }
      }

      // 以前の形式（イベント配列だけ保存していた場合）
      if (isValidEvents(parsed)) {
        console.log('旧形式のイベントデータを読み込みました');
        return applyFavoriteKeys(parsed, favoriteKeys);
      }
    }
  } catch (error) {
    console.error(
      'イベントデータの読み込みに失敗しました:',
      error
    );
  }

  /**
   * メインデータが壊れていた場合、
   * バックアップから復旧を試みる
   */
  try {
    const backup = localStorage.getItem(
      EVENTS_BACKUP_STORAGE_KEY
    );

    if (backup) {
      const parsed: unknown = JSON.parse(backup);

      if (
        parsed &&
        typeof parsed === 'object' &&
        'events' in parsed
      ) {
        const stored = parsed as StoredEvents;

        if (isValidEvents(stored.events)) {
          console.warn(
            'メインデータが読み込めなかったため、バックアップから復旧しました'
          );

          return applyFavoriteKeys(
            stored.events,
            favoriteKeys
          );
        }
      }
    }
  } catch (error) {
    console.error(
      'バックアップデータの読み込みにも失敗しました:',
      error
    );
  }

  console.warn(
    '保存データが見つからないため、初期データを使用します'
  );

  return applyFavoriteKeys(initialEvents, favoriteKeys);
}

interface AppState {
  events: OogiriEvent[];
  favoriteAnswers: FavoriteAnswer[];
  restoreEvents: (events: OogiriEvent[]) => void;

  addEvent: (e: {
    name: string;
    date: string;
    time?: string;
    hashtag?: string;
    memo?: string;
  }) => void;

  updateEvent: (
    id: string,
    patch: Partial<
      Omit<OogiriEvent, 'id' | 'questions' | 'createdAt'>
    >
  ) => void;

  deleteEvent: (id: string) => void;

  addQuestion: (
    eventId: string,
    text: string,
    imageUrl?: string
  ) => void;

  updateQuestion: (
    eventId: string,
    questionId: string,
    patch: {
      text: string;
      imageUrl?: string;
    }
  ) => void;

  deleteQuestion: (
    eventId: string,
    questionId: string
  ) => void;

  addAnswer: (
    eventId: string,
    questionId: string,
    a: {
      answerer: string;
      text: string;
      impression: string;
      source?: 'event' | 'answer';
    }
  ) => void;

  deleteAnswer: (
    eventId: string,
    questionId: string,
    answerId: string
  ) => void;

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

  toggleFavorite: (
    eventId: string,
    questionId: string,
    answerId: string
  ) => void;

  eventsByDate: (date: string) => OogiriEvent[];
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [events, setEvents] = useState<OogiriEvent[]>(
    () => loadEvents()
  );

  /**
   * イベントデータを保存する
   *
   * メイン保存 + バックアップ保存の2段構成
   */
  useEffect(() => {
    const data: StoredEvents = {
      version: EVENTS_STORAGE_VERSION,
      savedAt: Date.now(),
      events,
    };

    const serialized = JSON.stringify(data);

    try {
      // --------------------------------
      // ① メインデータを保存
      // --------------------------------
      localStorage.setItem(
        EVENTS_STORAGE_KEY,
        serialized
      );

      // --------------------------------
      // ② 保存できたか確認
      // --------------------------------
      const saved = localStorage.getItem(
        EVENTS_STORAGE_KEY
      );

      if (saved !== serialized) {
        throw new Error(
          '保存後のデータ確認に失敗しました'
        );
      }

      // --------------------------------
      // ③ バックアップを保存
      // --------------------------------
      localStorage.setItem(
        EVENTS_BACKUP_STORAGE_KEY,
        serialized
      );

      console.log(
        `イベントデータを保存しました（${events.length}件）`
      );
    } catch (error) {
      console.error(
        'イベントデータの保存に失敗しました:',
        error
      );

      /**
       * 保存容量不足などの場合に、
       * ユーザーへ気付きやすいようにする
       */
      alert(
        'データの保存に失敗しました。\n\n' +
          '端末の空き容量やブラウザの保存領域を確認してください。'
      );
    }
  }, [events]);

  const addEvent: AppState['addEvent'] = (e) => {
    setEvents((prev) => [
      {
        id: uid(),
        name: e.name,
        date: e.date,
        time: e.time,
        hashtag: e.hashtag,
        memo: e.memo,
        questions: [],
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  };

  const updateEvent: AppState['updateEvent'] = (id, patch) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === id
          ? {
              ...ev,
              ...patch,
            }
          : ev
      )
    );
  };
  
  const restoreEvents: AppState['restoreEvents'] = (restoredEvents) => {  
    setEvents(restoredEvents);
  };

  const deleteEvent: AppState['deleteEvent'] = (id) => {
    const keys = loadFavoriteKeys();
    const ev = events.find((e) => e.id === id);

    if (ev) {
      for (const q of ev.questions) {
        for (const a of q.answers) {
          keys.delete(
            favoriteKey(ev.id, q.id, a.id)
          );
        }
      }

      saveFavoriteKeys(keys);
    }

    setEvents((prev) =>
      prev.filter((ev) => ev.id !== id)
    );
  };

  const addQuestion: AppState['addQuestion'] = (
    eventId,
    text,
    imageUrl
  ) => {
    const q: OogiriQuestion = {
      id: uid(),
      text,
      imageUrl,
      answers: [],
    };

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              questions: [...ev.questions, q],
            }
          : ev
      )
    );
  };

  const updateQuestion: AppState['updateQuestion'] = (
    eventId,
    questionId,
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
                      text: patch.text,
                      imageUrl: patch.imageUrl,
                    }
                  : q
              ),
            }
          : ev
      )
    );
  };

  const deleteQuestion: AppState['deleteQuestion'] = (
    eventId,
    questionId
  ) => {
    const keys = loadFavoriteKeys();
    const ev = events.find(
      (e) => e.id === eventId
    );

    const q = ev?.questions.find(
      (item) => item.id === questionId
    );

    if (q) {
      for (const a of q.answers) {
        keys.delete(
          favoriteKey(
            eventId,
            questionId,
            a.id
          )
        );
      }

      saveFavoriteKeys(keys);
    }

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              questions: ev.questions.filter(
                (q) => q.id !== questionId
              ),
            }
          : ev
      )
    );
  };

  const addAnswer: AppState['addAnswer'] = (
    eventId,
    questionId,
    a
  ) => {
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
                q.id === questionId
                  ? {
                      ...q,
                      answers: [
                        ...q.answers,
                        ans,
                      ],
                    }
                  : q
              ),
            }
          : ev
      )
    );
  };

  const deleteAnswer: AppState['deleteAnswer'] = (
    eventId,
    questionId,
    answerId
  ) => {
    const key = favoriteKey(
      eventId,
      questionId,
      answerId
    );

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
                q.id === questionId
                  ? {
                      ...q,
                      answers: q.answers.filter(
                        (a) => a.id !== answerId
                      ),
                    }
                  : q
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
                      answers: q.answers.map(
                        (a) =>
                          a.id === answerId
                            ? {
                                ...a,
                                answerer:
                                  patch.answerer,
                                text: patch.text,
                                impression:
                                  patch.impression,
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

  const toggleFavorite: AppState['toggleFavorite'] = (
    eventId,
    questionId,
    answerId
  ) => {
    const key = favoriteKey(
      eventId,
      questionId,
      answerId
    );

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

                if (nextFavorite) {
                  keys.add(key);
                } else {
                  keys.delete(key);
                }

                return {
                  ...a,
                  favorite: nextFavorite,
                };
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
            .filter(
              (answer) => answer.favorite
            )
            .map((answer) => ({
              event,
              question,
              answer,
            }))
        )
      ),
    [events]
  );

  const eventsByDate: AppState['eventsByDate'] = (
    date
  ) =>
    events.filter(
      (e) => e.date === date
    );

  return (
    <Ctx.Provider
      value={{
        events,
        favoriteAnswers,
        restoreEvents,
        addEvent,
        updateEvent,
        deleteEvent,
        addQuestion,
        updateQuestion,
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

  if (!ctx) {
    throw new Error(
      'useApp must be used within AppProvider'
    );
  }

  return ctx;
}