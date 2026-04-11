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
    <section className='rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-panel backdrop-blur animate-rise'>
      <div className='mb-6'>
        <h2 className='text-lg font-semibold text-slate-900'>{title}</h2>
        {description ? <p className='mt-2 text-sm text-slate-500'>{description}</p> : null}
      </div>
      {children}
    </section>
  );
};
