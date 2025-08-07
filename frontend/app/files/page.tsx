"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "./FilePage.module.css";

export default function FileManagementPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/files", { withCredentials: true })
      .then((res) => {
        setFiles(res.data.files || []);
      })
      .catch(() => {
        setError("Failed to load files.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.pageWrapper}>
      {/* Navigation Buttons */}
      <div className={styles.navButtons}>
        <button
          className={styles.navBtn}
          onClick={() => router.push("/")}
        >
          Home
        </button>
        <button
          className={styles.navBtn}
          onClick={() => router.push("/upload")}
        >
          Upload Log
        </button>
      </div>

      <h2 className={styles.pageTitle}>Uploaded Files</h2>

      {loading && <p className={styles.message}>Loading...</p>}
      {error && <p className={styles.message} style={{ color: "red" }}>{error}</p>}
      {!loading && files.length === 0 && (
        <p className={styles.message}>No files uploaded yet.</p>
      )}

      {files.length > 0 && (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>File Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file}>
                <td>{file}</td>
                <td>
                  <button
                    className={styles.downloadBtn}
                    onClick={() =>
                      window.open(`http://localhost:8000/uploads/${file}`, "_blank")
                    }
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
