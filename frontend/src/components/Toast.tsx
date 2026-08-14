import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const styles = {
    success: 'bg-emerald-800 text-white',
    error: 'bg-red-800 text-white',
    info: 'bg-teal-900 text-white',
  };

  return (
    <div
      className={`flex items-center justify-between min-w-[300px] max-w-md p-4 rounded-lg shadow-xl animate-fade-in-up border border-white/10 ${styles[message.type]}`}
      role="alert"
    >
      <div className="flex items-center mr-3">
        {message.type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        )}
        <span className="text-sm font-medium">{message.text}</span>
      </div>
      <button
        onClick={() => onClose(message.id)}
        className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Cerrar notificación"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
