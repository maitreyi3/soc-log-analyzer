from dotenv import load_dotenv
import os

load_dotenv()

DB_HOST = os.getenv("DB_HOST")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_PORT = os.getenv("DB_PORT")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", os.path.join(BASE_DIR, "uploads"))
SESSION_DIR = os.getenv("SESSION_DIR", os.path.join(BASE_DIR, "flask_sessions"))

SECRET_KEY = os.getenv("SECRET_KEY", "dev-only-unsafe-secret")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")