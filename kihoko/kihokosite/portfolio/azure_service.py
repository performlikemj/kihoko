"""
Azure Blob Storage service for portfolio images
Handles direct blob operations for better performance and scalability
"""

import os
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
from azure.core.exceptions import ResourceNotFoundError
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class AzureBlobService:
    """Service for managing portfolio images in Azure Blob Storage"""
    
    def __init__(self):
        self.account_name = settings.AZURE_ACCOUNT_NAME
        self.account_key = settings.AZURE_ACCOUNT_KEY
        self.container_name = 'portfolio-images'  # Dedicated container for portfolio images
        
        if not all([self.account_name, self.account_key]):
            logger.warning("Azure credentials not configured")
            self.client = None
            return
            
        try:
            self.client = BlobServiceClient(
                account_url=f"https://{self.account_name}.blob.core.windows.net",
                credential=self.account_key
            )
            self._ensure_container_exists()
        except Exception as e:
            logger.error(f"Failed to initialize Azure Blob Service: {e}")
            self.client = None
    
    def _ensure_container_exists(self):
        """Ensure the portfolio images container exists"""
        try:
            container_client = self.client.get_container_client(self.container_name)
            if not container_client.exists():
                container_client.create_container(public_access='blob')
                logger.info(f"Created container: {self.container_name}")
        except Exception as e:
            logger.error(f"Failed to ensure container exists: {e}")
    
    def upload_image(self, file_data: bytes, filename: str, project_slug: str = None) -> Optional[str]:
        """
        Upload an image to Azure Blob Storage
        
        Args:
            file_data: Image file data as bytes
            filename: Original filename
            project_slug: Optional project slug for organization
            
        Returns:
            Blob name if successful, None if failed
        """
        if not self.client:
            logger.error("Azure client not initialized")
            return None
            
        try:
            # Generate unique blob name
            file_ext = os.path.splitext(filename)[1].lower()
            unique_id = str(uuid.uuid4())
            
            if project_slug:
                blob_name = f"projects/{project_slug}/{unique_id}{file_ext}"
            else:
                blob_name = f"images/{unique_id}{file_ext}"
            
            # Upload the blob
            blob_client = self.client.get_blob_client(
                container=self.container_name, 
                blob=blob_name
            )
            
            blob_client.upload_blob(
                file_data, 
                overwrite=True,
                content_settings={
                    'content_type': self._get_content_type(file_ext),
                    'cache_control': 'public, max-age=31536000'  # 1 year cache
                }
            )
            
            logger.info(f"Successfully uploaded blob: {blob_name}")
            return blob_name
            
        except Exception as e:
            logger.error(f"Failed to upload image: {e}")
            return None
    
    def delete_image(self, blob_name: str) -> bool:
        """Delete an image from Azure Blob Storage"""
        if not self.client:
            return False
            
        try:
            blob_client = self.client.get_blob_client(
                container=self.container_name, 
                blob=blob_name
            )
            blob_client.delete_blob()
            logger.info(f"Successfully deleted blob: {blob_name}")
            return True
            
        except ResourceNotFoundError:
            logger.warning(f"Blob not found for deletion: {blob_name}")
            return True  # Consider it successful if already gone
        except Exception as e:
            logger.error(f"Failed to delete image: {e}")
            return False
    
    def get_image_url(self, blob_name: str, use_sas: bool = False, expiry_hours: int = 24) -> Optional[str]:
        """
        Get the URL for an image
        
        Args:
            blob_name: Name of the blob
            use_sas: Whether to generate a SAS URL for private access
            expiry_hours: Hours until SAS token expires
            
        Returns:
            Image URL or None if failed
        """
        if not blob_name:
            return None
            
        if not self.client:
            # Fallback to direct URL if client not available
            return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}"
        
        try:
            if use_sas:
                # Generate SAS URL for private access
                sas_token = generate_blob_sas(
                    account_name=self.account_name,
                    container_name=self.container_name,
                    blob_name=blob_name,
                    account_key=self.account_key,
                    permission=BlobSasPermissions(read=True),
                    expiry=datetime.utcnow() + timedelta(hours=expiry_hours)
                )
                return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}?{sas_token}"
            else:
                # Public URL (container must have public read access)
                return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{blob_name}"
                
        except Exception as e:
            logger.error(f"Failed to generate image URL: {e}")
            return None
    
    def list_project_images(self, project_slug: str) -> List[Dict]:
        """List all images for a specific project"""
        if not self.client:
            return []
            
        try:
            container_client = self.client.get_container_client(self.container_name)
            blobs = container_client.list_blobs(name_starts_with=f"projects/{project_slug}/")
            
            images = []
            for blob in blobs:
                images.append({
                    'blob_name': blob.name,
                    'url': self.get_image_url(blob.name),
                    'size': blob.size,
                    'last_modified': blob.last_modified,
                })
            
            return images
            
        except Exception as e:
            logger.error(f"Failed to list project images: {e}")
            return []
    
    def _get_content_type(self, file_ext: str) -> str:
        """Get content type based on file extension"""
        content_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
        }
        return content_types.get(file_ext.lower(), 'application/octet-stream')

# Global instance
azure_blob_service = AzureBlobService() 