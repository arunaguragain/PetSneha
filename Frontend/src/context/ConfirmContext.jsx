import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { Modal, Button } from '../components/ui';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const confirm = useCallback((options) => {
    const normalized = typeof options === 'string' ? { message: options } : (options || {});
    const { title = 'Confirm', message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' } = normalized;

    return new Promise((resolve) => {
      setConfig({
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          setIsOpen(false);
          resolve(true);
        },
        onCancel: () => {
          setIsOpen(false);
          resolve(false);
        }
      });
      setIsOpen(true);
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Modal open={isOpen} onClose={config.onCancel} size="sm" title={config.title}>
        <div className="px-6 pb-6">
          {config.message ? (
            <div className={`mb-8 rounded-xl p-4 text-sm leading-relaxed ${config.variant === 'danger' ? 'flex items-start gap-3 bg-red-50 text-red-900' : 'bg-[#F8FAFC] text-[#475569]'}`}>
              {config.variant === 'danger' ? (
                <>
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <p>{config.message}</p>
                </>
              ) : (
                <p>{config.message}</p>
              )}
            </div>
          ) : null}
          <div className="mt-8 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={config.onCancel}>
              {config.cancelText}
            </Button>
            <Button
              type="button"
              onClick={config.onConfirm}
              variant={config.variant === 'danger' ? 'danger' : 'primary'}
              className={config.variant === 'danger' ? 'bg-danger text-white' : 'bg-[#0046CE] text-white hover:bg-blue-700 shadow-sm'}
            >
              {config.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
