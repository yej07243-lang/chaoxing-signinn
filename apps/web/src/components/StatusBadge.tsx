import React from 'react';

const toneClassName = {
  neutral: 'border border-[color:var(--cx-border)] bg-white/70 text-[color:var(--cx-text-muted)]',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border border-rose-200 bg-rose-50 text-rose-700',
};

export const StatusBadge = ({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof toneClassName;
  children: React.ReactNode;
}) => {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneClassName[tone]}`}>
      {children}
    </span>
  );
};
