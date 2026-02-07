import os
from flask import Blueprint, jsonify, send_from_directory
from backend.utils.auth_decorators import login_required, admin_required
from backend import config

files_bp = Blueprint('files', __name__)

@files_bp.route('/files', methods=['GET'])
@login_required
def list_uploaded_files():
    files = os.listdir(config.UPLOAD_FOLDER)
    files = [f for f in files if os.path.isfile(os.path.join(config.UPLOAD_FOLDER, f))]
    return jsonify({"files": files})
    
@files_bp.route("/files/<filename>", methods=["GET"])
@login_required
@admin_required
def download_file(filename):
    upload_dir = config.UPLOAD_FOLDER
    file_path = os.path.join(upload_dir, filename)

    if not os.path.isfile(file_path):
        return jsonify({"error": "File not found"}), 404

    return send_from_directory(upload_dir, filename, as_attachment=True)