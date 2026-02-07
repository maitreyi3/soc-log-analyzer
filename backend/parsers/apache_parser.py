import re
from datetime import datetime
from typing import List, Dict, Any
from backend.analytics.log_analytics import generate_dashboard

ANOMALY_CONTAMINATION = 0.15
RPM_THRESHOLD = 5
CONFIDENCE_THRESHOLD = 0.05
ERROR_RATE_ANOMALY = 25

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

def parse_apache_log_file(file_path: str, max_lines: int = 50000) -> List[Dict[str, Any]]:
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
