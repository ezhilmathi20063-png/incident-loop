import React from 'react';
import { useIncidents, type AppTab } from '../context/IncidentContext';
import { 
  Zap, 
  Activity, 
  RefreshCw, 
  BookOpen, 
  Layers, 
  PlusCircle, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

interface HeaderProps {
  onOpenSimulateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSimulateModal }) => {
  const { 
    incidents, 
    baselines, 
    recurrenceGroups, 
    activeTab, 
    setActiveTab, 
    selectedIncidentId 
  } = useIncidents();

  // Metrics
  const openCount = incidents.filter(i => i.status === 'open' || i.status === 'investigating').length;
  const activeSilentDrops = baselines.filter(b => b.status === 'active_drop').length;
  const debtGroupsCount = recurrenceGroups.filter(r => r.flagged_as_debt).length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  const navItems: Array<{ id: AppTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }> = [
    {
      id: 'feed',
      label: 'Incident Feed',
      icon: Layers,
      badge: openCount,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'match',
      label: 'Match View',
      icon: Zap,
      badge: selectedIncidentId ? 1 : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'silent',
      label: 'Silent Failures',
      icon: Activity,
      badge: activeSilentDrops,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    },
    {
      id: 'debt',
      label: 'Technical Debt',
      icon: RefreshCw,
      badge: debtGroupsCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      id: 'log',
      label: 'Resolution Log',
      icon: BookOpen,
      badge: resolvedCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    }
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur sticky top-0 z-40">
      {/* Top Telemetry Status Bar */}
      <div className="px-4 lg:px-8 py-1.5 bg-[#05080f] border-b border-slate-900 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] text-emerald-400 font-semibold tracking-wider">ORGANIZATIONAL MEMORY ONLINE</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Similarity Vector Index: <strong>{incidents.length} Records</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-700">|</span>
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Human-in-the-Loop Policy: <strong>Enforced</strong> (No Auto-Apply)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline text-[11px] text-slate-500 font-mono">
            Environment: <span className="text-cyan-400 font-semibold">prod-cluster-us-east</span>
          </span>
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-400 font-mono">
            <span className="text-slate-500">Engine:</span>
            <span className="text-emerald-400 font-semibold">Ready</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">Incident<span className="text-cyan-400">Loop</span></span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold">v2.4</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none">Organizational Memory for Production Outages</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {navItems.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${tab.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button: Simulate Incident */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSimulateModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 border border-cyan-400/30 transition-all transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Simulate Ingestion</span>
          </button>
        </div>
      </div>
    </header>
  );
};
