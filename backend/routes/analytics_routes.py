import os
from flask import Blueprint, request, jsonify
# from werkzeug.utils import secure_filename
from backend.config import UPLOAD_FOLDER
from backend.services.log_analysis_service import LogAnalysisService

analytics_bp = Blueprint("analytics_bp", __name__)

# Fetch Analytics for an Uploaded File
@analytics_bp.route("/analytics/<filename>", methods=["GET"])
def get_analytics(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404
    try:
        result = LogAnalysisService.analyze_apache_log(filepath)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "filename": filename,
        "total_entries": result["total_entries"],
        "dashboard": result["dashboard"]
    })

# Combined Dashboard for the Most Recently Uploaded File
@analytics_bp.route("/dashboard", methods=["GET"])
def dashboard_combined():
    # List all uploaded files
    files = os.listdir(UPLOAD_FOLDER)
    if not files:
        return jsonify({"error": "No uploaded files found"}), 404

    # Determine the most recently modified file
    filepaths = [os.path.join(UPLOAD_FOLDER, f) for f in files]
    latest_path = max(filepaths, key=os.path.getmtime)
    latest_file = os.path.basename(latest_path)

    try:
        result = LogAnalysisService.analyze_apache_log(latest_path)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    dashboard = result["dashboard"]

    return jsonify({
        "filename": latest_file,
        "basic_stats": dashboard.get("basic_stats"),
        "top_urls": dashboard.get("top_urls"),
        "top_offenders": dashboard.get("top_offenders"),
        "timeline_summary": dashboard.get("timeline_summary"),
        "status_code_breakdown": dashboard.get("status_code_breakdown"),
        "anomalies": dashboard.get("anomalies")
    })
