export const PLACEHOLDERS = {
  '{question}': 'お題文',
  '{name}': '回答者名',
  '{answer}': '回答',
  '{hashtag}': 'ハッシュタグ',
} as const;

export const DEFAULT_TEXT_TEMPLATE = '{question}お題、{name}さんの「{answer}」って回答が面白かったです！{hashtag}';
export const DEFAULT_IMAGE_TEMPLATE = 'このお題、{name}さんの「{answer}」って回答が面白かったです！{hashtag}';

const KEY = 'shigamoo_templates';

export interface Templates {
  textTemplate: string;
  imageTemplate: string;
}

export function loadTemplates(): Templates {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultTemplates();
    const parsed = JSON.parse(raw);
    return {
      textTemplate: parsed.textTemplate ?? DEFAULT_TEXT_TEMPLATE,
      imageTemplate: parsed.imageTemplate ?? DEFAULT_IMAGE_TEMPLATE,
    };
  } catch {
    return defaultTemplates();
  }
}

export function saveTemplates(t: Templates) {
  localStorage.setItem(KEY, JSON.stringify(t));
}

export function defaultTemplates(): Templates {
  return { textTemplate: DEFAULT_TEXT_TEMPLATE, imageTemplate: DEFAULT_IMAGE_TEMPLATE };
}

function clean(value: string, fallback: string) {
  return value.trim().length > 0 ? value : fallback;
}

export function buildPostText(
  template: string,
  data: { question: string; name: string; answer: string; hashtag?: string }
): string {
  const t = clean(template, DEFAULT_TEXT_TEMPLATE);
  return t
    .replaceAll('{question}', data.question)
    .replaceAll('{name}', data.name)
    .replaceAll('{answer}', data.answer)
    .replaceAll('{hashtag}', data.hashtag ?? '')
    .trim();
}

export function extractPlaceholders(template: string): string[] {
  return Array.from(template.matchAll(/\{(\w+)\}/g), (m) => m[0]).filter(
    (p) => p in PLACEHOLDERS
  );
}
