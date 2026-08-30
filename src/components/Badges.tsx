import React from 'react';
import type { IncidentCategory, IncidentStatus, IncidentSeverity } from '../types/incident';
import { AlertCircle, RefreshCw, CheckCircle2, Clock, Activity } from 'lucide-react';

export const CategoryBadge: React.FC<{ category: IncidentCategory; size?: 'sm' | 'md' }> = ({
  category,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  switch (category) {
    case 'error_thrown':
      return (
        <span className={`inline-flex items-center rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 ${sizeClasses}`}>
          <AlertCircle className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-rose-400'} />
          <span>Error Thrown</span>
        </span>
      );
    case 'silent_failure':
      return (
        <span className={`inline-flex items-center rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 ${sizeClasses}`}>
          <Activity className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-cyan-400'} />
          <span>Silent Failure</span>
        </span>
      );
    case 'recurring_debt':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 ${sizeClasses}`}>
          <RefreshCw className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-amber-400'} />
          <span>Recurring Debt</span>
        </span>
      );
    default:
      return null;
  }
};

export const StatusBadge: React.FC<{ status: IncidentStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md'
}) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  switch (status) {
    case 'open':
      return (
        <span className={`inline-flex items-center rounded-md bg-red-950/80 text-red-400 border border-red-800/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>Open</span>
        </span>
      );
    case 'investigating':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-950/60 text-amber-400 border border-amber-800/60 ${sizeClasses}`}>
          <Clock className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-amber-400'} />
          <span>Investigating</span>
        </span>
      );
    case 'resolved':
      return (
        <span className={`inline-flex items-center rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 ${sizeClasses}`}>
          <CheckCircle2 className={isSm ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5 text-emerald-400'} />
          <span>Resolved</span>
        </span>
      );
    default:
      return null;
  }
};

export const SeverityBadge: React.FC<{ severity: IncidentSeverity }> = ({ severity }) => {
  if (severity.startsWith('P1')) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-rose-950 text-rose-300 border border-rose-800/50">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
        {severity}
      </span>
    );
  }
  if (severity.startsWith('P2')) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-amber-950 text-amber-300 border border-amber-800/50">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        {severity}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      {severity}
    </span>
  );
};
