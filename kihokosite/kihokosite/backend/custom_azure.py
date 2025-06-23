from storages.backends.azure_storage import AzureStorage
from django.conf import settings
from azure.storage.blob import generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta

class AzureMediaStorage(AzureStorage):
    """Custom Azure storage backend for media files with optimized settings"""
    account_name = settings.AZURE_ACCOUNT_NAME
    account_key = settings.AZURE_ACCOUNT_KEY
    azure_container = 'media'
    expiration_secs = None
    overwrite_files = True  # Allow overwriting files
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set cache control for better performance
        self.object_parameters = {
            'cache_control': 'public, max-age=31536000',  # 1 year cache
        }

class AzureStaticStorage(AzureStorage):
    """Custom Azure storage backend for static files"""
    account_name = settings.AZURE_ACCOUNT_NAME
    account_key = settings.AZURE_ACCOUNT_KEY
    azure_container = 'static'
    expiration_secs = None
    overwrite_files = True

def generate_sas_url(blob_name, container_name='media', expiry_hours=24):
    """Generate a SAS URL for secure blob access"""
    if not all([settings.AZURE_ACCOUNT_NAME, settings.AZURE_ACCOUNT_KEY]):
        return None
        
    sas_token = generate_blob_sas(
        account_name=settings.AZURE_ACCOUNT_NAME,
        container_name=container_name,
        blob_name=blob_name,
        account_key=settings.AZURE_ACCOUNT_KEY,
        permission=BlobSasPermissions(read=True),
        expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
    )
    
    return f"https://{settings.AZURE_ACCOUNT_NAME}.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"
