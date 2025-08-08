import React from 'react';
import styles from './styles.module.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label
} from 'recharts';

interface AnalyticsDashboardProps {
  dashboard?: any;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ dashboard }) => {
  const isEmpty = !dashboard || Object.keys(dashboard).length === 0;

  const formatNumber = (value?: number) =>
    typeof value === 'number' ? value.toLocaleString() : '0';

  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const Info = ({ text }: { text: string }) => (
    <span className={styles.infoIcon} title={text} style={{ marginLeft: '6px', cursor: 'pointer' }}>
      🛈
    </span>
  );

  if (isEmpty) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <div>No analytics data available yet.</div>
        </div>
      </div>
    );
  }

  const timelineData =
    dashboard.timeline_summary?.map((item: any) => ({
      hour: item.hour.split(' ')[1],
      requests: item.total_events,
      errorRate: item.error_rate,
      isAnomaly: item.anomaly,
    })) || [];

  return (
    <div className={styles.dashboard}>
      <h2 className={styles.title}>HTTP Log Analytics Dashboard</h2>

      {/* Basic Statistics */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>
            Total Requests
            <Info text="Total number of HTTP requests processed" />
          </h3>
          <div className={styles.statValue}>
            {formatNumber(dashboard.basic_stats?.total_requests)}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>
            Unique IPs
            <Info text="Number of unique client IP addresses" />
          </h3>
          <div className={styles.statValue}>
            {formatNumber(dashboard.basic_stats?.unique_ips)}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>
            Data Served
            <Info text="Total response size served by server" />
          </h3>
          <div className={styles.statValue}>
            {formatBytes(dashboard.basic_stats?.total_bytes_served)}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>
            Avg Requests / Hour
            <Info text="Average number of HTTP requests per hour" />
          </h3>
          <div className={styles.statValue}>
            {formatNumber(dashboard.basic_stats?.avg_requests_per_hour)}
          </div>
        </div>
      </div>

      {/* Timeline Summary */}
      {timelineData.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Timeline of Requests (Hourly)
              <Info text="How many requests were received each hour and how the error rate fluctuated." />
            </h3>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={timelineData}
              margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour">
                <Label
                  value="Hour of Day"
                  position="insideBottom"
                  offset={-5}
                  style={{ fontSize: 12, fill: "#666" }}
                />
              </XAxis>

              <YAxis
                yAxisId="left"
                label={{
                  value: "Total Requests (per hour)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle", fontSize: 12, fill: "#666" }
                }}
              />

              <YAxis
                yAxisId="right"
                orientation="right"
                label={{
                  value: "Error Rate (%)",
                  angle: 90,
                  position: "insideRight",
                  style: { textAnchor: "middle", fontSize: 12, fill: "#666" }
                }}
              />

              <Tooltip
                labelFormatter={(label) => `Hour: ${label}`}
                formatter={(value, _name, { dataKey }) =>
                  dataKey === "errorRate"
                    ? [`${value}%`, "Error Rate"]
                    : [value, "Requests"]
                }
              />


              <Legend verticalAlign="top" height={36} />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="requests"
                stroke="#8884d8"
                strokeWidth={2}
                dot={({ cx, cy, payload }) =>
                  payload.isAnomaly ? (
                    <circle cx={cx} cy={cy} r={5} fill="red" stroke="black" strokeWidth={1} />
                  ) : (
                    <circle cx={cx} cy={cy} r={3} fill="#8884d8" />
                  )
                }
                name="Requests"
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="errorRate"
                stroke="#ff7300"
                strokeDasharray="5 5"
                name="Error Rate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {dashboard.top_urls && dashboard.top_urls.length > 0 && (
        <div className={styles.section}>
          <h3>
            Top Requested URLs
            <Info text="Most frequently accessed endpoints" />
          </h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Requests</th>
                  <th>% of Total</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.top_urls.map((item: any, idx: number) => {
                  const count = item.count || 0;
                  return (
                    <tr key={idx}>
                      <td title={item.url}>{item.url}</td>
                      <td>{formatNumber(count)}</td>
                      <td>
                        {((count / (dashboard.basic_stats?.total_requests || 1)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dashboard.top_offenders && dashboard.top_offenders.length > 0 && (
        <div className={styles.section}>
          <h3>
            Top Offenders
            <Info text="IP addresses generating the most 4xx/5xx errors" />
          </h3>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>IP</th>
                  <th>Total</th>
                  <th>Errors</th>
                  <th>Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.top_offenders.map((offender: any, idx: number) => (
                  <tr key={idx}>
                    <td>{offender.ip}</td>
                    <td>{formatNumber(offender.total_requests)}</td>
                    <td className={offender.error_requests ? styles.errorCount : ''}>
                      {formatNumber(offender.error_requests)}
                    </td>
                    <td>
                      <span
                        className={
                          (offender.success_rate || 0) < 80
                            ? styles.lowSuccess
                            : styles.highSuccess
                        }
                      >
                        {offender.success_rate ?? 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

