import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

user = os.getenv('MYSQL_USER') or ''
raw_pass = os.getenv('MYSQL_PASS') or ''
password = quote_plus(raw_pass)  # URL encode the password
host = os.getenv('MYSQL_HOST') or ''
port = os.getenv('MYSQL_PORT') or '3306'
db_name = os.getenv('MYSQL_DB') or ''

if not all([user, raw_pass, host, port, db_name]):
    raise RuntimeError("Missing one of required DB env vars: MYSQL_USER, MYSQL_PASS, MYSQL_HOST, MYSQL_PORT, MYSQL_DB")


class Config:
    # Use the URL-encoded password here
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{user}:{password}@{host}:{port}/{db_name}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_HEADERS = 'Content-Type'