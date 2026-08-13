import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  MessageCircle,
  Quote,
  Camera,
  ChevronDown,
  ChevronRight,
  Hash,
  Clock,
  CalendarDays,
  Pencil,
  ImagePlus,
  X,
  Share2,
  Download,
  Settings,
  Star,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { fmtDate, isFuture } from '@/lib/date';
import { BottomSheet, ConfirmDialog } from '@/components/ui/Sheet';
import { TextField, TextArea, PrimaryButton, GhostButton } from '@/components/ui/Field';
import type { OogiriQuestion, OogiriAnswer } from '@/data/types';
import { loadTemplates, buildPostText, type Templates } from '@/lib/templates';
import { TemplateSettingsSheet } from '@/components/TemplateSettings';

export function EventDetailScreen({
  eventId,
  onBack,
  onOpenAnswer,
}: {
  eventId: string;
  onBack: () => void;
  onOpenAnswer: (question:
    OogiriQuestion
  ) => void;
}) {
  const { events, addQuestion, updateQuestion, deleteQuestion, addAnswer, updateAnswer, deleteAnswer, deleteEvent, toggleFavorite, updateEvent, } = useApp();
  const ev = events.find((e) => e.id === eventId);

  const [qSheet, setQSheet] = useState(false);
  const [qText, setQText] = useState('');
  const [qImage, setQImage] = useState<string | undefined>();
  const [editQuestionId, setEditQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editQuestionImage, setEditQuestionImage] = useState<string | undefined>();
  const [editSheet, setEditSheet] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editHashtag, setEditHashtag] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [answerSheet, setAnswerSheet] = useState<string | null>(null); // questionId
  const [ans, setAns] = useState({ answerer: '', text: '', impression: '' });
  const [editingAnswer, setEditingAnswer] = useState<{
    questionId: string;
    answerId: string;
  } | null>(null);  
  const [confirm, setConfirm] = useState<{ type: 'event' | 'question' | 'answer'; id: string } | null>(null);
  const [shareTarget, setShareTarget] = useState<{ question: OogiriQuestion; answer: OogiriAnswer } | null>(null);
  const [tplSettingsOpen, setTplSettingsOpen] = useState(false);
  const [templates, setTemplates] = useState<Templates>(() => loadTemplates());
  const reloadTemplates = () => setTemplates(loadTemplates());

  if (!ev) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted">イベントが見つかりません</p>
          <button onClick={onBack} className="text-primary font-bold mt-2 text-sm">
            戻る
          </button>
        </div>
      </div>
    );
  }

  const upcoming = isFuture(ev.date);
  const answerCount = ev.questions.reduce((s, q) => s + q.answers.length, 0);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    const openEditSheet = () => {
      const [start = '', end = ''] = ev.time?.split('〜') ?? [];
    
      setEditName(ev.name);
      setEditDate(ev.date);
      setEditStartTime(start);
      setEditEndTime(end);
      setEditHashtag(ev.hashtag ?? '');
      setEditSheet(true);
    };
    
    const submitEdit = () => {
      if (!editName.trim()) return;
    
      updateEvent(ev.id, {
        name: editName.trim(),
        date: editDate,
        time:
          editStartTime && editEndTime
            ? `${editStartTime}〜${editEndTime}`
            : undefined,
        hashtag: editHashtag.trim()
          ? editHashtag.trim().startsWith('#')
            ? editHashtag.trim()
            : `#${editHashtag.trim()}`
          : undefined,
      });
    
      setEditSheet(false);
    };
  
    const openQuestionEdit = (q: OogiriQuestion) => {
      setEditQuestionId(q.id);
      setEditQuestionText(q.text);
      setEditQuestionImage(q.imageUrl);
    };
  
  const submitQuestion = () => {
    if (!qText.trim() && !qImage) return;
    addQuestion(ev.id, qText.trim(), qImage);
    setQText('');
    setQImage(undefined);
    setQSheet(false);
  };

  const submitQuestionEdit = () => {
    if (!editQuestionId) return;
    if (!editQuestionText.trim() && !editQuestionImage) return;
  
    updateQuestion(ev.id, editQuestionId, {
      text: editQuestionText.trim(),
      imageUrl: editQuestionImage,
    });
  
    setEditQuestionId(null);
    setEditQuestionText('');
    setEditQuestionImage(undefined);
  };  

  const submitAnswer = () => {
    if (!answerSheet || !ans.text.trim()) return;
    addAnswer(ev.id, answerSheet, {
      answerer: ans.answerer.trim() || '自分',
      text: ans.text.trim(),
      impression: ans.impression.trim(),
    });
    setAns({ answerer: '', text: '', impression: '' });
    setAnswerSheet(null);
  };

  const submitEditAnswer = () => {
    if (!editingAnswer || !ans.text.trim()) return;
  
    updateAnswer(
      ev.id,
      editingAnswer.questionId,
      editingAnswer.answerId,
      {
        answerer: ans.answerer.trim() || '自分',
        text: ans.text.trim(),
        impression: ans.impression.trim(),
      }
    );
  
    setAns({ answerer: '', text: '', impression: '' });
    setEditingAnswer(null);
  };

  const onPickImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setQImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const header = (
    <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur-xl border-b border-border/70">
      <div className="px-3 h-14 flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink active:scale-90 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-sm text-ink truncate">{ev.name}</h1>
          <p className="text-[11px] text-faint font-medium">{fmtDate(ev.date)}</p>
        </div>
        <button
          onClick={openEditSheet}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-ink hover:text-primary active:scale-90 transition"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => setConfirm({ type: 'event', id: ev.id })}
          className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-error hover:text-error active:scale-90 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </header>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {header}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-4 pt-4 space-y-4">
          {/* meta card */}
          <div className="bg-surface rounded-2xl p-4 border border-border shadow-sm flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted font-medium">
              <CalendarDays size={14} className="text-primary" /> {fmtDate(ev.date)}
            </span>
            {ev.time && (
              <span className="flex items-center gap-1.5 text-muted font-medium">
                <Clock size={14} className="text-accent" /> {ev.time}
              </span>
            )}
            {ev.hashtag && (
              <span className="flex items-center gap-0.5 text-accent font-bold">
                <Hash size={13} /> {ev.hashtag.replace('#', '')}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-faint font-medium ml-auto">
              <MessageCircle size={13} /> お題{ev.questions.length} / 回答{answerCount}
            </span>
          </div>

          {upcoming && (
            <div className="rounded-2xl bg-gold-soft p-3.5 text-[12px] text-gold font-bold flex items-center gap-2">
              <Pencil size={14} /> 予定のイベント — お題を事前に登録できます
            </div>
          )}

          {/* questions */}
          <div className="flex items-center justify-between px-1">
            <h2 className="font-display font-extrabold text-base text-ink tracking-tight">お題一覧</h2>
            <button
              onClick={() => setQSheet(true)}
              className="flex items-center gap-1 text-xs font-bold text-white bg-primary px-3 h-8 rounded-full hover:bg-primary-dark active:scale-95 transition shadow-md shadow-primary/20"
            >
              <Plus size={14} strokeWidth={3} /> お題追加
            </button>
          </div>

          {ev.questions.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border-strong p-8 text-center">
              <MessageCircle size={32} className="text-faint mx-auto mb-2" />
              <p className="text-sm text-muted font-medium">お題がありません</p>
              <p className="text-xs text-faint mt-1">お題を追加して回答を記録しよう</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {ev.questions.map((q, i) => {
                const open = expanded.has(q.id);
                return (
                  <div key={q.id} className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden">
                    <button
                      onClick={() => toggle(q.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2/50 transition"
                    >
                      <span className="shrink-0 w-7 h-7 rounded-lg bg-primary-soft text-primary font-display font-extrabold text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-ink leading-snug">{q.text}</p>
                        {q.imageUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-accent font-bold mt-1">
                            <ImagePlus size={11} /> 画像あり
                          </span>
                        )}
                        <p className="text-[11px] text-faint font-medium mt-0.5">回答 {q.answers.length}件</p>
                      </div>
                      {open ? <ChevronDown size={18} className="text-faint shrink-0" /> : <ChevronRight size={18} className="text-faint shrink-0" />}
                    </button>

                    {open && (
                      <div className="px-4 pb-4 pt-1 border-t border-border space-y-2.5 animate-fade-in">
                        {q.imageUrl && (
                          <div className="relative rounded-xl overflow-hidden">
                            <img src={q.imageUrl} alt="お題画像" className="w-full max-h-48 object-cover" />
                          </div>
                        )}
                        {q.answers.length === 0 ? (
                          <p className="text-xs text-faint text-center py-3">回答を追加してください</p>
                        ) : (
                          q.answers.map((a) => (
                            <div key={a.id} className="rounded-xl bg-surface-2 p-3">
                              <div className="flex items-start gap-2">
                                <button
                                  onClick={() => toggleFavorite(ev.id, q.id, a.id)}
                                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-90 ${
                                    a.favorite
                                      ? 'bg-gold-soft text-gold'
                                      : 'bg-surface text-faint hover:text-gold hover:bg-gold-soft/60'
                                  }`}
                                  aria-label={a.favorite ? 'お気に入りを解除' : 'お気に入りに追加'}
                                >
                                  <Star size={16} fill={a.favorite ? 'currentColor' : 'none'} />
                                </button>
                                <button
                                  onClick={() => setShareTarget({ question: q, answer: a })}
                                  className="flex-1 min-w-0 text-left active:scale-[0.99] transition"
                                >
                                  <p className="font-bold text-sm text-ink leading-relaxed">「{a.text}」</p>
                                  <p className="text-[11px] text-muted mt-1.5 font-medium">{a.answerer}</p>
                                  {a.impression && (
                                    <div className="mt-2 pt-2 border-t border-border flex items-start gap-1.5">
                                      <Quote size={12} className="text-accent shrink-0 mt-0.5" />
                                      <p className="text-xs text-muted italic leading-relaxed">{a.impression}</p>
                                    </div>
                                  )}
                                  <span className="inline-flex items-center gap-1 text-[10px] text-accent font-bold mt-2.5">
                                    <Share2 size={11} /> タップしてXに共有
                                  </span>
                                </button>
                              </div>
                             <div className="flex justify-end gap-1 mt-1.5 pt-1.5 border-t border-border">
                              <button
                                 onClick={() => {
                                  setAns({
                                    answerer: a.answerer,
                                    text: a.text,
                                    impression: a.impression ?? '',
                                  });
                                  setEditingAnswer({
                                   questionId: q.id,
                                   answerId: a.id,
                                  });
                                }}
                               className="text-faint hover:text-primary transition p-1"
                               aria-label="回答を編集"
                              >
                               <Pencil size={14} />
                              </button>

                              <button
                                onClick={() => setConfirm({ type: 'answer', id: a.id })}
                                className="text-faint hover:text-error transition p-1"
                                aria-label="回答を削除"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            </div>
                          ))
                        )}
                        <button
                          onClick={() => onOpenAnswer(q)}
                          className="w-full h-10 rounded-xl bg-primary text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-primary-dark active:scale-95 transition shadow-md shadow-primary/20"
                          >
                          <MessageCircle size={14} />
                          このお題で答える
                        </button>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => openQuestionEdit(q)}
                            className="flex-1 h-10 rounded-xl bg-surface-2 text-muted font-bold text-xs flex items-center justify-center gap-1 hover:text-primary active:scale-95 transition"
                          >
                            <Pencil size={14} />
                            お題を編集
                          </button>

                          <button
                            onClick={() => {
                             setAnswerSheet(q.id);
                             setAns({ answerer: '', text: '', impression: '' });
                            }}
                            className="flex-1 h-10 rounded-xl bg-primary-soft text-primary font-bold text-xs flex items-center justify-center gap-1 hover:brightness-95 active:scale-95 transition"
                          >
                           <Plus size={14} strokeWidth={3} />
                           回答を追加
                          </button>

                          <button
                            onClick={() => setConfirm({ type: 'question', id: q.id })}
                            className="w-10 h-10 rounded-xl bg-surface-2 text-faint hover:text-error flex items-center justify-center transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* edit event sheet */}
      <BottomSheet
        open={editSheet}
        onClose={() => setEditSheet(false)}
        title="イベントを編集"
        footer={
          <div className="flex gap-3">
            <GhostButton className="flex-1" onClick={() => setEditSheet(false)}>
              キャンセル
            </GhostButton>
            <PrimaryButton
              className="flex-[2]"
              onClick={submitEdit}
              disabled={!editName.trim()}
            >
              保存する
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <TextField
            label="会名"
            placeholder="例：月イチ大喜利会"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />

          <TextField
            label="日付"
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />

          <div>
            <span className="block text-xs font-bold text-muted mb-1.5 tracking-wide">
              時間
            </span>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="flex-1 h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink"
              />
              <span className="text-muted font-bold">〜</span>
              <input
                type="time"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="flex-1 h-11 rounded-xl border border-border bg-surface px-3 text-sm text-ink"
              />
            </div>
          </div>

          <TextField
            label="ハッシュタグ"
            placeholder="例：#月イチ大喜利"
            value={editHashtag}
            onChange={(e) => setEditHashtag(e.target.value)}
            hint="※任意。# は自動で付きます"
          />
        </div>
      </BottomSheet>

      <BottomSheet
       open={editQuestionId !== null}
       onClose={() => setEditQuestionId(null)}
       title="お題を編集"
       footer={
          <div className="flex gap-3">
            <GhostButton
              className="flex-1"
              onClick={() => setEditQuestionId(null)}
            >
              キャンセル
            </GhostButton>

            <PrimaryButton
              className="flex-[2]"
              onClick={submitQuestionEdit}
              disabled={!editQuestionText.trim() && !editQuestionImage}
            >
              保存する
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <TextArea
            label="お題テキスト"
            placeholder="例：コンビニで一番売れてはいけないもの"
            value={editQuestionText}
            onChange={(e) => setEditQuestionText(e.target.value)}
          />

          <div>
            <span className="block text-xs font-bold text-muted mb-1.5 tracking-wide">
              お題画像（任意）
            </span>

            {editQuestionImage ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={editQuestionImage}
                  alt="プレビュー"
                  className="w-full max-h-48 object-cover"
                />

                <button
                  onClick={() => setEditQuestionImage(undefined)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/60 text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 h-32 rounded-2xl border-2 border-dashed border-border-strong cursor-pointer hover:bg-surface-2 transition">
                <Camera size={24} className="text-faint" />

                <span className="text-xs text-muted font-medium">
                  カメラ撮影 / 写真アップロード
                </span>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setEditQuestionImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
         </div>
        </div>
      </BottomSheet>

      {/* add question sheet */}
      <BottomSheet
        open={qSheet}
        onClose={() => setQSheet(false)}
        title="お題を追加"
        footer={
          <div className="flex gap-3">
            <GhostButton className="flex-1" onClick={() => setQSheet(false)}>
              キャンセル
            </GhostButton>
            <PrimaryButton className="flex-[2]" onClick={submitQuestion} disabled={!qText.trim() && !qImage}>
              追加する
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <TextArea
            label="お題テキスト"
            placeholder="例：コンビニで一番売れてはいけないもの"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
          />
          <div>
            <span className="block text-xs font-bold text-muted mb-1.5 tracking-wide">お題画像（任意）</span>
            {qImage ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={qImage} alt="プレビュー" className="w-full max-h-48 object-cover" />
                <button
                  onClick={() => setQImage(undefined)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/60 text-white flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 h-32 rounded-2xl border-2 border-dashed border-border-strong cursor-pointer hover:bg-surface-2 transition">
                <Camera size={24} className="text-faint" />
                <span className="text-xs text-muted font-medium">カメラ撮影 / 写真アップロード</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onPickImage(e.target.files[0])}
                />
              </label>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* edit answer sheet */}
      <BottomSheet
        open={editingAnswer !== null}
        onClose={() => {
         setEditingAnswer(null);
         setAns({ answerer: '', text: '', impression: '' });
        }}
        title="回答を編集"
        footer={
         <div className="flex gap-3">
           <GhostButton
             className="flex-1"
             onClick={() => {
              setEditingAnswer(null);
              setAns({ answerer: '', text: '', impression: '' });
             }}
           >
             キャンセル
           </GhostButton>

           <PrimaryButton
             className="flex-[2]"
             onClick={submitEditAnswer}
             disabled={!ans.text.trim()}
           >
             保存する
           </PrimaryButton>
         </div>
       }
     >
       <div className="space-y-4 pt-2">
         <TextField
           label="回答者名"
           placeholder="例：山田"
           value={ans.answerer}
           onChange={(e) =>
             setAns((a) => ({
               ...a,
               answerer: e.target.value,
             }))
           }
           hint="※任意。省略すると「自分」になります"
         />

        <TextArea
          label="回答"
          placeholder="例：明日の自分への謝罪文"
          value={ans.text}
          onChange={(e) =>
            setAns((a) => ({
              ...a,
              text: e.target.value,
            }))
          }
        />

        <div>
          <TextArea
            label="自分の感想（しがみ）"
            placeholder="例：刺さった。企画に困ったら使い回せそう。"
            value={ans.impression}
            onChange={(e) =>
              setAns((a) => ({
                ...a,
                impression: e.target.value,
              }))
            }
          />
          <span className="block text-[11px] text-faint mt-1">
            ※任意。あとで見返したときのヒントに
          </span>
        </div>
       </div>
      </BottomSheet>

      {/* add answer sheet */}
      <BottomSheet
        open={answerSheet !== null}
        onClose={() => setAnswerSheet(null)}
        title="しがみたい回答を追加"
        footer={
          <div className="flex gap-3">
            <GhostButton className="flex-1" onClick={() => setAnswerSheet(null)}>
              キャンセル
            </GhostButton>
            <PrimaryButton className="flex-[2]" onClick={submitAnswer} disabled={!ans.text.trim()}>
              保存する
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-4 pt-2">
          <TextField
            label="回答者名"
            placeholder="例：山田"
            value={ans.answerer}
            onChange={(e) => setAns((a) => ({ ...a, answerer: e.target.value }))}
            hint="※任意。省略すると「自分」になります"
          />
          <TextArea
            label="回答"
            placeholder="例：明日の自分への謝罪文"
            value={ans.text}
            onChange={(e) => setAns((a) => ({ ...a, text: e.target.value }))}
          />
          <div>
            <TextArea
              label="自分の感想（しがみ）"
              placeholder="例：刺さった。企画に困ったら使い回せそう。"
              value={ans.impression}
              onChange={(e) => setAns((a) => ({ ...a, impression: e.target.value }))}
            />
            <span className="block text-[11px] text-faint mt-1">※任意。あとで見返したときのヒントに</span>
          </div>
        </div>
      </BottomSheet>

      {/* share to X sheet */}
      <BottomSheet
        open={shareTarget !== null}
        onClose={() => setShareTarget(null)}
        title="Xに共有する"
        footer={
          <div className="flex gap-3">
            <GhostButton className="flex-1" onClick={() => setShareTarget(null)}>
              閉じる
            </GhostButton>
            <PrimaryButton
              className="flex-[2]"
              onClick={() => {
                if (!shareTarget) return;
                const { question: q, answer: a } = shareTarget;
                const postText = buildPostText(
                  q.imageUrl ? templates.imageTemplate : templates.textTemplate,
                  { question: q.text, name: a.answerer, answer: a.text, hashtag: ev.hashtag }
                );
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`, '_blank');
              }}
            >
              Xの投稿画面を開く
            </PrimaryButton>
          </div>
        }
      >
        {shareTarget && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold text-muted tracking-wide">投稿文プレビュー</span>
              <button
                onClick={() => setTplSettingsOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent-soft px-2.5 h-7 rounded-full hover:brightness-95 active:scale-95 transition"
              >
                <Settings size={12} /> テンプレート編集
              </button>
            </div>
            <div className="rounded-2xl bg-surface-2 p-4 border border-border">
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {buildPostText(
                  shareTarget.question.imageUrl ? templates.imageTemplate : templates.textTemplate,
                  { question: shareTarget.question.text, name: shareTarget.answer.answerer, answer: shareTarget.answer.text, hashtag: ev.hashtag }
                )}
              </p>
            </div>

            {shareTarget.question.imageUrl && (
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden border border-border">
                  <img src={shareTarget.question.imageUrl} alt="お題画像" className="w-full max-h-56 object-cover" />
                </div>
                <div className="rounded-2xl bg-gold-soft p-3.5 text-[12px] text-gold font-bold leading-relaxed">
                  画像をダウンロードして、Xの投稿画面で添付してください。
                </div>
                <GhostButton
                  className="w-full"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = shareTarget.question.imageUrl!;
                    link.download = `oogiri-${shareTarget.answer.answerer}.png`;
                    link.click();
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Download size={16} /> お題画像をダウンロード
                  </span>
                </GhostButton>
              </div>
            )}

            <div className="rounded-2xl bg-surface-2 p-3.5 space-y-1.5 text-[11px]">
              <p className="text-faint font-bold tracking-wide">共有データ</p>
              <p className="text-muted"><span className="text-ink font-bold">お題：</span>{shareTarget.question.text}</p>
              <p className="text-muted"><span className="text-ink font-bold">回答者：</span>{shareTarget.answer.answerer}</p>
              <p className="text-muted"><span className="text-ink font-bold">回答：</span>「{shareTarget.answer.text}」</p>
              {ev.hashtag && <p className="text-muted"><span className="text-ink font-bold">ハッシュタグ：</span>{ev.hashtag}</p>}
            </div>
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        open={confirm !== null}
        message={
          confirm?.type === 'event'
            ? 'このイベント全体を削除しますか？お題・回答もすべて消えます。'
            : confirm?.type === 'question'
            ? 'このお題と、登録された回答をすべて削除しますか？'
            : 'この回答を削除しますか？'
        }
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.type === 'event') {
            deleteEvent(ev.id);
            onBack();
          } else if (confirm.type === 'question') {
            deleteQuestion(ev.id, confirm.id);
            setExpanded((prev) => {
              const next = new Set(prev);
              next.delete(confirm.id);
              return next;
            });
          } else {
            const qid = ev.questions.find((q) => q.answers.some((a) => a.id === confirm.id))?.id;
            if (qid) deleteAnswer(ev.id, qid, confirm.id);
          }
          setConfirm(null);
        }}
      />

      <TemplateSettingsSheet
        open={tplSettingsOpen}
        onClose={() => {
          setTplSettingsOpen(false);
          reloadTemplates();
        }}
      />
    </div>
  );
}
