def detect_anomalies(parsed_logs):
    ip_counter = {}
    anomalies = []

    for entry in parsed_logs:
        ip = entry.get("client_ip")
        if not ip:
            continue
        ip_counter[ip] = ip_counter.get(ip, 0) + 1

    for ip, count in ip_counter.items():
        if count > 100:
            anomalies.append({
                "timestamp": "N/A",
                "client_ip": ip,
                "anomaly_type": "High Traffic",
                "details": f"{count} requests from IP"
            })

    return anomalies
