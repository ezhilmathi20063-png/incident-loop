import React, { useState, useMemo } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { CategoryBadge } from './Badges';
import { 
  Search, 
  BookOpen, 
  CheckCircle2, 
  GitPullRequest, 
  FileCode, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const ResolutionLog: React.FC = () => {
  const { incidents, setSelectedIncidentId, setActiveTab } = useIncidents();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>('INC-2041');

  // Filter only resolved incidents
  const resolvedIncidents = useMemo(() => {
    return incidents.filter(i => {
      if (i.status !== 'resolved') return false;

      if (selectedService !== 'all' && i.service !== selectedService) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = i.id.toLowerCase().includes(q);
        const matchService = i.service.toLowerCase().includes(q);
        const matchEndpoint = i.endpoint.toLowerCase().includes(q);
        const matchRoot = (i.root_cause || '').toLowerCase().includes(q);
        const matchFix = (i.fix_description || '').toLowerCase().includes(q);
        const matchEngineer = (i.resolved_by || '').toLowerCase().includes(q);
        if (!matchId && !matchService && !matchEndpoint && !matchRoot && !matchFix && !matchEngineer) {
          return false;
        }
      }

      return true;
    });
  }, [incidents, searchQuery, selectedService]);

  const uniqueServices = useMemo(() => {
    const set = new Set<string>();
    incidents.filter(i => i.status === 'resolved').forEach(i => set.add(i.service));
    return Array.from(set).sort();
  }, [incidents]);

  const toggleExpand = (id: string) => {
    setExpandedIncidentId(prev => prev === id ? null : id);
  };

  const handleInspectInMatch = (id: string) => {
    setSelectedIncidentId(id);
    setActiveTab('match');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Organizational Resolution Memory Bank</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                VERIFIED PRODUCTION OUTCOMES
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              Every verified resolution becomes part of the permanent organizational memory bank. When future outages share code paths or telemetry anomalies, IncidentLoop surfaces these verified fixes to reduce Mean Time to Resolution (MTTR).
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search organizational memory by root cause, fix, PR link, engineer, or endpoint..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080c14] border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-mono">Service:</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-[#080c14] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
          >
            <option value="all">All Services ({uniqueServices.length})</option>
            {uniqueServices.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Knowledge Cards List */}
      <div className="space-y-4">
        {resolvedIncidents.length === 0 ? (
          <div className="p-16 bg-slate-900 border border-slate-800 rounded-xl text-center text-slate-400">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No resolved incidents matched your search</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the service filter or searching for broader terms.</p>
          </div>
        ) : (
          resolvedIncidents.map((incident) => {
            const isExpanded = expandedIncidentId === incident.id;

            return (
              <div
                key={incident.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-xl overflow-hidden shadow-lg transition-all"
              >
                {/* Header Row */}
                <div 
                  onClick={() => toggleExpand(incident.id)}
                  className="p-4 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-emerald-400">{incident.id}</span>
                        <span className="text-slate-700">|</span>
                        <span className="font-semibold text-white text-xs">{incident.service}</span>
                        <CategoryBadge category={incident.category} size="sm" />
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 mt-0.5 truncate">
                        {incident.endpoint} • <span className="text-slate-300 font-semibold">{incident.error_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    {incident.reuse_count && incident.reuse_count > 1 && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>Reused {incident.reuse_count}x</span>
                      </span>
                    )}

                    <div className="text-right hidden sm:block">
                      <div className="text-[11px] text-slate-400 font-mono">
                        Verified by <span className="text-slate-200">{incident.resolved_by || 'oncall'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {incident.resolved_at ? new Date(incident.resolved_at).toLocaleDateString() : 'Historical'}
                      </div>
                    </div>

                    <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-5 bg-[#070b13] border-t border-slate-800 space-y-4 text-xs">
                    {/* Root Cause */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                        Verified Root Cause:
                      </span>
                      <p className="text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                        {incident.root_cause || 'Documented in post-mortem archives.'}
                      </p>
                    </div>

                    {/* Fix Applied */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                        Verified Remediation & Fix:
                      </span>
                      <p className="text-slate-200 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed font-sans">
                        {incident.fix_description || 'Applied operational patch.'}
                      </p>
                    </div>

                    {/* Code Diff if available */}
                    {incident.fix_diff && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Patch Diff Snippet</span>
                          </span>
                          {incident.fix_pr_url && (
                            <a
                              href={incident.fix_pr_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-cyan-400 hover:underline font-mono flex items-center gap-1"
                            >
                              <GitPullRequest className="w-3 h-3" />
                              <span>{incident.fix_pr_url}</span>
                            </a>
                          )}
                        </div>
                        <div className="bg-[#04060a] p-3 rounded-lg border border-slate-800/90 font-mono text-[11px] text-slate-300 overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{incident.fix_diff}</pre>
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Outcome Verified in Production</span>
                      </div>

                      <button
                        onClick={() => handleInspectInMatch(incident.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono font-semibold border border-slate-700 transition-colors cursor-pointer"
                      >
                        <span>Open in Match Inspector</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
