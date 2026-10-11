import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  tipo: 'sucesso' | 'erro' | 'info';
  texto: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    sucesso: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    erro: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
  };

  const borderStyles = {
    sucesso: 'border-emerald-200 bg-emerald-50/90 text-emerald-900',
    erro: 'border-rose-200 bg-rose-50/90 text-rose-900',
    info: 'border-sky-200 bg-sky-50/90 text-sky-900',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-md w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all ${borderStyles[toast.tipo]}`}
      >
        {icons[toast.tipo]}
        <div className="flex-1 text-sm font-medium leading-relaxed pt-0.5">
          {toast.texto}
        </div>
        <button
          onClick={onClose}
          aria-label="Fechar notificação"
          className="text-slate-400 hover:text-slate-700 transition-colors p-1 -mr-1 -mt-1 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
