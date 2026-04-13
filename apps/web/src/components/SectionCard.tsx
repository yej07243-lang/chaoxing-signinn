import React from 'react';

export const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <section className='animate-rise rounded-[30px] border border-[color:var(--cx-border)] bg-[color:var(--cx-panel)] p-6 shadow-panel backdrop-blur'>
      <div className='mb-6'>
        <h2 className='font-display text-xl font-semibold text-[color:var(--cx-text)]'>{title}</h2>
        {description ? <p className='mt-2 text-sm leading-6 text-[color:var(--cx-text-muted)]'>{description}</p> : null}
      </div>
      {children}
    </section>
  );
};
