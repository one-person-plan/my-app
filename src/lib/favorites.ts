const KEY = 'shigamoo_favorites';

export function favoriteKey(eventId: string, questionId: string, answerId: string) {
  return `${eventId}:${questionId}:${answerId}`;
}

export function loadFavoriteKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((k): k is string => typeof k === 'string'));
  } catch {
    return new Set();
  }
}

export function saveFavoriteKeys(keys: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...keys]));
}
