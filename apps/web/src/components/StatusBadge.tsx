import React from 'react';

const toneClassName = {
  neutral: 'bg-slate-900/5 text-slate-600',
  success: 'bg-emerald-500/10 text-emerald-700',
  warning: 'bg-amber-500/10 text-amber-700',
  danger: 'bg-rose-500/10 text-rose-700',
};

export const StatusBadge = ({
  tone = 'neutral',
  children,
}: {
  tone?: keyof typeof toneClassName;
  children: React.ReactNode;
}) => {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClassName[tone]}`}>
      {children}
    </span>
  );
};
