import os
from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename

from backend.parsers.apache_parser import (
    detect_log_type,
    parse_apache_log_file,
    generate_dashboard
)

analytics_bp = Blueprint("analytics_bp", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "backend", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# File Upload & Analytics

@analytics_bp.route("/upload", methods=["POST"])
def upload_log():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    log_type = request.form.get("log_type", "apache_clf")

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Detect log type from the first line
    with open(filepath, "r", encoding="utf-8") as f:
        first_line = f.readline().strip()
    detected_type = detect_log_type(first_line)

    # Only Apache CLF is supported
    if detected_type != "apache_clf":
        return jsonify({"error": "Uploaded file is not a valid Apache log format"}), 400

    # Parse file
    parsed_logs = parse_apache_log_file(filepath)
    preview = parsed_logs[:50]
    dashboard = generate_dashboard(parsed_logs)

    return jsonify({
        "message": f"Parsed {len(parsed_logs)} log entries successfully",
        "filename": filename,
        "preview_events": preview,
        "dashboard": dashboard
    })

# Fetch Analytics for an Uploaded File
@analytics_bp.route("/analytics/<filename>", methods=["GET"])
def get_analytics(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    # Detect type for safety
    with open(filepath, "r", encoding="utf-8") as f:
        first_line = f.readline().strip()
    detected_type = detect_log_type(first_line)

    if detected_type != "apache_clf":
        return jsonify({"error": "File is not a supported Apache log"}), 400

    parsed_logs = parse_apache_log_file(filepath)
    dashboard = generate_dashboard(parsed_logs)

    return jsonify({
        "filename": filename,
        "total_entries": len(parsed_logs),
        "dashboard": dashboard
    })

@analytics_bp.route("/dashboard", methods=["GET"])
def dashboard_combined():
    files = sorted(os.listdir(UPLOAD_FOLDER))
    if not files:
        return jsonify({"error": "No uploaded files found"}), 404

    latest_file = files[-1]
    filepath = os.path.join(UPLOAD_FOLDER, latest_file)

    with open(filepath, "r", encoding="utf-8") as f:
        first_line = f.readline().strip()
    if detect_log_type(first_line) != "apache_clf":
        return jsonify({"error": "Invalid log format"}), 400

    parsed_logs = parse_apache_log_file(filepath)
    dashboard = generate_dashboard(parsed_logs)

    return jsonify({
        "basic_stats": dashboard.get("basic_stats"),
        "top_urls": dashboard.get("top_urls"),
        "top_offenders": dashboard.get("top_offenders"),
        "timeline_summary": dashboard.get("timeline_summary"),
        "status_code_breakdown": dashboard.get("status_code_breakdown"),
        "anomalies": dashboard.get("anomalies")
    })