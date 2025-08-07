import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.parsers.apache_parser import (
    detect_log_type,
    parse_apache_log_file,
    generate_dashboard
) 

upload_bp = Blueprint("upload_bp", __name__)
UPLOAD_FOLDER = os.path.join(os.getcwd(), "backend", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@upload_bp.route("/upload", methods=["POST"])
def upload_log():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    log_type = request.form.get("log_type", "")

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    with open(filepath, "r", encoding="utf-8") as f:
        first_line = f.readline().strip()
    detected_type = detect_log_type(first_line)

    if log_type == "apache_clf" and detected_type != "apache_clf":
        return jsonify({"error": "Uploaded file does not match Apache log format"}), 400

    if detected_type == "apache_clf":
        parsed_logs = parse_apache_log_file(filepath)
    else:
        return jsonify({"error": "Unsupported or unknown log format"}), 400

    preview = parsed_logs[:50]
    dashboard = generate_dashboard(parsed_logs)

    return jsonify({
        "message": f"Parsed {len(parsed_logs)} log entries successfully",
        "preview_events": preview,
        "dashboard": dashboard
    })
