"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";
import axios from "axios";

interface UserInfo {
  username: string;
  role: "admin" | "test";
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch login status
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/check_login", { withCredentials: true })
      .then((res) => {
        if (res.data.logged_in) {
          setUser({ username: res.data.username, role: res.data.role });
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>SOC Log Analyzer</h1>
        <p className={styles.tagline}>
          Upload logs. Get instant insights. Secure your systems.
        </p>

        <div className={styles.ctaButtons}>
          {!user && (
            <>
              <button
                className={styles.primaryBtn}
                onClick={() => router.push("/login")}
              >
                Login to Continue
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() =>
                  window.open(
                    "https://github.com/maitreyi3/soc-log-analyzer",
                    "_blank"
                  )
                }
              >
                Documentation
              </button>
            </>
          )}

          {user && user.role === "test" && (
            <>
              <button
                className={styles.primaryBtn}
                onClick={() => router.push("/upload")}
              >
                Upload Logs
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() =>
                  window.open(
                    "https://github.com/maitreyi3/soc-log-analyzer",
                    "_blank"
                  )
                }
              >
                Documentation
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <button
                className={styles.primaryBtn}
                onClick={() => router.push("/upload")}
              >
                Upload Logs
              </button>
              <button
                className={styles.primaryBtn}
                onClick={() => router.push("/admin/storage")}
              >
                Storage Management
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={() =>
                  window.open(
                    "https://github.com/maitreyi3/soc-log-analyzer",
                    "_blank"
                  )
                }
              >
                Documentation
              </button>
              <button
                className={styles.secondaryBtn}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </section>

      <section className={styles.features}>
        <h2>About</h2>
        <p>
          SOC Log Analyzer is a powerful tool for security teams to analyze HTTP and system logs.
          Detect anomalies, top offenders, and suspicious activity in minutes.
        </p>
        <ul className={styles.featureList}>
          <li>✔️ Upload and preview Apache log types</li>
          <li>✔️ Get analytics and security insights in one place</li>
          <li>✔️ Admins can manage storage and all uploads</li>
        </ul>
      </section>

      <section className={styles.howItWorks}>
        <h2>Quick Start</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <p>Login to your account</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <p>Upload your log file (HTTP or System)</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <p>Analyze logs and get actionable insights</p>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} SOC Log Analyzer</p>
        <div className={styles.footerLinks}>
          <a
            href="https://github.com/maitreyi3/soc-log-analyzer"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a href="/docs">Documentation</a>
          <a href="/contact">Contact</a>
        </div>
      </footer>
    </div>
  );
}
