from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_session import Session
from datetime import timedelta
import os

from backend.routes.auth_routes import auth_bp
from backend.routes.upload_routes import upload_bp
from backend.routes.analytics_routes import analytics_bp
from backend.routes.files import files_bp

from backend.config import (
    UPLOAD_FOLDER,
    SESSION_DIR,
    SECRET_KEY,
    CORS_ORIGINS,
)

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SESSION_DIR, exist_ok=True)

app.config.update(
    SESSION_TYPE="filesystem",
    SESSION_FILE_DIR=SESSION_DIR,
    SESSION_PERMANENT=True,
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1),
    SESSION_COOKIE_NAME="session",
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=os.getenv("FLASK_ENV") == "production",
    SESSION_USE_SIGNER=True,
)

Session(app)

CORS(app, 
     supports_credentials=True, 
     origins=CORS_ORIGINS,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(upload_bp, url_prefix="/api")
app.register_blueprint(analytics_bp, url_prefix="/api")
app.register_blueprint(files_bp, url_prefix="/api")

if __name__ == "__main__":
    # app.run(debug=True, port=8000, host='0.0.0.0')
    app.run(
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
        port=8000,
        host="0.0.0.0"
    )
