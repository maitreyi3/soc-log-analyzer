import re
from datetime import datetime
from typing import List, Dict, Any
from collections import Counter, defaultdict
from sklearn.ensemble import IsolationForest
import numpy as np

# Apache Log Format Regex
clf_pattern = re.compile(
    r'(?P<ip>\S+) '
    r'(?P<identity>\S+) '
    r'(?P<user>\S+) '
    r'\[(?P<timestamp>[^\]]+)\] '
    r'"(?P<method>\S+) (?P<path>\S+) (?P<protocol>[^"]+)" '
    r'(?P<status>\d{3}) '
    r'(?P<size>\S+) '
    r'"(?P<referrer>[^"]*)" '
    r'"(?P<agent>[^"]*)"(?:\s"?(?P<extra>[^"]*)"?)*'
)

def detect_log_type(line: str) -> str:
    if clf_pattern.match(line):
        return "apache_clf"
    return "unknown"

def parse_apache_clf_line(line: str) -> Dict[str, Any]:
    match = clf_pattern.match(line)
    if not match:
        return None

    data = match.groupdict()
    dt = datetime.strptime(data["timestamp"], "%d/%b/%Y:%H:%M:%S %z")
    timestamp_iso = dt.isoformat()
    size = int(data["size"]) if data["size"].isdigit() else 0

    return {
        "client_ip": data["ip"],
        "timestamp": timestamp_iso,
        "http_method": data["method"],
        "url_path": data["path"],
        "http_status": data["status"],
        "response_size": size,
        "referrer": data["referrer"] or "-",
        "user_agent": data["agent"] or "-"
    }

def parse_apache_log_file(file_path: str, max_lines: int = 1000) -> List[Dict[str, Any]]:
    parsed_logs = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parsed = parse_apache_clf_line(line)
            if parsed:
                parsed_logs.append(parsed)
            if len(parsed_logs) >= max_lines:
                break
    return parsed_logs

def detect_anomalies_ai(entries):
    ip_stats = defaultdict(lambda: {
        'total': 0,
        'errors': 0,
        'timestamps': []
    })

    # Collect stats per IP
    for entry in entries:
        ip = entry.get("client_ip")
        status = str(entry.get("http_status", ""))
        timestamp = entry.get("timestamp")

        if ip and timestamp:
            ip_stats[ip]['total'] += 1
            ip_stats[ip]['timestamps'].append(timestamp)
            if status.startswith("4") or status.startswith("5"):
                ip_stats[ip]['errors'] += 1

    data = []
    ip_list = []
    features_per_ip = {}

    for ip, stats in ip_stats.items():
        total = stats['total']
        errors = stats['errors']
        error_rate = errors / total if total else 0

        # Time window (in seconds)
        timestamps = sorted([datetime.fromisoformat(ts) for ts in stats['timestamps']])
        time_span_sec = (timestamps[-1] - timestamps[0]).total_seconds() if len(timestamps) > 1 else 1

        # Requests per minute
        rpm = round(total / (time_span_sec / 60), 2) if time_span_sec > 0 else total

        # Store per-IP derived features
        features_per_ip[ip] = {
            'total_requests': total,
            'error_requests': errors,
            'error_rate': round(error_rate, 2),
            'requests_per_minute': rpm,
            'time_span_sec': round(time_span_sec, 2)
        }

        data.append([total, error_rate, rpm])
        ip_list.append(ip)

    if not data:
        return []

    # Fit Isolation Forest
    model = IsolationForest(contamination=0.15, random_state=42)
    preds = model.fit_predict(np.array(data))

    anomalies = []
    for idx, label in enumerate(preds):
        if label == -1:
            ip = ip_list[idx]
            stats = features_per_ip[ip]
            total = stats["total_requests"]
            errors = stats["error_requests"]
            err_rate = stats["error_rate"]
            rpm = stats["requests_per_minute"]
            time_span = stats["time_span_sec"]

            confidence = round(min(1.0, err_rate + rpm / 100), 2)

            # Skip low-confidence entries
            if confidence < 0.05:
                continue

            reasons = []

            if err_rate >= 0.9:
                reasons.append(f"Potential brute force - {errors}/{total} failed requests")
            elif err_rate > 0.3:
                reasons.append(f"High error rate - {errors}/{total} ({round(err_rate * 100)}%) requests failed")

            if rpm > 5:
                reasons.append(f"Unusual request burst - {rpm} RPM in {time_span}s")

            if not reasons:
                reasons.append("Unusual behavior - request pattern deviates significantly from baseline")

            anomalies.append({
                "ip": ip,
                "total_requests": total,
                "error_requests": errors,
                "error_rate": err_rate,
                "requests_per_minute": rpm,
                "time_span_sec": time_span,
                "confidence": confidence,
                "reason": " + ".join(reasons)
            })

    return anomalies


def generate_dashboard(logs: List[Dict[str, Any]]) -> Dict[str, Any]:
    total_requests = len(logs)
    ip_counter = Counter()
    status_counter = Counter()
    total_bytes = 0
    hourly_requests = defaultdict(int)
    timeline = defaultdict(list)
    offender_errors = defaultdict(int)
    offender_urls = defaultdict(list)

    for log in logs:
        ip = log["client_ip"]
        status = log["http_status"]
        size = log["response_size"]
        url = log["url_path"]

        try:
            ts = datetime.fromisoformat(log["timestamp"])
            hour_key = ts.strftime("%Y-%m-%d %H:00")
            hourly_requests[hour_key] += 1
            timeline[hour_key].append({
                "ip": ip,
                "status": status,
                "url": url,
                "method": log["http_method"]
            })
        except:
            continue

        ip_counter[ip] += 1
        status_counter[status] += 1
        total_bytes += size

        if status.startswith("4") or status.startswith("5"):
            offender_errors[ip] += 1

        offender_urls[ip].append(url)

    top_offenders = []
    for ip, count in ip_counter.most_common(5):
        error_count = offender_errors[ip]
        success_rate = round(100 * (1 - error_count / count), 2)
        top_urls = [url for url, _ in Counter(offender_urls[ip]).most_common(3)]
        top_offenders.append({
            "ip": ip,
            "total_requests": count,
            "error_requests": error_count,
            "success_rate": success_rate,
            "top_urls": top_urls
        })

    # Timeline summary
    timeline_summary = []
    for hour, events in sorted(timeline.items()):
        total = len(events)
        errors = sum(1 for e in events if e["status"].startswith(("4", "5")))
        error_rate = round((errors / total) * 100, 2) if total else 0
        top_url = Counter(e["url"] for e in events).most_common(1)[0][0]
        top_status = Counter(e["status"] for e in events).most_common(1)[0][0]
        
        timeline_summary.append({
            "hour": hour,
            "top_url": top_url,
            "top_status": top_status,
            "total_events": total,
            "error_rate": error_rate,
            "anomaly": error_rate > 25  # mark anomaly threshold
        })
    avg_per_hour = round(sum(hourly_requests.values()) / max(1, len(hourly_requests)), 2)

    return {
        "basic_stats": {
            "total_requests": total_requests,
            "unique_ips": len(ip_counter),
            "total_bytes_served": total_bytes,
            "avg_requests_per_hour": avg_per_hour,
        },
        "top_offenders": top_offenders,
        "top_urls": [
            {"url": url, "count": count}
            for url, count in Counter(log["url_path"] for log in logs).most_common(5)
        ],
        "status_code_breakdown": dict(status_counter),
        "timeline_summary": timeline_summary,
        "anomalies": detect_anomalies_ai(logs)
    }

