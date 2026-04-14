import React from 'react';

export const Section = ({
  title,
  description,
  action,
  children
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <section className="panel-section">
      <div className="panel-section-head">
        <div>
          <h3 className="panel-section-title">{title}</h3>
          {description ? <p className="panel-section-copy">{description}</p> : null}
        </div>
        {action ? <div className="panel-section-action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
};
