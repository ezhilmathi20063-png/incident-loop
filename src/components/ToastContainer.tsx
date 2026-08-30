import React from 'react';
import { useIncidents } from '../context/IncidentContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useIncidents();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map(toast => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        let borderColor = 'border-emerald-500/40 bg-slate-900/95';

        if (toast.type === 'warning') {
          icon = <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
          borderColor = 'border-amber-500/40 bg-slate-900/95';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-cyan-400 shrink-0" />;
          borderColor = 'border-cyan-500/40 bg-slate-900/95';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md transition-all animate-slideUp ${borderColor}`}
          >
            {icon}
            <div className="flex-1 text-xs text-slate-200 leading-relaxed font-medium">
              {toast.text}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
