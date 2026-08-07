import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function BottomSheet({ open, onClose, title, children, footer }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true">
      <button
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
      />
      <div className="relative bg-surface w-full max-h-[88%] flex flex-col rounded-t-3xl border-t border-border-strong animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border-strong mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
          <h2 className="text-base font-bold text-ink font-display tracking-tight mt-2">{title}</h2>
          <button
            onClick={onClose}
            className="mt-2 w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-muted hover:bg-border active:scale-90 transition"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-5 pb-3 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border bg-surface/95 backdrop-blur shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmProps {
  open: boolean;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, message, confirmLabel = '削除する', onConfirm, onCancel }: ConfirmProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-8" role="alertdialog" aria-modal="true">
      <button className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative bg-surface rounded-3xl p-6 w-full max-w-xs text-center animate-scale-in shadow-2xl">
        <p className="text-sm text-ink leading-relaxed mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-2xl bg-surface-2 text-ink font-bold text-sm hover:bg-border active:scale-95 transition"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-2xl bg-error text-white font-bold text-sm hover:brightness-95 active:scale-95 transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
