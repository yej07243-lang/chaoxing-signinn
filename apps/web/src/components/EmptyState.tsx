import React from 'react';

export const EmptyState = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className='rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center'>
      <h3 className='text-base font-semibold text-slate-900'>{title}</h3>
      <p className='mt-2 text-sm text-slate-500'>{description}</p>
    </div>
  );
};
