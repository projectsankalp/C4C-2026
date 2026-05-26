import os

class Config:
    SECRET_KEY = os.environ.get('SESSION_SECRET', 'aarogyanet-dev-secret-2024')
    JWT_SECRET_KEY = os.environ.get('SESSION_SECRET', 'aarogyanet-jwt-secret-2024')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds

    # PostgreSQL (primary)
    DATABASE_URL = os.environ.get('DATABASE_URL', '')
    PGHOST = os.environ.get('PGHOST', 'localhost')
    PGPORT = os.environ.get('PGPORT', '5432')
    PGUSER = os.environ.get('PGUSER', 'postgres')
    PGPASSWORD = os.environ.get('PGPASSWORD', '')
    PGDATABASE = os.environ.get('PGDATABASE', 'aarogyanet')

    # SQLite (offline/local sync simulation)
    SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), 'aarogyanet_offline.db')

    # Blockchain proof-of-work difficulty (4 leading zeros)
    BLOCKCHAIN_DIFFICULTY = 4

    # Flask settings
    DEBUG = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    PORT = int(os.environ.get('PORT', 5000))

    # CORS
    CORS_ORIGINS = ['*']
