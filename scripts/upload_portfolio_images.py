#!/usr/bin/env python3
"""
Kihoko Portfolio - Automated Image Upload Script
Monitors a local directory and uploads new/modified images to Azure Blob Storage
and creates metadata records in Cosmos DB.

Based on Microsoft's official BlobServiceClient pattern.
"""

import os
import json
import pathlib
import datetime as dt
from azure.storage.blob import BlobServiceClient, ContentSettings
from azure.cosmos import CosmosClient
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

# Configuration
root = pathlib.Path(os.getenv("WATCH_DIR", "~/Pictures/Portfolio")).expanduser()
statef = pathlib.Path(__file__).with_suffix(".json")  # state.json in same dir as script
mime = {
    ".jpg": "image/jpeg", 
    ".jpeg": "image/jpeg", 
    ".png": "image/png",
    ".gif": "image/gif", 
    ".webp": "image/webp",
    ".heic": "image/heic"
}

def load_last_run():
    """Load the timestamp of the last successful run"""
    if statef.exists():
        try:
            data = json.loads(statef.read_text())
            return dt.datetime.fromisoformat(data["last_run"])
        except (json.JSONDecodeError, KeyError, ValueError):
            pass
    return dt.datetime.min

def save_last_run():
    """Save the current timestamp as the last successful run"""
    statef.write_text(json.dumps({
        "last_run": dt.datetime.utcnow().isoformat(),
        "script_version": "1.0"
    }))

def find_new_images(since):
    """Find all image files modified since the given timestamp"""
    if not root.exists():
        print(f"⚠️  Watch directory doesn't exist: {root}")
        return []
    
    new_files = []
    for p in root.rglob("*"):
        if (p.suffix.lower() in mime and 
            p.is_file() and 
            dt.datetime.fromtimestamp(p.stat().st_mtime) > since):
            new_files.append(p)
    
    return sorted(new_files)

def upload_to_blob(blob_client, file_path):
    """Upload a single file to Azure Blob Storage"""
    blob_name = f"images/{file_path.name}"
    
    with file_path.open("rb") as data:
        blob_client.upload_blob(
            blob_name, 
            data, 
            overwrite=True,
            content_settings=ContentSettings(
                content_type=mime[file_path.suffix.lower()]
            )
        )
    
    # Generate the public URL
    account_name = blob_client.account_name
    container_name = os.getenv("CONTAINER", "media")
    url = f"https://{account_name}.blob.core.windows.net/{container_name}/{blob_name}"
    
    return {
        "blob_name": blob_name,
        "url": url,
        "thumbnail_url": url  # Using same URL for now
    }

def save_to_cosmos(cosmos_client, image_data):
    """Save image metadata to Cosmos DB"""
    try:
        database = cosmos_client.get_database_client(os.getenv("COSMOS_DATABASE", "kihokodb"))
        container = database.get_container_client("images")
        
        # Create the document
        document = {
            "id": str(uuid.uuid4()),
            "title": image_data["title"],
            "description": image_data["description"],
            "categoryId": image_data.get("category_id"),  # Optional
            "blobName": image_data["blob_name"],
            "thumbnailBlobName": image_data["blob_name"],
            "fileName": image_data["file_name"],
            "contentType": image_data["content_type"],
            "size": image_data["size"],
            "width": 800,  # Default - could enhance with image analysis
            "height": 600,
            "tags": ["portfolio", "auto-upload"],
            "isFeatured": image_data.get("is_featured", False),
            "order": 0,
            "createdAt": dt.datetime.utcnow().isoformat()
        }
        
        container.create_item(document)
        return document["id"]
        
    except Exception as e:
        print(f"⚠️  Failed to save to Cosmos DB: {e}")
        return None

def process_image(file_path, blob_service, cosmos_client):
    """Process a single image: upload to blob and save metadata"""
    try:
        # Upload to blob storage
        container_client = blob_service.get_container_client(os.getenv("CONTAINER", "media"))
        blob_result = upload_to_blob(container_client, file_path)
        
        # Prepare metadata
        stats = file_path.stat()
        title = file_path.stem.replace("_", " ").replace("-", " ").title()
        
        image_data = {
            "title": title,
            "description": f"Professional artwork - {title}",
            "blob_name": blob_result["blob_name"],
            "file_name": file_path.name,
            "content_type": mime[file_path.suffix.lower()],
            "size": stats.st_size,
            "is_featured": False  # Could add logic to mark some as featured
        }
        
        # Save to Cosmos DB (if available)
        cosmos_id = None
        if cosmos_client:
            cosmos_id = save_to_cosmos(cosmos_client, image_data)
        
        print(f"✅ {file_path.name}")
        if cosmos_id:
            print(f"   🆔 Database ID: {cosmos_id}")
        print(f"   📍 URL: {blob_result['url']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to process {file_path.name}: {e}")
        return False

def main():
    """Main execution function"""
    print(f"🎨 Kihoko Portfolio Upload - {dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Validate environment
    required_vars = ["AZURE_CONN_STR", "CONTAINER"]
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        print(f"❌ Missing environment variables: {', '.join(missing)}")
        print("💡 Check your .env file")
        return 1
    
    # Load last run timestamp
    last_run = load_last_run()
    print(f"📅 Last run: {last_run.strftime('%Y-%m-%d %H:%M:%S') if last_run != dt.datetime.min else 'Never'}")
    
    # Find new images
    new_images = find_new_images(last_run)
    if not new_images:
        print("📁 No new images found")
        save_last_run()  # Update timestamp even if no files
        return 0
    
    print(f"📸 Found {len(new_images)} new image(s)")
    
    # Initialize Azure clients
    try:
        blob_service = BlobServiceClient.from_connection_string(os.getenv("AZURE_CONN_STR"))
        
        # Cosmos DB is optional
        cosmos_client = None
        if os.getenv("COSMOS_CONN_STR"):
            cosmos_client = CosmosClient.from_connection_string(os.getenv("COSMOS_CONN_STR"))
        else:
            print("ℹ️  No Cosmos DB connection - uploading to blob storage only")
            
    except Exception as e:
        print(f"❌ Failed to initialize Azure clients: {e}")
        return 1
    
    # Process each image
    success_count = 0
    for image_path in new_images:
        if process_image(image_path, blob_service, cosmos_client):
            success_count += 1
    
    # Update state
    if success_count > 0:
        save_last_run()
        print(f"🎉 Successfully uploaded {success_count}/{len(new_images)} images")
    
    return 0 if success_count == len(new_images) else 1

if __name__ == "__main__":
    exit(main()) 