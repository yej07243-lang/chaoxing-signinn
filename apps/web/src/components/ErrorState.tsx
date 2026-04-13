import React from 'react';

export const ErrorState = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className='rounded-[26px] border border-rose-200 bg-rose-50 px-6 py-10 text-center'>
      <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-xl text-rose-600'>
        !
      </div>
      <h3 className='font-display mt-5 text-2xl font-semibold text-rose-900'>{title}</h3>
      <p className='mt-2 text-sm leading-6 text-rose-700'>{description}</p>
    </div>
  );
};
