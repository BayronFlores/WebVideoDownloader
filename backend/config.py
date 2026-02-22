import os
from dotenv import load_dotenv

load_dotenv()

IS_PRODUCTION = os.environ.get("FLASK_ENV", "production") != "development"


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "clave_super_segura_cambia_en_produccion")

    # Base de datos
    DB_USER     = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    DB_HOST     = os.environ.get("DB_HOST", "localhost")
    DB_PORT     = os.environ.get("DB_PORT", "5432")
    DB_NAME     = os.environ.get("DB_NAME", "youtube_mp3")

    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        "?sslmode=require"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,       # Reconecta si la conexión cayó
        "pool_recycle": 300,
    }

    # Sesiones del lado servidor
    SESSION_TYPE       = "filesystem"
    SESSION_PERMANENT  = False
    SESSION_USE_SIGNER = True
    SESSION_KEY_PREFIX = "yt_mp3:"

    # Cookie de sesión
    SESSION_COOKIE_NAME     = "session"
    SESSION_COOKIE_PATH     = "/"
    SESSION_COOKIE_HTTPONLY = True

    # En producción (HTTPS, dominios cruzados) necesita SameSite=None + Secure=True
    # En desarrollo puede ser Lax + Secure=False
    SESSION_COOKIE_SAMESITE = "None" if IS_PRODUCTION else "Lax"
    SESSION_COOKIE_SECURE   = IS_PRODUCTION   # True en producción (Render usa HTTPS)

    # Flask-Login
    REMEMBER_COOKIE_SECURE   = IS_PRODUCTION
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SAMESITE = "None" if IS_PRODUCTION else "Lax"
