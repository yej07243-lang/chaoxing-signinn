import React from 'react';

export const EmptyState = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className='rounded-[26px] border border-dashed border-[color:var(--cx-border)] bg-white/45 px-6 py-10 text-center'>
      <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--cx-accent-soft)] text-lg text-[color:var(--cx-accent)]'>
        ○
      </div>
      <h3 className='font-display mt-5 text-2xl font-semibold text-[color:var(--cx-text)]'>{title}</h3>
      <p className='mt-2 text-sm leading-6 text-[color:var(--cx-text-muted)]'>{description}</p>
    </div>
  );
};
