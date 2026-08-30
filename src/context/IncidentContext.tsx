import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Incident, ActivityBaseline, RecurrenceGroup, FilterState, IncidentCategory, IncidentStatus } from '../types/incident';
import { SEEDED_INCIDENTS, SEEDED_BASELINES, SEEDED_RECURRENCE_GROUPS } from '../data/seedData';

export type AppTab = 'feed' | 'match' | 'silent' | 'debt' | 'log';

interface Toast {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning';
}

interface IncidentContextType {
  incidents: Incident[];
  baselines: ActivityBaseline[];
  recurrenceGroups: RecurrenceGroup[];
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  
  // Resolution modal state
  resolutionModal: {
    isOpen: boolean;
    mode: 'previous_fix' | 'investigate_new' | null;
    incident: Incident | null;
    matchedIncident: Incident | null;
  };
  openResolutionModal: (incident: Incident, mode: 'previous_fix' | 'investigate_new') => void;
  closeResolutionModal: () => void;
  
  // Action handlers
  resolveIncident: (
    incidentId: string,
    data: {
      root_cause: string;
      fix_description: string;
      fix_pr_url?: string;
      resolution_verified: boolean;
      resolved_by: string;
    }
  ) => void;
  
  simulateNewIncident: (scenario: {
    title: string;
    category: IncidentCategory;
    service: string;
    endpoint: string;
    error_type: string;
    error_message: string;
    stack_trace: string;
    severity: 'P1 - Critical' | 'P2 - High' | 'P3 - Moderate';
  }) => string;

  // Anomaly triage
  triageBaselineAnomaly: (baselineId: string, newStatus: 'investigating' | 'recovering' | 'active_drop') => void;

  // Helpers
  getIncidentById: (id: string) => Incident | undefined;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  triggerToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(SEEDED_INCIDENTS);
  const [baselines, setBaselines] = useState<ActivityBaseline[]>(SEEDED_BASELINES);
  const [recurrenceGroups] = useState<RecurrenceGroup[]>(SEEDED_RECURRENCE_GROUPS);
  const [activeTab, setActiveTab] = useState<AppTab>('feed');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('INC-9844');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    status: 'all',
    service: 'all',
    searchQuery: ''
  });

  const [resolutionModal, setResolutionModal] = useState<{
    isOpen: boolean;
    mode: 'previous_fix' | 'investigate_new' | null;
    incident: Incident | null;
    matchedIncident: Incident | null;
  }>({
    isOpen: false,
    mode: null,
    incident: null,
    matchedIncident: null
  });

  const triggerToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const newToast: Toast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      text,
      type
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIncidentById = (id: string) => {
    return incidents.find(inc => inc.id === id);
  };

  const openResolutionModal = (incident: Incident, mode: 'previous_fix' | 'investigate_new') => {
    const matched = incident.matched_incident_id ? getIncidentById(incident.matched_incident_id) || null : null;
    setResolutionModal({
      isOpen: true,
      mode,
      incident,
      matchedIncident: matched
    });
  };

  const closeResolutionModal = () => {
    setResolutionModal({
      isOpen: false,
      mode: null,
      incident: null,
      matchedIncident: null
    });
  };

  const resolveIncident = (
    incidentId: string,
    data: {
      root_cause: string;
      fix_description: string;
      fix_pr_url?: string;
      resolution_verified: boolean;
      resolved_by: string;
    }
  ) => {
    setIncidents(prev => {
      return prev.map(inc => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: 'resolved' as IncidentStatus,
            root_cause: data.root_cause,
            fix_description: data.fix_description,
            fix_pr_url: data.fix_pr_url,
            resolution_verified: data.resolution_verified,
            resolved_by: data.resolved_by,
            resolved_at: new Date().toISOString(),
            reuse_count: 1
          };
        }
        if (inc.id === resolutionModal.matchedIncident?.id) {
          return {
            ...inc,
            reuse_count: (inc.reuse_count || 1) + 1
          };
        }
        return inc;
      });
    });

    closeResolutionModal();
    triggerToast(`Incident ${incidentId} marked as Resolved and indexed into Organizational Memory!`, 'success');
  };

  const simulateNewIncident = (scenario: {
    title: string;
    category: IncidentCategory;
    service: string;
    endpoint: string;
    error_type: string;
    error_message: string;
    stack_trace: string;
    severity: 'P1 - Critical' | 'P2 - High' | 'P3 - Moderate';
  }) => {
    const newId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let matchedId = 'INC-2041';
    let similarity = 88;
    
    if (scenario.endpoint.includes('stripe') || scenario.category === 'silent_failure') {
      matchedId = 'INC-3189';
      similarity = 91;
    } else if (scenario.endpoint.includes('orders') || scenario.error_type.includes('Replica')) {
      matchedId = 'INC-4022';
      similarity = 89;
    } else if (scenario.endpoint.includes('login')) {
      matchedId = 'INC-2041';
      similarity = 94;
    }

    const newIncident: Incident = {
      id: newId,
      created_at: new Date().toISOString(),
      service: scenario.service,
      endpoint: scenario.endpoint,
      error_type: scenario.error_type,
      error_message: scenario.error_message,
      stack_trace: scenario.stack_trace,
      category: scenario.category,
      severity: scenario.severity,
      status: 'open',
      similarity_score: similarity,
      matched_incident_id: matchedId,
      match_evidence: {
        error_type_match: Math.min(100, similarity + 4),
        endpoint_match: 100,
        stack_trace_overlap: Math.max(75, similarity - 6),
        service_context_match: 92,
        key_matches: [
          `Matched historical incident ${matchedId}`,
          `Service signature: ${scenario.service} (${scenario.endpoint})`,
          'Pattern overlap in exception stack frames'
        ]
      },
      resolution_verified: false
    };

    setIncidents(prev => [newIncident, ...prev]);
    setSelectedIncidentId(newId);
    setActiveTab('match');
    triggerToast(`🚨 Ingested ${newId} (${scenario.service}). Organizational Memory matched ${similarity}% with ${matchedId}!`, 'info');
    return newId;
  };

  const triageBaselineAnomaly = (baselineId: string, newStatus: 'investigating' | 'recovering' | 'active_drop') => {
    setBaselines(prev => prev.map(b => b.id === baselineId ? { ...b, status: newStatus } : b));
    triggerToast(`Anomaly ${baselineId} status updated to ${newStatus.toUpperCase()}`, 'info');
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        baselines,
        recurrenceGroups,
        activeTab,
        setActiveTab,
        selectedIncidentId,
        setSelectedIncidentId,
        filters,
        setFilters,
        resolutionModal,
        openResolutionModal,
        closeResolutionModal,
        resolveIncident,
        simulateNewIncident,
        triageBaselineAnomaly,
        getIncidentById,
        toasts,
        dismissToast,
        triggerToast
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
