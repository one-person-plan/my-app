import type { OogiriEvent } from '@/data/types';

const BACKUP_VERSION = 1;

export interface OogiriBackup {
  app: 'oogiri';
  version: number;
  exportedAt: number;
  events: OogiriEvent[];
}

/**
 * 現在のイベントデータをJSONファイルとして保存する
 */
export function exportEvents(events: OogiriEvent[]): void {
  const backup: OogiriBackup = {
    app: 'oogiri',
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    events,
  };

  const json = JSON.stringify(backup, null, 2);

  const blob = new Blob([json], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `oogiri-backup-${formatDate(
    new Date()
  )}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * バックアップファイルを読み込む
 */
export function importEvents(
  file: File
): Promise<OogiriEvent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(
          reader.result as string
        );

        if (
          !parsed ||
          typeof parsed !== 'object' ||
          !('events' in parsed)
        ) {
          throw new Error(
            '大喜利アプリのバックアップファイルではありません。'
          );
        }

        const backup = parsed as OogiriBackup;

        if (backup.app !== 'oogiri') {
          throw new Error(
            '大喜利アプリのバックアップファイルではありません。'
          );
        }

        if (!Array.isArray(backup.events)) {
          throw new Error(
            'イベントデータが見つかりません。'
          );
        }

        if (!isValidEvents(backup.events)) {
          throw new Error(
            'イベントデータの形式が正しくありません。'
          );
        }

        resolve(backup.events);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(
        new Error(
          'バックアップファイルの読み込みに失敗しました。'
        )
      );
    };

    reader.readAsText(file);
  });
}

/**
 * イベントデータの最低限の形式を確認する
 */
function isValidEvents(
  events: unknown
): events is OogiriEvent[] {
  if (!Array.isArray(events)) {
    return false;
  }

  return events.every((event) => {
    if (
      !event ||
      typeof event !== 'object'
    ) {
      return false;
    }

    const e = event as OogiriEvent;

    return (
      typeof e.id === 'string' &&
      typeof e.name === 'string' &&
      typeof e.date === 'string' &&
      Array.isArray(e.questions)
    );
  });
}

/**
 * ファイル名用の日付
 * 例：2026-08-14-235900
 */
function formatDate(date: Date): string {
  const pad = (value: number) =>
    String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') +
    '-' +
    [
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join('');
}