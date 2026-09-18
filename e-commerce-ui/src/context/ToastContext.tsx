import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from '../components/ui/Icon';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="live" aria-live="assertive">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
            <Icon
              name={
                t.type === 'success'
                  ? 'check-circle'
                  : t.type === 'error'
                  ? 'alert-circle'
                  : 'shopping-bag'
              }
              size={18}
              style={{
                color:
                  t.type === 'success'
                    ? 'var(--success)'
                    : t.type === 'error'
                    ? 'var(--danger)'
                    : 'var(--primary)',
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.message}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(t.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginLeft: 'auto',
                padding: '2px',
                color: 'var(--text-light)',
              }}
              aria-label="Close notification"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
