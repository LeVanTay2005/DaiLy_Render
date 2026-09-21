import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationItem {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setNotifications(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeNotification(id);
    }, 4500);
  }, [removeNotification]);

  const success = useCallback((message: string) => showNotification(message, 'success'), [showNotification]);
  const error = useCallback((message: string) => showNotification(message, 'error'), [showNotification]);
  const info = useCallback((message: string) => showNotification(message, 'info'), [showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, info }}>
      {children}
      {/* Toast Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {notifications.map(item => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              item.type === 'success'
                ? 'bg-emerald-900/95 text-emerald-50 border-emerald-700/50 shadow-emerald-950/20'
                : item.type === 'error'
                ? 'bg-rose-950/95 text-rose-50 border-rose-800/50 shadow-rose-950/20'
                : 'bg-zinc-900/95 text-zinc-100 border-zinc-700/50 shadow-zinc-950/30'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <p className="text-sm font-medium leading-relaxed flex-1">{item.message}</p>
            <button
              onClick={() => removeNotification(item.id)}
              className="shrink-0 text-zinc-400 hover:text-white transition-colors p-0.5 rounded"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
