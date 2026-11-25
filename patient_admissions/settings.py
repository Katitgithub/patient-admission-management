"""Basic settings for running the Django project."""

import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "local-development-key")
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"
ALLOWED_HOSTS = os.getenv(
    "DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1"
).split(",")

INSTALLED_APPS = [
    "corsheaders",
    "patients",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
]

ROOT_URLCONF = "patient_admissions.urls"
WSGI_APPLICATION = "patient_admissions.wsgi.application"

# Use DATABASE_URL on the live server. Use SQLite on your computer.
database_url = os.getenv("DATABASE_URL", "").strip()
if database_url:
    DATABASES = {
        "default": dj_database_url.parse(database_url, conn_max_age=600)
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Let the local React app and the deployed React app call this API.
CORS_ALLOWED_ORIGINS = [
    address.strip()
    for address in os.getenv(
        "DJANGO_CORS_ALLOWED_ORIGINS", "http://localhost:5173"
    ).split(",")
    if address.strip()
]
