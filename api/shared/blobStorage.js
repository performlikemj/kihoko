/**
 * Azure Blob Storage service for portfolio images
 */

const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

class BlobStorageService {
  constructor() {
    this.client = null;
    this.containerClient = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Blob Service Client
      this.client = BlobServiceClient.fromConnectionString(config.blobStorage.connectionString);
      
      // Get container client
      this.containerClient = this.client.getContainerClient(config.blobStorage.containerName);
      
      // Create container if it doesn't exist
      await this.containerClient.createIfNotExists({
        access: 'blob' // Public read access for images
      });

      this.initialized = true;
      console.log('Blob storage service initialized successfully');

    } catch (error) {
      console.error('Failed to initialize blob storage service:', error);
      throw error;
    }
  }

  /**
   * Upload an image and create thumbnail
   */
  async uploadImage(buffer, fileName, contentType) {
    await this.initialize();

    try {
      // Generate unique blob names
      const fileExtension = path.extname(fileName).toLowerCase();
      const uniqueId = uuidv4();
      const blobName = `images/${uniqueId}${fileExtension}`;
      const thumbnailBlobName = `thumbnails/${uniqueId}${fileExtension}`;

      // Validate file type
      if (!config.app.allowedImageTypes.includes(fileExtension)) {
        throw new Error(`File type ${fileExtension} is not allowed`);
      }

      // Validate file size
      if (buffer.length > config.app.maxImageSize) {
        throw new Error('File size exceeds maximum allowed size');
      }

      // Get image metadata using sharp
      const metadata = await sharp(buffer).metadata();

      // Upload original image
      const blobClient = this.containerClient.getBlockBlobClient(blobName);
      await blobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: contentType,
          blobCacheControl: 'public, max-age=31536000' // 1 year
        }
      });

      // Create and upload thumbnail
      const thumbnailBuffer = await sharp(buffer)
        .resize(config.app.thumbnailSize.width, config.app.thumbnailSize.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      const thumbnailBlobClient = this.containerClient.getBlockBlobClient(thumbnailBlobName);
      await thumbnailBlobClient.uploadData(thumbnailBuffer, {
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg',
          blobCacheControl: 'public, max-age=31536000'
        }
      });

      console.log(`Uploaded image: ${blobName} and thumbnail: ${thumbnailBlobName}`);

      return {
        blobName,
        thumbnailBlobName,
        url: blobClient.url,
        thumbnailUrl: thumbnailBlobClient.url,
        size: buffer.length,
        width: metadata.width,
        height: metadata.height,
        contentType
      };

    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  }

  /**
   * Delete an image and its thumbnail
   */
  async deleteImage(blobName, thumbnailBlobName = null) {
    await this.initialize();

    try {
      // Delete original image
      if (blobName) {
        const blobClient = this.containerClient.getBlockBlobClient(blobName);
        await blobClient.deleteIfExists();
        console.log(`Deleted image: ${blobName}`);
      }

      // Delete thumbnail
      if (thumbnailBlobName) {
        const thumbnailBlobClient = this.containerClient.getBlockBlobClient(thumbnailBlobName);
        await thumbnailBlobClient.deleteIfExists();
        console.log(`Deleted thumbnail: ${thumbnailBlobName}`);
      }

      return true;

    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }

  /**
   * Get image URL
   */
  getImageUrl(blobName) {
    if (!blobName) return null;
    
    const blobClient = this.containerClient.getBlockBlobClient(blobName);
    return blobClient.url;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(thumbnailBlobName) {
    if (!thumbnailBlobName) return null;
    
    const thumbnailBlobClient = this.containerClient.getBlockBlobClient(thumbnailBlobName);
    return thumbnailBlobClient.url;
  }

  /**
   * Check if blob exists
   */
  async blobExists(blobName) {
    await this.initialize();

    try {
      const blobClient = this.containerClient.getBlockBlobClient(blobName);
      return await blobClient.exists();
    } catch (error) {
      console.error('Failed to check blob existence:', error);
      return false;
    }
  }

  /**
   * Get blob metadata
   */
  async getBlobMetadata(blobName) {
    await this.initialize();

    try {
      const blobClient = this.containerClient.getBlockBlobClient(blobName);
      const properties = await blobClient.getProperties();
      
      return {
        size: properties.contentLength,
        contentType: properties.contentType,
        lastModified: properties.lastModified,
        etag: properties.etag
      };
    } catch (error) {
      console.error('Failed to get blob metadata:', error);
      return null;
    }
  }

  /**
   * List all blobs in container (for admin purposes)
   */
  async listBlobs(prefix = '') {
    await this.initialize();

    try {
      const blobs = [];
      for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
        blobs.push({
          name: blob.name,
          size: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
          contentType: blob.properties.contentType
        });
      }
      return blobs;
    } catch (error) {
      console.error('Failed to list blobs:', error);
      return [];
    }
  }
}

// Create singleton instance
const blobStorageService = new BlobStorageService();

module.exports = blobStorageService; 