import React, { createContext, useContext, useMemo, useState } from 'react';
import { Toast } from '../components/ui';

const ToastContext = createContext(null);

let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const addToast = (message, type = 'success', title = '') => {
    const id = nextToastId++;
    setToasts((current) => [...current, { id, message, type, title }]);
    window.setTimeout(() => removeToast(id), 3500);
    return id;
  };

  const value = useMemo(() => ({ addToast, removeToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast title={toast.title} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}