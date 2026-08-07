export function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const w = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日（${w}）`;
}

export function fmtShort(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function fmtMonthYear(year: number, month: number) {
  return `${year}年${month + 1}月`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isPast(iso: string) {
  return iso < todayISO();
}

export function isFuture(iso: string) {
  return iso > todayISO();
}

export function isToday(iso: string) {
  return iso === todayISO();
}

export function daysBetween(a: string, b: string) {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / 86400000);
}
