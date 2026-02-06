import os
from flask import Blueprint, jsonify, send_from_directory, session
from backend import config

files_bp = Blueprint('files', __name__)

@files_bp.route('/files', methods=['GET'])
def list_uploaded_files():
    try:
        files = os.listdir(config.UPLOAD_FOLDER)
        files = [f for f in files if os.path.isfile(os.path.join(config.UPLOAD_FOLDER, f))]
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@files_bp.route("/files/<filename>", methods=["GET"])
def download_file(filename):
    if not session.get("logged_in"):
        return jsonify({"error": "Unauthorized"}), 401

    # (Optional) role-based access
    if session.get("role") != "admin":
        return jsonify({"error": "Forbidden"}), 403

    upload_dir = config.UPLOAD_FOLDER
    file_path = os.path.join(upload_dir, filename)

    if not os.path.isfile(file_path):
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(
        upload_dir,
        filename,
        as_attachment=True
    )
