# soc-log-analyzer

A full-stack web application for uploading, parsing, and analyzing server logs with **basic authentication** and **AI-based anomaly detection**.

**Tech Stack**
- **Frontend:** Next.js (TypeScript)  
- **Backend:** Flask (Python)  
- **Database:** PostgreSQL  
- **Containerization:** Docker 

---

## 🚀 Setup & Run Locally

### 1. Clone the repository
```bash
git clone https://github.com/maitreyi3/soc-log-analyzer.git
cd soc-log-analyzer
```

### 2. Start the stack
```
docker compose up --build
```

### 3. Access the application
Frontend:
```
http://localhost:3000
```

#### Default Development Users

| Username | Password | 
|----------|----------|
| admin | Adm1n!2025 |
| test | TestUser#1 |
 
⚠️ These are development-only credentials automatically seeded in the database.

## AI Anomaly Detection Approach

The anomaly detection logic is implemented in Python using scikit-learn's Isolation Forest model.

Steps:

### 1. Log Parsing

- Apache logs are parsed with a regex matching the Common Log Format (CLF).
- Each log entry extracts fields like IP, timestamp, method, path, status code.

### 2. Feature Engineering
For each unique IP:
- total_requests
- error_rate (4xx + 5xx responses / total requests)
- requests_per_minute (RPM)
- time_span_sec (duration between first and last request)

### 3. Model Training

```
from sklearn.ensemble import IsolationForest
model = IsolationForest(contamination=0.15, random_state=42)
preds = model.fit_predict(feature_array)
```
- Features are passed into an IsolationForest model (contamination=0.15) to detect outliers.

### 4. Anomaly Scoring & Explanation
- Outliers are flagged as anomalies.
- A confidence score is computed based on error rate and request bursts.
- Human-readable reasons are generated, e.g.:
  - Potential brute force
  - Unusual request burst
  - Unusual behavior
 
### 5. Output per anomaly
ip, total_requests, error_requests, error_rate, requests_per_minute, time_span_sec, confidence, reason.

### 6. Dashboard Integration
- Results appear in the AI-based analytics tab with explanations and confidence scores.

## Example Logs
Sample Apache log files are included in the sample_logs/ directory.

### To test:
- Log in with a dev account.
- Navigate to the Upload tab.
- Upload a .log file and view results.

## Reset / Clean Start
```
docker compose down -v
docker compose up --build
```
The -v flag removes Docker volumes, forcing application to re-initialize and re-seed.

