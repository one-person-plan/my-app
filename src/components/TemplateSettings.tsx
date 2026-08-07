import { useEffect, useState } from 'react';
import { Settings, RotateCcw, Check, Image as ImageIcon, FileText } from 'lucide-react';
import {
  loadTemplates,
  saveTemplates,
  defaultTemplates,
  buildPostText,
  PLACEHOLDERS,
  type Templates,
} from '@/lib/templates';
import { BottomSheet } from '@/components/ui/Sheet';
import { PrimaryButton, GhostButton } from '@/components/ui/Field';

const SAMPLE = {
  question: 'コンビニで一番売れてはいけないもの',
  name: '山田',
  answer: '明日の自分への謝罪文',
  hashtag: '#月イチ大喜利',
};

function PlaceholderChips({ onInsert }: { onInsert: (p: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(PLACEHOLDERS).map(([token, label]) => (
        <button
          key={token}
          onClick={() => onInsert(token)}
          className="px-2.5 h-7 rounded-full bg-accent-soft text-accent-dark text-[11px] font-bold flex items-center gap-1 hover:brightness-95 active:scale-95 transition"
        >
          {token} <span className="text-accent/60 font-medium">→ {label}</span>
        </button>
      ))}
    </div>
  );
}

function TemplateEditor({
  icon,
  title,
  value,
  onChange,
  onInsert,
  preview,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  onChange: (v: string) => void;
  onInsert: (p: string) => void;
  preview: string;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary-soft text-primary flex items-center justify-center shrink-0">
          {icon}
        </div>
        <h3 className="font-bold text-sm text-ink">{title}</h3>
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-20 px-4 py-3 rounded-2xl bg-surface-2 border-2 border-transparent focus:border-accent focus:bg-surface outline-none text-ink text-sm font-medium transition resize-none leading-relaxed"
        />
      </div>
      <PlaceholderChips onInsert={onInsert} />
      <div>
        <p className="text-[10px] font-bold text-faint mb-1.5 tracking-wide">プレビュー</p>
        <div className="rounded-xl bg-surface border border-border p-3">
          <p className="text-sm text-ink leading-relaxed">{preview}</p>
        </div>
      </div>
    </div>
  );
}

export function TemplateSettingsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tpl, setTpl] = useState<Templates>(defaultTemplates());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setTpl(loadTemplates());
      setSaved(false);
    }
  }, [open]);

  const insertInto = (field: keyof Templates, token: string) => {
    setTpl((t) => ({ ...t, [field]: t[field] + token }));
    setSaved(false);
  };

  const save = () => {
    saveTemplates(tpl);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const reset = () => {
    setTpl(defaultTemplates());
    setSaved(false);
  };

  const textPreview = buildPostText(tpl.textTemplate, SAMPLE);
  const imagePreview = buildPostText(tpl.imageTemplate, SAMPLE);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="X共有テンプレート設定"
      footer={
        <div className="flex gap-3">
          <GhostButton className="flex-1" onClick={reset}>
            <span className="flex items-center justify-center gap-1.5">
              <RotateCcw size={15} /> リセット
            </span>
          </GhostButton>
          <PrimaryButton className="flex-[2]" onClick={save}>
            <span className="flex items-center justify-center gap-1.5">
              {saved ? <Check size={16} /> : null}
              {saved ? '保存しました' : '保存する'}
            </span>
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-6 pt-2">
        <div className="rounded-2xl bg-accent-soft p-3.5 text-[11px] text-accent-dark font-medium leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-1.5">
            <Settings size={13} /> 使い方
          </p>
          下のタグをタップすると文章に挿入されます。共有時に自動で記録データに置き換わります。
        </div>

        <TemplateEditor
          icon={<FileText size={15} strokeWidth={2.5} />}
          title="画像なし用テンプレート"
          value={tpl.textTemplate}
          onChange={(v) => {
            setTpl((t) => ({ ...t, textTemplate: v }));
            setSaved(false);
          }}
          onInsert={(p) => insertInto('textTemplate', p)}
          preview={textPreview}
        />

        <div className="h-px bg-border" />

        <TemplateEditor
          icon={<ImageIcon size={15} strokeWidth={2.5} />}
          title="画像あり用テンプレート"
          value={tpl.imageTemplate}
          onChange={(v) => {
            setTpl((t) => ({ ...t, imageTemplate: v }));
            setSaved(false);
          }}
          onInsert={(p) => insertInto('imageTemplate', p)}
          preview={imagePreview}
        />
      </div>
    </BottomSheet>
  );
}
