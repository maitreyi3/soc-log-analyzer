"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setMessage("Please enter both username and password.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/login",
        { username, password },
        { withCredentials: true }
      );

      setMessage(response.data.message || "Login successful!");

      // Redirect to the upload page after successful login
      if (response.status === 200) {
        window.location.href = "/upload";
      }
    } catch (error) {
      setMessage("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.ribbon}>
        <h2 className={styles.logo}>SOC Log Analyzer</h2>
        <button className={styles.homeButton} onClick={() => router.push("/")}>
                Home
              </button>
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.inputField}
        />

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
