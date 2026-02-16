"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./FilePage.module.css";

import { getFiles, downloadFile } from "@/lib/api";
import type { FileEntry } from "@/lib/api/files";

export default function FileManagementPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleDownload = async (filename: string) => {
    try {
      const blob = await downloadFile(filename);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download file");
    }
  };

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const res = await getFiles();
        setFiles(res.data); // ✅ FileEntry[]
      } catch {
        setError("Failed to load files.");
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.navButtons}>
        <button className={styles.navBtn} onClick={() => router.push("/")}>
          Home
        </button>
        <button className={styles.navBtn} onClick={() => router.push("/upload")}>
          Upload Log
        </button>
      </div>

      <h2 className={styles.pageTitle}>Uploaded Files</h2>

      {loading && <p className={styles.message}>Loading...</p>}

      {error && (
        <p className={styles.message} style={{ color: "red" }}>
          {error}
        </p>
      )}

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
              <tr key={file.name}>
                <td>{file.name}</td>
                <td>
                  <button
                    className={styles.downloadBtn}
                    onClick={() => handleDownload(file.name)}
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
