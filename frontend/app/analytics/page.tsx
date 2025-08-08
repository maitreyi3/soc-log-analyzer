// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import axios from "axios";
// import AnalyticsDashboard from "./BasicStatsTab";
// import AIBasedAnalytics from "./AIBasedTab";
// import uploadStyles from "../upload/UploadPage.module.css"; 
// import styles from "./AnalyticsPage.module.css";      

// export default function AnalyticsPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [dashboard, setDashboard] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState<"basic" | "ai">("basic");
//   const [userRole, setUserRole] = useState<"admin" | "test" | null>(null);

//   useEffect(() => {
//     // load analytics data
//     axios
//       .get("http://localhost:8000/api/dashboard", { withCredentials: true })
//       .then(res => setDashboard(res.data))
//       .catch(() => setDashboard({ error: true }));

//     // load role for conditional Files button
//     axios
//       .get("http://localhost:8000/api/check_login", { withCredentials: true })
//       .then(res => res.data.logged_in && setUserRole(res.data.role))
//       .catch(() => setUserRole(null));
//   }, [searchParams]);

//   if (!dashboard) {
//     return (
//       <div className={styles.spinnerContainer}>
//         <div className={styles.spinner} />
//         Loading dashboard...
//       </div>
//     );
//   }

//   if (dashboard.error) {
//     return (
//       <div className={styles.errorContainer}>
//         ❌ Failed to load dashboard data. Please upload a valid log file.
//       </div>
//     );
//   }

//   return (
//     <div className={styles.container}>
//       <header className={uploadStyles.header}>
//         <h2 className={uploadStyles.logo}>Analytics Dashboard</h2>
//         <div className={uploadStyles.navButtons}>
//           <button onClick={() => router.push("/")} className={uploadStyles.homeBtn}>
//             Home
//           </button>
//           <button onClick={() => router.push("/upload")} className={uploadStyles.homeBtn}>
//             Upload
//           </button>
//           {userRole === "admin" && (
//             <button onClick={() => router.push("/files")} className={uploadStyles.homeBtn}>
//               Files
//             </button>
//           )}
//         </div>
//       </header>

//       <div className={styles.content}>
//         <div className={styles.tabs}>
//           <button
//             onClick={() => setActiveTab("basic")}
//             className={`${styles.tab} ${activeTab === "basic" ? styles.activeTab : ""}`}
//           >
//             Basic Stats
//           </button>
//           <button
//             onClick={() => setActiveTab("ai")}
//             className={`${styles.tab} ${activeTab === "ai" ? styles.activeTab : ""}`}
//           >
//             AI-Based Anomaly Detection
//           </button>
//         </div>

//         {activeTab === "basic" ? (
//           <AnalyticsDashboard dashboard={dashboard} />
//         ) : (
//           <AIBasedAnalytics dashboard={dashboard} />
//         )}
//       </div>
//     </div>
//   );
// }

'use client';

import React, { Suspense } from 'react';
import AnalyticsPageInner from './AnalyticsPageInner';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div>Loading analytics...</div>}>
      <AnalyticsPageInner />
    </Suspense>
  );
}
