"""
Django settings for kihokosite project.

Generated by 'django-admin startproject' using Django 4.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/4.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.1/ref/settings/
"""

from pathlib import Path
from django.utils.translation import gettext_lazy as _
from decouple import config
import os

# For testing locally, set DJANGO_ENV to 'development'
# `DJANGO_ENV = 'production'
# if DJANGO_ENV == 'production':
#     env_file = '.env.prod'
# else:
#     env_file = '.env.dev'`

# # # For uploading to Azure, uncomment the following line
DJANGO_ENV = config('DJANGO_ENV', default='development')


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
print(BASE_DIR)

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=False, cast=bool)

if DJANGO_ENV == 'production':
    ALLOWED_HOSTS = ['kihoko.com', 'www.kihoko.com']
else:
    ALLOWED_HOSTS = ['127.0.0.1', 'localhost',]


print(f'DEBUG: {DEBUG}')
print(f'DJANGO_ENV: {DJANGO_ENV}')
# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'portfolio',
    'django.contrib.sites',
    'bootstrap5',
    'stripe',
    'storages',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware', 
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
]

LOCALE_PATHS = (
    os.path.join(BASE_DIR, 'locale'),
)

ROOT_URLCONF = 'kihokosite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'portfolio/templates/portfolio')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'portfolio.context_processors.email_verification_status',
                'portfolio.context_processors.site_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'kihokosite.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.1/ref/settings/#databases

if DJANGO_ENV == 'production':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': config('DB_NAME'),
            'USER': config('DB_USER'),
            'PASSWORD': config('DB_PASS'),
            'HOST': config('DB_HOST'),
            'PORT': config('DB_PORT', cast=int),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': os.path.join(BASE_DIR, config('DB_NAME')),
        }
    }


# Password validation
# https://docs.djangoproject.com/en/4.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


AUTHENTICATION_BACKENDS = [
    'portfolio.backends.CaseInsensitiveModelBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Internationalization
# https://docs.djangoproject.com/en/4.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

LANGUAGES = [
    ('en', _('English')),
    ('ja', _('Japanese')),
]

TIME_ZONE = 'UTC'

USE_I18N = True
USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.1/howto/static-files/

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'portfolio/static/')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# Use Whitenoise to serve static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'



# Default primary key field type
# https://docs.djangoproject.com/en/4.1/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


SITE_ID = 1

# Stripe
STRIPE_PUBLIC_KEY = config('STRIPE_PUBLIC_KEY')
STRIPE_SECRET_KEY = config('STRIPE_SECRET_KEY')

# Email settings
EMAIL_BACKEND = config('EMAIL_BACKEND')
EMAIL_HOST = config('EMAIL_HOST') 
EMAIL_PORT = config('EMAIL_PORT', cast=int)
EMAIL_USE_TLS = config('EMAIL_USE_TLS', cast=bool)
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')

# Login settings
LOGIN_URL = '/login/'
LOGOUT_REDIRECT_URL = 'login'


# Logging settings
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'django.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
        'kihokosite': { 
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}

# CSRF settings
if DJANGO_ENV == 'production':
    SESSION_COOKIE_DOMAIN = 'kihoko.com'
    CSRF_COOKIE_DOMAIN = 'kihoko.com'
else:
    SESSION_COOKIE_DOMAIN = None
    CSRF_COOKIE_DOMAIN = None
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [
    'https://kihoko.azurewebsites.net',
    'https://www.kihoko.com',
    'https://kihoko.com',
    'https://*.127.0.0.1'
]

if DJANGO_ENV == 'production':
    # Blob Storage
    DEFAULT_FILE_STORAGE = 'storages.backends.azure_storage.AzureStorage'

    AZURE_ACCOUNT_NAME = config('AZURE_ACCOUNT_NAME')  # your azure account name
    AZURE_ACCOUNT_KEY = config('AZURE_ACCOUNT_KEY')  # your azure account key
    AZURE_CONTAINER = config('AZURE_CONTAINER', 'media')  # the default container
    AZURE_CUSTOM_DOMAIN = f'{AZURE_ACCOUNT_NAME}.blob.core.windows.net'
    
# Media files
if DJANGO_ENV == 'production':
    MEDIA_URL = f'https://{AZURE_CUSTOM_DOMAIN}/{AZURE_CONTAINER}/'
else:
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Add this after your MEDIA_ROOT configuration
if DEBUG:
    print(f"MEDIA_ROOT: {MEDIA_ROOT}")
    print(f"MEDIA_URL: {MEDIA_URL}")
    
    # Add file upload debugging
    LOGGING['loggers']['django.request'] = {
        'handlers': ['file'],
        'level': 'DEBUG',
        'propagate': True,
    }

# Add this after your MEDIA_ROOT configuration
if DJANGO_ENV == 'development':
    # Ensure media directory exists with correct permissions
    for dir_name in ['projects', 'merchandise', 'misc']:  # Match the original paths
        dir_path = os.path.join(MEDIA_ROOT, dir_name)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)
            print(f"Created media directory: {dir_path}")