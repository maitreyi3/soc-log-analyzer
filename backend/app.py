from flask import Flask
from flask_cors import CORS
from flask_session import Session
from datetime import timedelta
import secrets
import os
from backend.config import UPLOAD_FOLDER
from flask import send_from_directory

app = Flask(__name__)
app.secret_key = secrets.token_hex(16) 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER 

# Create session directory if it doesn't exist
session_dir = os.path.join(os.getcwd(), "backend", "flask_sessions")
os.makedirs(session_dir, exist_ok=True)

# Flask-Session configuration
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = session_dir
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(hours=1)
app.config["SESSION_COOKIE_NAME"] = "session"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False  # False for localhost HTTP
app.config["SESSION_USE_SIGNER"] = True  # Cookie signing for security

Session(app)

CORS(app, 
     supports_credentials=True, 
     origins=["http://localhost:3000"],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

from backend.routes.auth_routes import auth_bp
from backend.routes.upload_routes import upload_bp
from backend.routes.analytics_routes import analytics_bp
from backend.routes.files import files_bp

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(upload_bp, url_prefix="/api")
app.register_blueprint(analytics_bp, url_prefix="/api")
app.register_blueprint(files_bp, url_prefix="/api")

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(debug=True, port=8000, host='0.0.0.0')
