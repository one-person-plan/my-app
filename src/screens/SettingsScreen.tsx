import { useRef, useState } from 'react';
import { ArrowLeft, Download, Upload, Database, FileText } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { exportEvents, importEvents } from '@/lib/backup';
import { BottomSheet, ConfirmDialog } from '@/components/ui/Sheet';
import { PrimaryButton, GhostButton } from '@/components/ui/Field';
import { TemplateSettingsSheet } from '@/components/TemplateSettings';

export function SettingsScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const { events, restoreEvents } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [importSheetOpen, setImportSheetOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [templateSettingsOpen, setTemplateSettingsOpen] = useState(false);

  const handleExport = async () => {
    await exportEvents(events);
  };

  const handleSelectFile = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImportFile(file);
    setImportSheetOpen(true);

    // 同じファイルをもう一度選択できるようにする
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setErrorMessage('');

      const importedEvents = await importEvents(importFile);

      restoreEvents(importedEvents);

      setImportSheetOpen(false);
      setImportFile(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'バックアップの読み込みに失敗しました。'
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur-xl border-b border-border/70">
        <div className="px-3 h-14 flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink active:scale-90 transition"
            aria-label="戻る"
          >
            <ArrowLeft size={18} />
          </button>

          <h1 className="font-bold text-sm text-ink">
            設定
          </h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="px-4 pt-5 space-y-5">

          {/* データ管理 */}
          <section>
            <h2 className="px-1 mb-2 text-xs font-bold text-muted tracking-wide">
              データ管理
            </h2>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden">

              {/* バックアップ */}
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/50 active:bg-surface-2 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <Download size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-ink">
                    データをバックアップ
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    イベント・お題・回答をJSONファイルに保存します
                  </p>
                </div>
              </button>

              <div className="border-t border-border" />

              {/* 復元 */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/50 active:bg-surface-2 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center shrink-0">
                  <Upload size={18} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-bold text-ink">
                    データを復元
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    バックアップファイルからデータを復元します
                  </p>
                </div>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleSelectFile}
                className="hidden"
              />
            </div>
          </section>

          {/* X共有 */}
          <section>
            <h2 className="px-1 mb-2 text-xs font-bold text-muted tracking-wide">
              X共有
            </h2>
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setTemplateSettingsOpen(true)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/50 active:bg-surface-2 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-ink">
                    X共有テンプレート
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Xに投稿する文章のテンプレートを編集します
                  </p>
                </div>
              </button>
            </div>
          </section>

          {/* データについて */}
          <section>
            <h2 className="px-1 mb-2 text-xs font-bold text-muted tracking-wide">
              データについて
            </h2>

            <div className="bg-surface rounded-2xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-2 text-muted flex items-center justify-center shrink-0">
                  <Database size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-ink">
                    保存されているイベント
                  </p>
                  <p className="text-xs text-muted mt-1">
                    現在 {events.length} 件のイベントが保存されています。
                  </p>
                  <p className="text-[11px] text-faint mt-2 leading-relaxed">
                    大切なデータは定期的にバックアップしておくことをおすすめします。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {errorMessage && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
              {errorMessage}
            </div>
          )}

        </div>
      </div>

      {/* 復元確認 */}
      <BottomSheet
        open={importSheetOpen}
        onClose={() => {
          setImportSheetOpen(false);
          setImportFile(null);
        }}
        title="データを復元"
        footer={
          <div className="flex gap-3">
            <GhostButton
              className="flex-1"
              onClick={() => {
                setImportSheetOpen(false);
                setImportFile(null);
              }}
            >
              キャンセル
            </GhostButton>

            <PrimaryButton
              className="flex-[2]"
              onClick={handleImport}
            >
              復元する
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-3 pt-2">
          <div className="rounded-xl bg-gold-soft p-4">
            <p className="text-sm font-bold text-gold">
              ⚠ 現在のデータが置き換わります
            </p>

            <p className="text-xs text-muted mt-2 leading-relaxed">
              バックアップから復元すると、現在保存されているイベントデータが置き換わります。
              復元前に現在のデータをバックアップすることをおすすめします。
            </p>
          </div>

          {importFile && (
            <div className="rounded-xl bg-surface-2 p-3">
              <p className="text-xs text-muted">
                選択したファイル
              </p>
              <p className="text-sm font-bold text-ink mt-1 break-all">
                {importFile.name}
              </p>
            </div>
          )}
        </div>
      </BottomSheet>
      <TemplateSettingsSheet
        open={templateSettingsOpen}
        onClose={() => setTemplateSettingsOpen(false)}
      />
    </div>
  );
}