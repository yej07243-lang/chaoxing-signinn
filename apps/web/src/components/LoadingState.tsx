import React from 'react';

export const LoadingState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className='cx-surface px-6 py-10 text-center'>
      <div className='mx-auto h-12 w-12 animate-pulse rounded-full bg-[color:var(--cx-accent-soft)]' />
      <h3 className='font-display mt-5 text-2xl font-semibold text-[color:var(--cx-text)]'>{title}</h3>
      <p className='mt-2 text-sm leading-6 text-[color:var(--cx-text-muted)]'>{description}</p>
    </div>
  );
};
