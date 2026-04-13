import React from 'react';

export const SectionHeader = ({
  eyebrow,
  title,
  description,
  aside,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
}) => {
  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
      <div>
        <p className='cx-pretitle'>{eyebrow}</p>
        <h1 className='font-display mt-3 text-4xl font-semibold leading-none text-[color:var(--cx-text)] sm:text-5xl'>
          {title}
        </h1>
        {description ? (
          <p className='mt-4 max-w-2xl text-sm leading-6 text-[color:var(--cx-text-muted)]'>{description}</p>
        ) : null}
      </div>
      {aside ? <div className='flex flex-wrap gap-3'>{aside}</div> : null}
    </div>
  );
};
