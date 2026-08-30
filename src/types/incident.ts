export type IncidentCategory = 'error_thrown' | 'silent_failure' | 'recurring_debt';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';
export type IncidentSeverity = 'P1 - Critical' | 'P2 - High' | 'P3 - Moderate';

export interface MatchEvidence {
  error_type_match: number; // 0 - 100
  endpoint_match: number;   // 0 - 100
  stack_trace_overlap: number; // 0 - 100
  service_context_match: number; // 0 - 100
  key_matches: string[];
}

export interface Incident {
  id: string;
  created_at: string;
  service: string;
  endpoint: string;
  error_type: string;
  error_message: string;
  stack_trace: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  
  // Matching fields
  similarity_score?: number; // 0 - 100
  matched_incident_id?: string;
  match_evidence?: MatchEvidence;

  // Resolution & Organizational Memory fields
  root_cause?: string;
  fix_description?: string;
  fix_diff?: string;
  fix_pr_url?: string;
  resolution_verified: boolean;
  resolved_by?: string;
  resolved_at?: string;
  reuse_count?: number; // Times this resolution was referenced and confirmed
  downtime_minutes?: number;
}

export interface ActivityBaseline {
  id: string;
  service: string;
  endpoint: string;
  expected_rate: number;
  actual_rate: number;
  unit: string;
  window: string;
  last_seen_at: string;
  time_since_last: string;
  anomaly_threshold: number; // % drop threshold
  drop_percentage: number;
  sparkline_data: number[];
  description: string;
  root_cause_clue: string;
  status: 'active_drop' | 'recovering' | 'investigating';
  suggested_runbook: string;
}

export interface RecurrenceOccurrence {
  incident_id: string;
  date: string;
  patch_applied: string;
  why_it_failed_again: string;
  engineer: string;
  downtime_minutes: number;
}

export interface RecurrenceGroup {
  id: string;
  signature: string;
  service: string;
  endpoint: string;
  error_type: string;
  occurrence_count: number;
  timeframe: string;
  first_seen: string;
  last_seen: string;
  flagged_as_debt: boolean;
  debt_threshold: number;
  occurrences: RecurrenceOccurrence[];
  recommendation: string;
  permanent_solution: string;
  wasted_hours: number;
  refactor_estimate_hours: number;
}

export interface FilterState {
  category: 'all' | IncidentCategory;
  status: 'all' | IncidentStatus;
  service: string;
  searchQuery: string;
}
