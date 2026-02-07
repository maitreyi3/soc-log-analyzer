from dotenv import load_dotenv
import os

load_dotenv()

def require_env(var_name: str) -> str:
    value = os.getenv(var_name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {var_name}")
    return value

DB_HOST = require_env("DB_HOST")
DB_NAME = require_env("DB_NAME")
DB_USER = require_env("DB_USER")
DB_PASS = require_env("DB_PASS")
DB_PORT = require_env("DB_PORT")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))
SESSION_DIR = os.getenv("SESSION_DIR", os.path.join(BASE_DIR, "flask_sessions"))

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = "dev-only-unsafe-secret"

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")