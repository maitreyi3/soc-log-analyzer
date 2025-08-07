from werkzeug.security import generate_password_hash, check_password_hash
from backend.db import get_db_connection

def create_user(username, password):
    conn = get_db_connection()
    cur = conn.cursor()
    hashed_pw = generate_password_hash(password)
    cur.execute("""
        INSERT INTO users (username, password_hash)
        VALUES (%s, %s)
        ON CONFLICT (username) DO NOTHING
    """, (username, hashed_pw))
    conn.commit()
    cur.close()
    conn.close()

def get_user(username):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT username, password_hash FROM users WHERE username = %s", (username,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row

def verify_user(username, password):
    row = get_user(username)
    if not row:
        return False
    return check_password_hash(row[1], password)
