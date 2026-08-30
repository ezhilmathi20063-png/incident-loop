import React from 'react';
import { useIncidents } from '../context/IncidentContext';
import type { ActivityBaseline } from '../types/incident';
import { 
  Activity, 
  Clock, 
  Terminal, 
  Zap, 
  Info
} from 'lucide-react';

export const SilentFailurePanel: React.FC = () => {
  const { 
    baselines, 
    triageBaselineAnomaly, 
    setSelectedIncidentId, 
    setActiveTab, 
    incidents,
    triggerToast 
  } = useIncidents();

  // Helper to render an SVG sparkline with drop cliff
  const renderSparkline = (data: number[]) => {
    const max = Math.max(...data, 1);
    const width = 280;
    const height = 48;
    const padding = 4;
    
    const points = data.map((val, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - (val / max) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    // Fill polygon coordinates
    const firstX = padding;
    const lastX = width - padding;
    const fillPoints = `${firstX},${height} ${points} ${lastX},${height}`;

    return (
      <div className="w-full relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 overflow-visible">
          <defs>
            <linearGradient id="dropGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={fillPoints} fill="url(#dropGradient)" />
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {/* Highlight the last flatlined point */}
          {data.length > 0 && (
            <circle
              cx={lastX}
              cy={height - padding - (data[data.length - 1] / max) * (height - 2 * padding)}
              r="3.5"
              className="fill-rose-500 stroke-slate-900 stroke-2 animate-ping"
            />
          )}
        </svg>
      </div>
    );
  };

  const handleLinkToIncident = (baseline: ActivityBaseline) => {
    // Find matching open silent failure incident if exists
    const matchingInc = incidents.find(i => i.endpoint === baseline.endpoint && i.category === 'silent_failure');
    if (matchingInc) {
      setSelectedIncidentId(matchingInc.id);
      setActiveTab('match');
    } else {
      triggerToast(`Linked to baseline diagnostic telemetry for ${baseline.service}`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Concept Explainer Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Silent Failure Detection Engine</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                BASELINE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              Traditional monitoring relies on exceptions and 5xx logs. <strong className="text-white">Silent failures</strong> occur when critical workflows simply stop receiving or processing events without ever throwing an application error (e.g. edge WAF drops, stalled consumer groups, or silent webhook unsubscriptions).
            </p>
          </div>
        </div>
      </div>

      {/* Baseline Anomaly Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {baselines.map((baseline) => {
          const isTotalDrop = baseline.drop_percentage >= 99;

          return (
            <div
              key={baseline.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-cyan-400">{baseline.id}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${
                    baseline.status === 'active_drop'
                      ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                      : 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                  }`}>
                    {baseline.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="font-bold text-white text-sm">{baseline.service}</h3>
                  <div className="font-mono text-xs text-cyan-300 bg-[#070b13] px-2 py-1 rounded border border-slate-800 mt-1 truncate" title={baseline.endpoint}>
                    {baseline.endpoint}
                  </div>
                </div>
              </div>

              {/* Rate Metrics & Sparkline */}
              <div className="bg-[#070b13] p-3.5 rounded-lg border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Expected Rate</span>
                    <p className="font-mono font-bold text-slate-200 text-sm mt-0.5">
                      ~{baseline.expected_rate} <span className="text-[10px] text-slate-400 font-normal">{baseline.unit}</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400">Actual Rate ({baseline.window})</span>
                    <p className="font-mono font-bold text-rose-400 text-sm mt-0.5 flex items-center gap-1">
                      <span>{baseline.actual_rate}</span>
                      <span className="text-[10px] px-1 rounded bg-rose-950 text-rose-300 font-mono">
                        -{baseline.drop_percentage}%
                      </span>
                    </p>
                  </div>
                </div>

                {/* Interactive Sparkline */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>Activity Trend ({baseline.window})</span>
                    <span className="text-rose-400 font-bold">
                      {isTotalDrop ? 'Flatlined (0 req)' : `${baseline.drop_percentage}% Cliff`}
                    </span>
                  </div>
                  {renderSparkline(baseline.sparkline_data)}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Time since last ingress:</span>
                  </span>
                  <span className="text-slate-200 font-bold">{baseline.time_since_last}</span>
                </div>
              </div>

              {/* Anomaly Description & Root Cause Clue */}
              <div className="space-y-2 text-xs">
                <p className="text-slate-300 leading-relaxed">
                  {baseline.description}
                </p>
                <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 text-[11px]">
                  <div className="font-mono text-cyan-400 font-semibold mb-0.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Suspected Mechanism:</span>
                  </div>
                  <div className="text-slate-400">{baseline.root_cause_clue}</div>
                </div>
              </div>

              {/* Runbook & Actions */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 truncate" title={baseline.suggested_runbook}>
                  <Terminal className="w-3 h-3 inline mr-1 text-slate-400" />
                  <span>{baseline.suggested_runbook}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleLinkToIncident(baseline)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Review Memory Match</span>
                  </button>

                  <button
                    onClick={() => triageBaselineAnomaly(baseline.id, baseline.status === 'investigating' ? 'recovering' : 'investigating')}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
                  >
                    {baseline.status === 'investigating' ? 'Mark Recovering' : 'Acknowledge'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
