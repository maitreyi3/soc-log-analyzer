from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from backend.services.upload_service import UploadService

upload_bp = Blueprint("upload_bp", __name__)

@upload_bp.route("/upload", methods=["POST"])
def upload_log():
    try:
        file = request.files.get("file")
        log_type = request.form.get("log_type", "apache")

        result = UploadService.handle_upload(file, log_type)

        return jsonify({
            "message": f"Parsed {result['total_entries']} log entries successfully",
            "preview_events": result["preview"],
            "dashboard": result["dashboard"]
        })

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    except Exception:
        return jsonify({"error": "Internal server error"}), 500