import React, { useMemo } from 'react';
import { useIncidents } from '../context/IncidentContext';
import type { Incident } from '../types/incident';
import { CategoryBadge, StatusBadge, SeverityBadge } from './Badges';
import { 
  Search, 
  ArrowRight, 
  Sparkles, 
  Activity, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Database
} from 'lucide-react';

export const IncidentFeed: React.FC = () => {
  const { 
    incidents, 
    baselines, 
    recurrenceGroups, 
    filters, 
    setFilters, 
    setSelectedIncidentId, 
    setActiveTab 
  } = useIncidents();

  // Filter incidents based on criteria
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // Category filter
      if (filters.category !== 'all' && inc.category !== filters.category) {
        return false;
      }
      // Status filter
      if (filters.status !== 'all' && inc.status !== filters.status) {
        return false;
      }
      // Service filter
      if (filters.service !== 'all' && inc.service !== filters.service) {
        return false;
      }
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchId = inc.id.toLowerCase().includes(q);
        const matchService = inc.service.toLowerCase().includes(q);
        const matchEndpoint = inc.endpoint.toLowerCase().includes(q);
        const matchErrorType = inc.error_type.toLowerCase().includes(q);
        const matchMessage = inc.error_message.toLowerCase().includes(q);
        if (!matchId && !matchService && !matchEndpoint && !matchErrorType && !matchMessage) {
          return false;
        }
      }
      return true;
    });
  }, [incidents, filters]);

  // Unique services for filter dropdown
  const uniqueServices = useMemo(() => {
    const set = new Set<string>();
    incidents.forEach(i => set.add(i.service));
    return Array.from(set).sort();
  }, [incidents]);

  // Quick stats
  const activeCount = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const highMatchesCount = incidents.filter(i => (i.status === 'open' || i.status === 'investigating') && (i.similarity_score || 0) >= 80).length;
  const silentDropsCount = baselines.filter(b => b.status === 'active_drop').length;
  const debtCount = recurrenceGroups.filter(r => r.flagged_as_debt).length;

  const handleRowClick = (incident: Incident) => {
    setSelectedIncidentId(incident.id);
    setActiveTab('match');
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
        ' (' + date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ')';
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active Incidents</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{activeCount}</span>
              <span className="text-xs text-rose-400 font-medium">Require Triage</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-cyan-900/40 rounded-xl p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">Past Solutions Ready</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-cyan-300">{highMatchesCount}</span>
              <span className="text-xs text-cyan-400 font-medium">≥80% Similarity</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('silent')}
          className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer transition-colors"
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Silent Drops Active</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{silentDropsCount}</span>
              <span className="text-xs text-cyan-400 font-medium">Zero-Error Anomalies</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('debt')}
          className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer transition-colors"
        >
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Recurring Debt Signatures</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-white">{debtCount}</span>
              <span className="text-xs text-amber-400 font-medium">≥3 Occurrences</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by incident ID, service, endpoint path, or error type..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full bg-[#090d16] border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          {/* Service Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Service:</span>
            </label>
            <select
              value={filters.service}
              onChange={(e) => setFilters(prev => ({ ...prev, service: e.target.value }))}
              className="bg-[#090d16] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
            >
              <option value="all">All Services</option>
              {uniqueServices.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Chips: Category & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 font-mono">Category:</span>
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'error_thrown', label: 'Error Thrown' },
              { id: 'silent_failure', label: 'Silent Failure' },
              { id: 'recurring_debt', label: 'Recurring Debt' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilters(prev => ({ ...prev, category: tab.id as any }))}
                className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filters.category === tab.id
                    ? 'bg-slate-800 text-white font-medium border border-slate-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1 font-mono">Status:</span>
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'open', label: 'Open' },
              { id: 'investigating', label: 'Investigating' },
              { id: 'resolved', label: 'Resolved' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilters(prev => ({ ...prev, status: tab.id as any }))}
                className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  filters.status === tab.id
                    ? 'bg-slate-800 text-white font-medium border border-slate-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Stream Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-wide">Live Incident Telemetry Stream</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Showing {filteredIncidents.length} of {incidents.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Click any incident to open Match View</span>
        </div>

        {filteredIncidents.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">No incidents match the active filters</p>
            <button
              onClick={() => setFilters({ category: 'all', status: 'all', service: 'all', searchQuery: '' })}
              className="mt-3 text-xs text-cyan-400 hover:underline font-mono cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#070b13] text-slate-400 uppercase font-mono text-[11px] tracking-wider">
                  <th className="py-3 px-4 font-medium">Incident</th>
                  <th className="py-3 px-4 font-medium">Category & Status</th>
                  <th className="py-3 px-4 font-medium">Service & Endpoint</th>
                  <th className="py-3 px-4 font-medium">Error Type / Anomaly</th>
                  <th className="py-3 px-4 font-medium">Memory Match</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredIncidents.map((incident) => {
                  const hasMatch = incident.similarity_score !== undefined;
                  const isResolved = incident.status === 'resolved';

                  return (
                    <tr
                      key={incident.id}
                      onClick={() => handleRowClick(incident)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    >
                      {/* ID & Timestamp */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
                          {incident.id}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {formatTimestamp(incident.created_at)}
                        </div>
                        <div className="mt-1.5">
                          <SeverityBadge severity={incident.severity} />
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          <CategoryBadge category={incident.category} />
                          <div>
                            <StatusBadge status={incident.status} />
                          </div>
                        </div>
                      </td>

                      {/* Service & Endpoint */}
                      <td className="py-3.5 px-4 align-top max-w-[220px]">
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                          <span>{incident.service}</span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 mt-1 truncate bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800" title={incident.endpoint}>
                          {incident.endpoint}
                        </div>
                      </td>

                      {/* Error Type & Message */}
                      <td className="py-3.5 px-4 align-top max-w-[320px]">
                        <div className="font-mono font-semibold text-slate-200 truncate">
                          {incident.error_type}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                          {incident.error_message}
                        </div>
                      </td>

                      {/* Memory Match Preview */}
                      <td className="py-3.5 px-4 align-top">
                        {hasMatch ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-700/60 rounded px-2 py-1 text-cyan-300 font-mono text-[11px]">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              <span className="font-bold">{incident.similarity_score}%</span>
                              <span className="text-slate-400">match</span>
                            </div>
                            {incident.matched_incident_id && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                vs. <span className="text-cyan-400">{incident.matched_incident_id}</span>
                              </div>
                            )}
                          </div>
                        ) : isResolved ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                            <CheckCircle2 className="w-3 h-3" /> Indexed in memory
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Calculating...</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(incident);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-600 group-hover:text-white text-slate-300 text-xs font-medium border border-slate-700 group-hover:border-cyan-500 transition-all shadow-sm cursor-pointer"
                        >
                          <span>{isResolved ? 'View Memory' : 'Review Match'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
