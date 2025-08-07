"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./UploadPage.module.css";

interface PreviewEvent {
  client_ip: string;
  timestamp: string;
  http_method: string;
  url_path: string;
  http_status: string;
  response_size: number;
  referrer: string;
  user_agent: string;
}

interface Dashboard {
  basic_stats?: {
    total_requests?: number;
    unique_ips?: number;
    total_bytes_served?: number;
    avg_requests_per_hour?: number;
  };
  top_urls?: Array<{ url: string; count: number }>;
  top_offenders?: Array<{
    ip: string;
    total_requests: number;
    error_requests: number;
    success_rate: number;
    top_urls: string[];
  }>;
  status_code_breakdown?: Record<string, number>;
}

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [logType, setLogType] = useState<string>("apache_clf");
  const [preview, setPreview] = useState<PreviewEvent[]>([]);
  const [dashboard, setLocalDashboard] = useState<Dashboard | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview' | 'analytics'>('upload');


  useEffect(() => {
    axios
      .get("http://localhost:8000/api/check_login", { withCredentials: true })
      .then((res) => {
        if (res.data.logged_in) setLoggedIn(true);
        else router.push("/login");
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoadingSession(false));
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview([]);
      setLocalDashboard(null);
      setMessage("");
      setActiveTab('upload');
    }
  };

  const handleUpload = async () => {
    if (!file || !logType) {
      alert("Please select a file and log type first!");
      return;
    }

    setLoading(true);
    setMessage("");
    setPreview([]);
    setLocalDashboard(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("log_type", logType);

      const response = await axios.post(
        "http://localhost:8000/api/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      console.log('Upload response:', response.data);

      setMessage(response.data.message || "Upload successful!");
      setPreview(response.data.preview_events || []);
      setLocalDashboard(response.data.dashboard || null);

      if (response.data.preview_events?.length > 0) {
        setActiveTab('preview');
      } else {
        setActiveTab('upload');
      }

    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        router.push("/login");
      } else {
        setMessage(
          error.response?.data?.error || 
          "Upload failed. Check console for details."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8000/api/logout", {}, { withCredentials: true });
      setLoggedIn(false);
      router.push("/"); 
    } catch (error) {
      console.error(error);
    }
  };

  if (loadingSession) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div>Loading session...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>SOC Log Analyzer</h2>
        <div className={styles.navButtons}>
          <button onClick={() => router.push("/")} className={styles.homeBtn}>
            Home
          </button>
          {loggedIn ? (
            <button onClick={handleLogout} className={styles.logoutBtn}>Sign Out</button>
          ) : (
            <button onClick={() => router.push("/login")} className={styles.loginBtn}>Sign In</button>
          )}
        </div>
      </header>

      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'upload' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Log
        </button>

        {preview.length > 0 && (
          <button 
            className={`${styles.tab} ${activeTab === 'preview' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Log Preview ({preview.length})
          </button>
        )}

        {dashboard && Object.keys(dashboard).length > 0 && (
          <button 
            className={`${styles.tab} ${activeTab === 'analytics' ? styles.activeTab : ''}`}
            onClick={() => router.push("/analytics")}
          >
            View Analytics
          </button>
        )}
      </div>

      {activeTab === 'upload' && (
        <div className={styles.uploadPageLayout}>

          <div className={styles.sidebarInfo}>
          <h3>Need Help?</h3>
          <p>
            Upload a <strong>.log</strong> or <strong>.txt</strong> file from your Apache server logs.<br /><br />
            We will analyze traffic, detect errors, and highlight suspicious behavior like failed logins and IP abuse.
          </p>
        </div>

        <div className={styles.uploadSection}>
          <h2>Upload Log File</h2>

          <div className={styles.fileUpload}>
            <input 
              type="file" 
              accept=".log,.txt" 
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            {file && (
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          <button 
            onClick={handleUpload} 
            disabled={loading || !file}
            className={styles.uploadButton}
          >
            {loading ? (
              <>
                <div className={styles.buttonSpinner}></div>
                Analyzing...
              </>
            ) : (
              "Upload & Analyze"
            )}
          </button>

          {message && (
            <div className={`${styles.message} ${message.includes('failed') || message.includes('error') ? styles.errorMessage : styles.successMessage}`}>
              {message}
            </div>
          )}
          </div>
        </div>
      )}

      {activeTab === 'preview' && preview.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.sectionHeader}>
            <h3>Parsed Log Preview</h3>
            <span className={styles.recordCount}>Showing first {preview.length} records</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Client IP</th>
                  <th>Timestamp</th>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Status</th>
                  <th>Size</th>
                  <th>Referrer</th>
                  <th>User Agent</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((item, idx) => (
                  <tr key={idx}>
                    <td className={styles.ipAddress}>{item.client_ip}</td>
                    <td className={styles.timestamp}>{item.timestamp}</td>
                    <td className={styles.httpMethod}>{item.http_method}</td>
                    <td className={styles.urlPath}>{item.url_path}</td>
                    <td className={`${styles.statusCode} ${styles[`status${item.http_status.charAt(0)}`]}`}>
                      {item.http_status}
                    </td>
                    <td className={styles.responseSize}>{item.response_size}</td>
                    <td className={styles.referrer}>{item.referrer}</td>
                    <td className={styles.userAgent}>{item.user_agent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
