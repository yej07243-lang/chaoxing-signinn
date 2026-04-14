import React from 'react';

export const ToastViewport = ({
  toasts,
  onDismiss
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) => {
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <article key={toast.id} className={`toast-item toast-item--${toast.tone || 'info'}`}>
          <div className="toast-copy">
            <p className="toast-title">{toast.title}</p>
            {toast.message ? <p className="toast-message">{toast.message}</p> : null}
          </div>
          <button type="button" className="toast-close" onClick={() => onDismiss(toast.id)}>
            关闭
          </button>
        </article>
      ))}
    </div>
  );
};
