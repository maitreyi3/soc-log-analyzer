import os
from flask import Blueprint, jsonify
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
