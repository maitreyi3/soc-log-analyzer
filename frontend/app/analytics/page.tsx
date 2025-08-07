"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import AnalyticsDashboard from "./BasicStatsTab";
import AIBasedAnalytics from "./AIBasedTab";

export default function AnalyticsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'ai'>('basic');
  const searchParams = useSearchParams(); 

  useEffect(() => {
    axios.get("http://localhost:8000/api/dashboard", { withCredentials: true })
      .then((res) => {
        console.log("Dashboard loaded:", res.data);
        setDashboard(res.data);
      })
      .catch((err) => {
        console.error("Failed to load dashboard", err);
      });
  }, [searchParams]);

  if (!dashboard) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem auto'
        }} />
        Loading dashboard...
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if ((dashboard as any).error) {
    return (
      <div style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>
        ❌ Failed to load dashboard data. Please upload a valid log file.
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1rem', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h2 style={{
        fontSize: '2rem',
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '2rem'
      }}>
        Log Analytics Dashboard
      </h2>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('basic')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'basic' ? '#1e40af' : '#e2e8f0',
            color: activeTab === 'basic' ? 'white' : '#1e293b',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease'
          }}
        >
          Basic Stats
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'ai' ? '#1e40af' : '#e2e8f0',
            color: activeTab === 'ai' ? 'white' : '#1e293b',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease'
          }}
        >
          AI-Based Anomaly Detection
        </button>
      </div>

      {activeTab === 'basic' && <AnalyticsDashboard dashboard={dashboard} />}
      {activeTab === 'ai' && <AIBasedAnalytics dashboard={dashboard} />}
    </div>
  );
}
