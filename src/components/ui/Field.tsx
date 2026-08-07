import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function TextField({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-muted mb-1.5 tracking-wide">{label}</span>
      <input
        {...props}
        className="w-full h-12 px-4 rounded-2xl bg-surface-2 border-2 border-transparent focus:border-accent focus:bg-surface outline-none text-ink text-sm font-medium transition placeholder:text-faint"
      />
      {hint && <span className="block text-[11px] text-faint mt-1">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: { label: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="block text-xs font-bold text-muted mb-1.5 tracking-wide">{label}</span>
      <textarea
        {...props}
        className="w-full min-h-24 px-4 py-3 rounded-2xl bg-surface-2 border-2 border-transparent focus:border-accent focus:bg-surface outline-none text-ink text-sm font-medium transition placeholder:text-faint resize-none"
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  className = '',
  ...props
}: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-12 rounded-2xl bg-primary text-white font-bold text-sm tracking-wide hover:bg-primary-dark active:scale-[0.98] transition disabled:opacity-40 disabled:active:scale-100 shadow-lg shadow-primary/20 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = '',
  ...props
}: { children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`h-11 rounded-2xl bg-surface-2 text-ink font-bold text-sm hover:bg-border active:scale-95 transition ${className}`}
    >
      {children}
    </button>
  );
}
