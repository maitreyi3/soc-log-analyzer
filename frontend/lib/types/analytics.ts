export interface Anomaly {
  ip: string;
  total_requests: number;
  error_requests: number;
  error_rate: number;
  requests_per_minute: number;
  time_span_sec: number;
  confidence: number;
  reason: string;
}

export interface DashboardStats {
  total_logs: number;
  total_files: number;
  anomalies: Anomaly[];
}
