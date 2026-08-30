import React, { useState } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { CategoryBadge, StatusBadge, SeverityBadge } from './Badges';
import { 
  Zap, 
  Search, 
  ArrowLeft, 
  CheckCircle2, 
  GitPullRequest, 
  AlertCircle, 
  Copy, 
  Check, 
  Sparkles, 
  UserCheck, 
  FileCode
} from 'lucide-react';

export const MatchView: React.FC = () => {
  const { 
    incidents, 
    selectedIncidentId, 
    setSelectedIncidentId, 
    setActiveTab, 
    openResolutionModal, 
    getIncidentById 
  } = useIncidents();

  const [copiedTrace, setCopiedTrace] = useState(false);

  // Find the selected incident or default to first open one
  const currentIncident = selectedIncidentId 
    ? getIncidentById(selectedIncidentId) || incidents[0]
    : incidents.find(i => i.status === 'open') || incidents[0];

  // Find its matched historical incident
  const matchedIncident = currentIncident?.matched_incident_id 
    ? getIncidentById(currentIncident.matched_incident_id) 
    : undefined;

  const handleCopyTrace = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTrace(true);
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  if (!currentIncident) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-xl">
        <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-white">No Incident Selected</h3>
        <p className="text-xs text-slate-400 mt-1">Please select an incident from the feed to review memory matching.</p>
        <button
          onClick={() => setActiveTab('feed')}
          className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const isResolved = currentIncident.status === 'resolved';

  return (
    <div className="space-y-6">
      {/* Top Header & Incident Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('feed')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Back to Incident Feed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-cyan-400">{currentIncident.id}</span>
              <span className="text-slate-700">|</span>
              <span className="font-semibold text-white text-base">{currentIncident.service}</span>
              <SeverityBadge severity={currentIncident.severity} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <CategoryBadge category={currentIncident.category} size="sm" />
              <StatusBadge status={currentIncident.status} size="sm" />
              <span className="text-[11px] text-slate-400 font-mono">
                Created: {new Date(currentIncident.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Switcher dropdown for switching active incident */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Switch Incident:</label>
          <select
            value={currentIncident.id}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-[#090d16] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer max-w-[220px] truncate"
          >
            {incidents.map(inc => (
              <option key={inc.id} value={inc.id}>
                {inc.id} - {inc.service} ({inc.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Human in the loop guidance alert */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-indigo-950/20 to-slate-900 border border-cyan-500/30 rounded-xl p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {isResolved 
                ? 'Incident Resolved & Stored in Organizational Memory'
                : 'Organizational Memory Match Found'}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {isResolved
                ? `This failure was diagnosed and verified. It is now part of the searchable organizational memory to accelerate future triage.`
                : `IncidentLoop does not hallucinate automated fixes. It retrieved the closest verified historical post-mortem with evidence breakdown. Review the match below and decide whether to adopt the proven solution or investigate a novel root cause.`}
            </p>
          </div>
        </div>

        {/* Top CTA Buttons if not resolved */}
        {!isResolved && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => openResolutionModal(currentIncident, 'previous_fix')}
              disabled={!matchedIncident}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Use Previous Fix</span>
            </button>
            <button
              onClick={() => openResolutionModal(currentIncident, 'investigate_new')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Investigate New</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Current Incident */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h3 className="text-sm font-semibold text-white">Current Incident (Incoming)</h3>
            </div>
            <span className="font-mono text-xs text-rose-400 font-semibold">{currentIncident.id}</span>
          </div>

          <div className="p-5 space-y-4 flex-1">
            {/* Service & Endpoint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#070b13] p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Service</span>
                <p className="font-mono font-semibold text-slate-200 text-xs mt-0.5">{currentIncident.service}</p>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase">Endpoint</span>
                <p className="font-mono font-semibold text-cyan-400 text-xs mt-0.5 truncate" title={currentIncident.endpoint}>
                  {currentIncident.endpoint}
                </p>
              </div>
            </div>

            {/* Error Type & Message */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Error Classification</span>
              <div className="bg-[#070b13] p-3 rounded-lg border border-slate-800 space-y-1.5">
                <div className="font-mono text-xs font-bold text-rose-400">
                  {currentIncident.error_type}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed font-sans">
                  {currentIncident.error_message}
                </div>
              </div>
            </div>

            {/* Stack Trace Excerpt */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Stack Trace Excerpt</span>
                <button
                  onClick={() => handleCopyTrace(currentIncident.stack_trace)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 font-mono transition-colors cursor-pointer"
                >
                  {copiedTrace ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTrace ? 'Copied' : 'Copy Trace'}</span>
                </button>
              </div>
              <div className="bg-[#05070d] p-3 rounded-lg border border-slate-800/90 font-mono text-xs text-slate-300 overflow-x-auto max-h-[260px] leading-relaxed select-text">
                <pre className="text-[11px] whitespace-pre-wrap text-slate-300 font-mono">
                  {currentIncident.stack_trace}
                </pre>
              </div>
            </div>

            {/* If currently resolved, show resolution summary */}
            {isResolved && (
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/50 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolution Applied</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Root Cause:</strong> {currentIncident.root_cause}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Fix:</strong> {currentIncident.fix_description}
                </p>
                {currentIncident.fix_pr_url && (
                  <a
                    href={currentIncident.fix_pr_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline font-mono"
                  >
                    <GitPullRequest className="w-3.5 h-3.5" />
                    <span>{currentIncident.fix_pr_url}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Closest Historical Match */}
        <div className="bg-slate-900/90 border border-cyan-900/50 rounded-xl overflow-hidden flex flex-col shadow-lg relative">
          <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <h3 className="text-sm font-semibold text-white">Closest Historical Match</h3>
            </div>
            {matchedIncident ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">Memory Ref:</span>
                <span className="font-mono text-xs text-cyan-400 font-bold">{matchedIncident.id}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">No direct match</span>
            )}
          </div>

          {matchedIncident ? (
            <div className="p-5 space-y-5 flex-1 flex flex-col">
              {/* Similarity Score Banner & Metrics Breakdown */}
              <div className="bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 p-4 rounded-xl border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                      Similarity Confidence
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-white font-mono">{currentIncident.similarity_score}%</span>
                      <span className="text-xs text-emerald-400 font-medium">High Match Correlation</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-950 text-cyan-300 font-mono font-bold text-sm shadow-lg shadow-cyan-500/20">
                    {currentIncident.similarity_score}%
                  </div>
                </div>

                {/* Evidence Matrix */}
                {currentIncident.match_evidence && (
                  <div className="pt-3 border-t border-cyan-900/50 space-y-2">
                    <span className="text-[11px] font-mono uppercase text-slate-400">Match Evidence Breakdown</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-[#070b13] p-2 rounded border border-slate-800">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Endpoint Overlap</span>
                          <span className="text-cyan-400 font-bold">{currentIncident.match_evidence.endpoint_match}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${currentIncident.match_evidence.endpoint_match}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-[#070b13] p-2 rounded border border-slate-800">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Error Type Overlap</span>
                          <span className="text-cyan-400 font-bold">{currentIncident.match_evidence.error_type_match}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${currentIncident.match_evidence.error_type_match}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-[#070b13] p-2 rounded border border-slate-800">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Stack Trace Signature</span>
                          <span className="text-cyan-400 font-bold">{currentIncident.match_evidence.stack_trace_overlap}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${currentIncident.match_evidence.stack_trace_overlap}%` }}></div>
                        </div>
                      </div>

                      <div className="bg-[#070b13] p-2 rounded border border-slate-800">
                        <div className="flex justify-between text-slate-400 text-[10px]">
                          <span>Service Context</span>
                          <span className="text-cyan-400 font-bold">{currentIncident.match_evidence.service_context_match}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${currentIncident.match_evidence.service_context_match}%` }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Key evidence bullets */}
                    <div className="space-y-1 mt-2">
                      {currentIncident.match_evidence.key_matches.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                          <span className="text-cyan-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Historical Root Cause */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Historical Root Cause</span>
                  {matchedIncident.resolved_by && (
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>Verified by {matchedIncident.resolved_by}</span>
                    </span>
                  )}
                </div>
                <div className="bg-[#070b13] p-3 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  {matchedIncident.root_cause}
                </div>
              </div>

              {/* Historical Fix Description */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Verified Fix Description</span>
                <div className="bg-[#070b13] p-3 rounded-lg border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  {matchedIncident.fix_description}
                </div>
              </div>

              {/* Code Diff Snippet if available */}
              {matchedIncident.fix_diff && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Past Patch Diff</span>
                    </span>
                    {matchedIncident.fix_pr_url && (
                      <a
                        href={matchedIncident.fix_pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:underline font-mono flex items-center gap-1"
                      >
                        <GitPullRequest className="w-3 h-3" />
                        <span>Pull Request</span>
                      </a>
                    )}
                  </div>
                  <div className="bg-[#05070d] p-3 rounded-lg border border-slate-800/90 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[160px] leading-relaxed">
                    <pre className="whitespace-pre-wrap">{matchedIncident.fix_diff}</pre>
                  </div>
                </div>
              )}

              {/* Action Buttons inside right panel footer */}
              {!isResolved && (
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3 mt-auto">
                  <button
                    onClick={() => openResolutionModal(currentIncident, 'previous_fix')}
                    className="w-full flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Use Previous Fix</span>
                  </button>
                  <button
                    onClick={() => openResolutionModal(currentIncident, 'investigate_new')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Investigate New</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 my-auto">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Historical Match Indexed</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                This appears to be a novel failure pattern. Click "Investigate New" to triage and store the first resolution into organizational memory.
              </p>
              <button
                onClick={() => openResolutionModal(currentIncident, 'investigate_new')}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer"
              >
                Investigate & Document Fix
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
