import React, { useState } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { 
  RefreshCw, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Hammer, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';

export const TechnicalDebtPanel: React.FC = () => {
  const { 
    recurrenceGroups, 
    setSelectedIncidentId, 
    setActiveTab, 
    triggerToast 
  } = useIncidents();

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>('REC-01');

  const toggleExpand = (id: string) => {
    setExpandedGroupId(prev => prev === id ? null : id);
  };

  const handleInspectIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setActiveTab('match');
  };

  return (
    <div className="space-y-6">
      {/* Concept Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Technical Debt & Recurrence Radar</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-semibold">
                DEBT THRESHOLD ≥ 3 BREACHED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              IncidentLoop identifies recurring failure signatures where teams repeatedly apply temporary patches instead of addressing the underlying root cause. Surfacing cumulative engineering hours spent against refactoring estimates drives permanent architectural solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Recurrence Cards */}
      <div className="space-y-6">
        {recurrenceGroups.map((group) => {
          const isExpanded = expandedGroupId === group.id;

          return (
            <div
              key={group.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-xl overflow-hidden shadow-lg transition-all"
            >
              {/* Card Header */}
              <div className="p-5 bg-slate-900/60 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-amber-400 font-bold">{group.id}</span>
                    <span className="text-slate-700">|</span>
                    <span className="font-bold text-white text-sm">{group.service}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/80 font-bold">
                      {group.timeframe}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-cyan-300 bg-[#070b13] px-2.5 py-1 rounded border border-slate-800 mt-2 inline-block">
                    {group.signature}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Wasted SRE / Dev Time</span>
                    <div className="font-mono font-bold text-rose-400 text-sm">{group.wasted_hours} hrs</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Refactor ROI</span>
                    <div className="font-mono font-bold text-emerald-400 text-sm">~{group.refactor_estimate_hours} hrs needed</div>
                  </div>

                  <button
                    onClick={() => toggleExpand(group.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Permanent Recommendation Banner */}
              <div className="px-5 py-4 bg-gradient-to-r from-amber-950/25 via-slate-900 to-slate-900 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Hammer className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                      Architectural Recommendation (Stop Patching):
                    </span>
                    <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                      {group.recommendation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => triggerToast(`Refactor ticket generated for ${group.service}: Refactor State & Locks`, 'success')}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
                >
                  Schedule Refactor
                </button>
              </div>

              {/* Collapsible Timeline of Past Occurrences */}
              {isExpanded && (
                <div className="p-5 space-y-4 bg-[#070b13]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Past Occurrence & Band-Aid Timeline ({group.occurrences.length} cycles)</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      First recorded: {group.first_seen} • Last: {group.last_seen}
                    </span>
                  </div>

                  <div className="relative pl-6 border-l-2 border-slate-800 space-y-6 my-4">
                    {group.occurrences.map((occ, idx) => {
                      const isLatest = idx === group.occurrences.length - 1;

                      return (
                        <div key={occ.incident_id} className="relative group">
                          {/* Timeline bullet node */}
                          <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isLatest 
                              ? 'bg-rose-500 border-rose-300 animate-ping' 
                              : 'bg-slate-900 border-cyan-500'
                          }`}></div>

                          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleInspectIncident(occ.incident_id)}
                                  className="font-mono text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <span>{occ.incident_id}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                                <span className="text-slate-600 font-mono">•</span>
                                <span className="text-xs text-slate-300 font-mono">{occ.date}</span>
                                {isLatest && (
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                                    Current Outage
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-400 font-mono">
                                Downtime: <strong className="text-slate-200">{occ.downtime_minutes} mins</strong> • Triage: @{occ.engineer}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                              <div>
                                <span className="text-[10px] font-mono uppercase text-slate-400">Temporary Patch Applied</span>
                                <p className="text-slate-200 font-medium mt-0.5">{occ.patch_applied}</p>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono uppercase text-rose-400">Why It Failed Again</span>
                                <p className="text-slate-300 mt-0.5">{occ.why_it_failed_again}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Permanent Solution Target */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/60 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Permanent Resolution Blueprint</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {group.permanent_solution}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
