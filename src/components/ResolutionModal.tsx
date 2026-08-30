import React, { useState, useEffect } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { 
  X, 
  CheckCircle2, 
  Zap, 
  Search, 
  GitPullRequest, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';

export const ResolutionModal: React.FC = () => {
  const { resolutionModal, closeResolutionModal, resolveIncident } = useIncidents();
  const { isOpen, mode, incident, matchedIncident } = resolutionModal;

  const [rootCause, setRootCause] = useState('');
  const [fixDescription, setFixDescription] = useState('');
  const [fixPrUrl, setFixPrUrl] = useState('');
  const [resolutionVerified, setResolutionVerified] = useState(true);
  const [resolvedBy, setResolvedBy] = useState('oncall-engineer@org.internal');

  // Initialize or prefill fields whenever modal opens or mode changes
  useEffect(() => {
    if (isOpen && incident) {
      if (mode === 'previous_fix' && matchedIncident) {
        setRootCause(matchedIncident.root_cause || '');
        setFixDescription(matchedIncident.fix_description || '');
        setFixPrUrl(matchedIncident.fix_pr_url || 'https://github.com/org/repo/pull/589');
        setResolutionVerified(true);
      } else {
        setRootCause('');
        setFixDescription('');
        setFixPrUrl('');
        setResolutionVerified(true);
      }
    }
  }, [isOpen, mode, incident, matchedIncident]);

  if (!isOpen || !incident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCause.trim() || !fixDescription.trim()) return;

    resolveIncident(incident.id, {
      root_cause: rootCause,
      fix_description: fixDescription,
      fix_pr_url: fixPrUrl.trim() ? fixPrUrl : undefined,
      resolution_verified: resolutionVerified,
      resolved_by: resolvedBy
    });
  };

  const isPrefilled = mode === 'previous_fix';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isPrefilled ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}>
              {isPrefilled ? <Zap className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isPrefilled ? 'Apply Previous Fix to Incident' : 'Document New Incident Resolution'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Target: <span className="text-cyan-400 font-semibold">{incident.id}</span> ({incident.service})
              </p>
            </div>
          </div>

          <button
            onClick={closeResolutionModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {isPrefilled && matchedIncident && (
            <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-slate-300">
                <span className="font-semibold text-cyan-300">Memory Template Loaded from {matchedIncident.id}: </span>
                Root cause and fix steps have been prefilled based on past verified success. You can edit any details before finalizing.
              </div>
            </div>
          )}

          {/* Root Cause */}
          <div className="space-y-1.5">
            <label className="block font-mono uppercase text-slate-300 text-[11px] font-medium">
              Verified Root Cause <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Describe the underlying failure mechanism (e.g. unhandled connection pool leak on client abort)..."
              className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 leading-relaxed font-sans text-xs"
            />
          </div>

          {/* Fix Description */}
          <div className="space-y-1.5">
            <label className="block font-mono uppercase text-slate-300 text-[11px] font-medium">
              Fix Description & Remediation Actions <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={fixDescription}
              onChange={(e) => setFixDescription(e.target.value)}
              placeholder="Detail the applied fix, configuration change, or architectural patch..."
              className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 leading-relaxed font-sans text-xs"
            />
          </div>

          {/* PR / Patch Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-mono uppercase text-slate-300 text-[11px] font-medium flex items-center gap-1">
                <GitPullRequest className="w-3.5 h-3.5 text-slate-400" />
                <span>Pull Request / Patch URL (Optional)</span>
              </label>
              <input
                type="text"
                value={fixPrUrl}
                onChange={(e) => setFixPrUrl(e.target.value)}
                placeholder="https://github.com/org/repo/pull/..."
                className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-mono uppercase text-slate-300 text-[11px] font-medium flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Verified By</span>
              </label>
              <input
                type="text"
                value={resolvedBy}
                onChange={(e) => setResolvedBy(e.target.value)}
                placeholder="developer@org.internal"
                className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Confirm Outcome Verified Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={resolutionVerified}
                onChange={(e) => setResolutionVerified(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-cyan-600 focus:ring-cyan-500 bg-slate-900 cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                  <span>Confirm Outcome Verified</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Recommended
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Mark this solution as tested and verified healthy in production so it can be safely recommended for future matching.
                </div>
              </div>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeResolutionModal}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 border border-emerald-400/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Mark Resolved</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
