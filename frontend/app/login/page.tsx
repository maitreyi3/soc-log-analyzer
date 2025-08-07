"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:8000/api/login",
        { username, password },
        { withCredentials: true }
      );
      setMessage(res.data.message || "Login successful!");
      if (res.status === 200) router.push("/upload");
    } catch {
      setMessage("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.ribbon}>
        <h2 className={styles.logo}>SOC Log Analyzer</h2>
        <div className={styles.navButtons}>
          <button
            className={styles.homeBtn}
            onClick={() => router.push("/")}
          >
            Home
          </button>
        </div>
      </div>

      <div className={styles.loginCard}>
        <h1 className={styles.heading}>Login</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.inputField}
        />

        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.inputField}
          />
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M17.94 17.94A10.05 10.05 0 0 1 12 20c-5.523 0-10-4.477-10-10 0-2.136.674-4.113 1.82-5.76"/>
                <path d="M1 1l22 22"/>
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M14.12 5.88A9.965 9.965 0 0 1 22 10c0 1.986-.732 3.805-1.94 5.18"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        <button onClick={handleLogin} className={styles.loginButton}>
          Login
        </button>

        {message && <p className={styles.message}>{message}</p>}

        <p className={styles.subtleNote}>
          Internal demo use only – No sign-up required
        </p>
      </div>
    </div>
  );
}
