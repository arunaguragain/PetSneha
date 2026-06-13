import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const confirm = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) => {
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
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1E293B]/60 px-4 backdrop-blur-sm transition-all duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={config.onCancel} className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#475569] transition p-1">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: 'Literata, serif' }}>{config.title}</h3>
            <p className="text-sm text-[#475569] mb-8 leading-relaxed">{config.message}</p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={config.onCancel} 
                className="flex-1 px-4 py-3 text-sm font-semibold text-[#475569] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-xl transition"
              >
                {config.cancelText}
              </button>
              <button 
                onClick={config.onConfirm} 
                className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl transition shadow-sm ${config.variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0046CE] hover:bg-[#003DA8]'}`}
              >
                {config.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
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
