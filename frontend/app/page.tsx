"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./HomePage.module.css";

import { checkLogin, logout } from "@/lib/api";

interface UserInfo {
  username: string;
  role: "admin" | "test";
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      checkLogin()
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
      await logout();
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
                GitHub
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
                onClick={() => router.push("/files")}
              >
                File Management
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
          SOC Log Analyzer is a robust log analysis platform built for cybersecurity
          and operations teams to extract meaningful insights from Apache logs,
          without the noise.
        </p>
        <ul className={styles.featureList}>
          <li>✔️ Upload and preview Apache log types</li>
          <li>✔️ Get analytics and security insights in one place</li>
          <li>✔️ Spot irregular behavior through AI-powered analysis</li>
        </ul>
      </section>

      <section className={styles.howItWorks}>
        <h2>Quick Start</h2>
        <div className={styles.steps}>
          {[
            "Login to your account",
            "Upload your log file",
            "Analyze logs and get actionable insights",
          ].map((text, idx) => (
            <div key={idx} className={styles.step}>
              <span className={styles.stepNumber}>{idx + 1}</span>
              <p>{text}</p>
            </div>
          ))}
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
        </div>
      </footer>
    </div>
  );
}
