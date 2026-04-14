import React from 'react';

export const StatCard = ({
  label,
  value,
  description,
  tone = 'default'
}: {
  label: string;
  value: string;
  description: string;
  tone?: 'default' | 'blue' | 'teal' | 'pink';
}) => {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="stat-description">{description}</p>
    </article>
  );
};
