"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AnalyticsDashboard from "./BasicStatsTab";
import AIBasedAnalytics from "./AIBasedTab";
import uploadStyles from "../upload/UploadPage.module.css";
import styles from "./AnalyticsPage.module.css";
import type { DashboardStats } from "@/lib/types/analytics";

import { checkLogin, getDashboard } from "@/lib/api";
import type { Role } from "@/lib/api/auth";

export default function AnalyticsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [dashboardError, setDashboardError] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "ai">("basic");
  const [userRole, setUserRole] = useState<Role | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const res = await getDashboard();
        if (!cancelled) {
          setDashboard(res.data);
          setDashboardError(false);
        }
      } catch {
        if (!cancelled) {
          setDashboardError(true);
        }
      }
    };

    const loadAuth = async () => {
      try {
        const res = await checkLogin();
        if (!cancelled) {
          setUserRole(res.data.logged_in ? res.data.role ?? null : null);
        }
      } catch {
        if (!cancelled) {
          setUserRole(null);
        }
      }
    };

    loadDashboard();
    loadAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (!dashboard && !dashboardError) {
    return (
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner} />
        Loading dashboard...
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className={styles.errorContainer}>
        ❌ Failed to load dashboard data. Please upload a valid log file.
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }


  return (
    <div className={styles.container}>
      <header className={uploadStyles.header}>
        <h2 className={uploadStyles.logo}>Analytics Dashboard</h2>
        <div className={uploadStyles.navButtons}>
          <button onClick={() => router.push("/")} className={uploadStyles.homeBtn}>
            Home
          </button>
          <button onClick={() => router.push("/upload")} className={uploadStyles.homeBtn}>
            Upload
          </button>
          {userRole === "admin" && (
            <button onClick={() => router.push("/files")} className={uploadStyles.homeBtn}>
              Files
            </button>
          )}
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab("basic")}
            className={`${styles.tab} ${activeTab === "basic" ? styles.activeTab : ""}`}
          >
            Basic Stats
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`${styles.tab} ${activeTab === "ai" ? styles.activeTab : ""}`}
          >
            AI-Based Anomaly Detection
          </button>
        </div>

        {activeTab === "basic" ? (
          <AnalyticsDashboard dashboard={dashboard} />
        ) : (
          <AIBasedAnalytics anomalies={dashboard.anomalies ?? []} />

        )}
      </div>
    </div>
  );
}
