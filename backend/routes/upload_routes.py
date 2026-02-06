import os
from backend.config import UPLOAD_FOLDER
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.parsers.apache_parser import (
    detect_log_type,
    parse_apache_log_file,
    process_apache_log_file,
    generate_dashboard
) 

upload_bp = Blueprint("upload_bp", __name__)

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

    try:
        result = process_apache_log_file(filepath)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify({
        "message": f"Parsed {result['total_entries']} log entries successfully",
        "preview_events": result["preview"],
        "dashboard": result["dashboard"]
    })
