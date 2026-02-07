import psycopg2
from backend import config
from psycopg2.extensions import connection

def get_db_connection() -> connection:
    conn = psycopg2.connect(
        host=config.DB_HOST,
        dbname=config.DB_NAME,
        user=config.DB_USER,
        password=config.DB_PASS,
        port=config.DB_PORT
    )
    conn.autocommit = True
    return conn

