import React, { useState } from 'react';
import { IncidentProvider, useIncidents } from './context/IncidentContext';
import { Header } from './components/Header';
import { IncidentFeed } from './components/IncidentFeed';
import { MatchView } from './components/MatchView';
import { SilentFailurePanel } from './components/SilentFailurePanel';
import { TechnicalDebtPanel } from './components/TechnicalDebtPanel';
import { ResolutionLog } from './components/ResolutionLog';
import { ResolutionModal } from './components/ResolutionModal';
import { SimulateIncidentModal } from './components/SimulateIncidentModal';
import { ToastContainer } from './components/ToastContainer';
import { ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, incidents } = useIncidents();
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-200 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Persistent Navigation & Status Bar */}
      <Header onOpenSimulateModal={() => setSimulateModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'feed' && <IncidentFeed />}
        {activeTab === 'match' && <MatchView />}
        {activeTab === 'silent' && <SilentFailurePanel />}
        {activeTab === 'debt' && <TechnicalDebtPanel />}
        {activeTab === 'log' && <ResolutionLog />}
      </main>

      {/* Engineering Tool Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060910] text-slate-400 text-xs py-4 px-4 sm:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Memory Engine: <strong className="text-slate-300">Semantic & Signature Matcher v2.4</strong></span>
            </div>
            <span className="text-slate-700">|</span>
            <span className="text-[11px] font-mono text-slate-400">
              Total Outages Indexed: <strong className="text-cyan-400">{incidents.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Human Review Required (Strict Zero-Auto-Apply)</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">IncidentLoop Internal SRE Prototype</span>
          </div>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <ResolutionModal />
      <SimulateIncidentModal
        isOpen={simulateModalOpen}
        onClose={() => setSimulateModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <IncidentProvider>
      <AppContent />
    </IncidentProvider>
  );
}
