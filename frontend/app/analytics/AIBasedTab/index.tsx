"use client";
import React from "react";
import styles from "./styles.module.css";

interface Anomaly {
  ip: string;
  total_requests: number;
  error_requests: number;
  error_rate: number;
  requests_per_minute: number;
  time_span_sec: number;
  confidence: number;
  reason: string;
}

interface AIBasedAnalyticsProps {
  dashboard: {
    anomalies?: Anomaly[];
  };
}

const AIBasedAnalytics: React.FC<AIBasedAnalyticsProps> = ({ dashboard }) => {
  const anomalies = (dashboard?.anomalies || []).sort(
    (a, b) => b.confidence - a.confidence
  );

  const getThreatStyle = (confidence: number) => {
    if (confidence > 0.7) return styles.highThreat;
    if (confidence >= 0.3) return styles.mediumThreat;
    return styles.lowThreat;
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>AI-Based Anomaly Detection</h2>

      <div className={styles.summary}>
        <strong>{anomalies.length}</strong> anomalous IPs identified via behavior-based detection.
      </div>

      {anomalies.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.anomalyTable}>
            <thead>
              <tr>
                <th>IP</th>
                <th>Total</th>
                <th>Errors</th>
                <th>Error Rate</th>
                <th>Req/Min</th>
                <th>Time Span (s)</th>
                <th>Confidence</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map((anomaly, index) => (
                <tr key={index}>
                  <td>{anomaly.ip}</td>
                  <td>{anomaly.total_requests}</td>
                  <td className={anomaly.error_requests > 0 ? styles.errorCell : ""}>
                    {anomaly.error_requests}
                  </td>
                  <td>{(anomaly.error_rate * 100).toFixed(1)}%</td>
                  <td>{anomaly.requests_per_minute.toFixed(2)}</td>
                  <td>{anomaly.time_span_sec}</td>
                  <td className={getThreatStyle(anomaly.confidence)}>
                    {Math.round(anomaly.confidence * 100)}%
                  </td>
                  <td>{anomaly.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={styles.noData}>No anomalies detected in this log file.</p>
      )}
    </div>
  );
};

export default AIBasedAnalytics;
