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
 *
 * Android Chromeなど対応ブラウザでは、
 * 保存先を選択して既存のバックアップファイルを上書きできます。
 * 非対応ブラウザでは通常のダウンロードにフォールバックします。
 */
export async function exportEvents(
    events: OogiriEvent[]
  ): Promise<void> {
    const backup: OogiriBackup = {
      app: 'oogiri',
      version: BACKUP_VERSION,
      exportedAt: Date.now(),
      events,
    };
  
    const json = JSON.stringify(backup, null, 2);
  
    // ファイル保存APIに対応している場合
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (
          window as Window & {
            showSaveFilePicker: (options?: {
              suggestedName?: string;
              types?: {
                description: string;
                accept: Record<string, string[]>;
              }[];
            }) => Promise<FileSystemFileHandle>;
          }
        ).showSaveFilePicker({
          suggestedName: 'oogiri-backup.json',
          types: [
            {
              description: '大喜利バックアップ',
              accept: {
                'application/json': ['.json'],
              },
            },
          ],
        });
  
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
  
        return;
      } catch (error) {
        // ユーザーが保存ダイアログをキャンセルした場合
        if (
          error instanceof DOMException &&
          error.name === 'AbortError'
        ) {
          return;
        }
  
        console.warn(
          'ファイル保存APIに失敗したため、通常のダウンロードに切り替えます。',
          error
        );
      }
    }
  
    // 非対応ブラウザ用のフォールバック
    const blob = new Blob([json], {
      type: 'application/json',
    });
  
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
  
    link.href = url;
    link.download = 'oogiri-backup.json';
  
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
