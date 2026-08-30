import React, { useState } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { SIMULATION_SCENARIOS } from '../data/seedData';
import type { IncidentCategory } from '../types/incident';
import { 
  X, 
  PlusCircle, 
  Zap, 
  Play
} from 'lucide-react';

interface SimulateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulateIncidentModal: React.FC<SimulateIncidentModalProps> = ({ isOpen, onClose }) => {
  const { simulateNewIncident } = useIncidents();

  const [customMode, setCustomMode] = useState(false);
  const [customService, setCustomService] = useState('payment-orchestrator');
  const [customEndpoint, setCustomEndpoint] = useState('POST /v1/payments/capture');
  const [customErrorType, setCustomErrorType] = useState('PaymentGatewayTimeoutException');
  const [customMessage, setCustomMessage] = useState('Socket hung up waiting for upstream acquirer gateway response (timeout 5000ms)');
  const [customCategory, setCustomCategory] = useState<IncidentCategory>('error_thrown');

  if (!isOpen) return null;

  const handleScenarioSelect = (scenario: typeof SIMULATION_SCENARIOS[0]) => {
    simulateNewIncident(scenario);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    simulateNewIncident({
      title: `Custom Outage: ${customService}`,
      category: customCategory,
      service: customService,
      endpoint: customEndpoint,
      error_type: customErrorType,
      error_message: customMessage,
      stack_trace: `${customErrorType}: ${customMessage}\n  at GatewayClient.capture (/app/src/clients/gateway.ts:88:14)\n  at PaymentHandler.process (/app/src/handlers/payment.ts:42:10)`,
      severity: 'P1 - Critical'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulate Incoming Production Incident</h3>
              <p className="text-xs text-slate-400">
                Trigger real-time telemetry ingestion to test the Organizational Memory matching engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setCustomMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !customMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pre-configured Scenarios
          </button>
          <button
            onClick={() => setCustomMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              customMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom Ingestion
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {!customMode ? (
            <div className="space-y-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                Select a failure scenario to inject:
              </span>

              {SIMULATION_SCENARIOS.map((scenario, idx) => (
                <div
                  key={idx}
                  onClick={() => handleScenarioSelect(scenario)}
                  className="bg-[#070b13] hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors">
                      {scenario.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-semibold flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-cyan-400" />
                      <span>Inject</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <span className="text-slate-300">{scenario.service}</span>
                    <span>•</span>
                    <span className="text-cyan-400 truncate">{scenario.endpoint}</span>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-2">
                    {scenario.error_message}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="error_thrown">Error Thrown</option>
                    <option value="silent_failure">Silent Failure</option>
                    <option value="recurring_debt">Recurring Debt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Endpoint Path</label>
                <input
                  type="text"
                  required
                  value={customEndpoint}
                  onChange={(e) => setCustomEndpoint(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Error Type / Anomaly Header</label>
                <input
                  type="text"
                  required
                  value={customErrorType}
                  onChange={(e) => setCustomErrorType(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">Error Message / Telemetry Detail</label>
                <textarea
                  rows={3}
                  required
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-700 rounded-lg p-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ingest Simulated Incident</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
