#!/usr/bin/env node

/**
 * Secure Desktop Upload Script
 * Uploads images directly to Azure Blob Storage and Cosmos DB
 * Run this script from your local machine only
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');

// Configuration from environment variables
const config = {
  storageConnectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  cosmosConnectionString: process.env.AZURE_COSMOS_CONNECTION_STRING,
  cosmosDatabaseName: process.env.AZURE_COSMOS_DATABASE_NAME || 'kihokodb',
  containerName: 'media'
};

// Validate required environment variables
function validateConfig() {
  const required = ['AZURE_STORAGE_CONNECTION_STRING', 'AZURE_COSMOS_CONNECTION_STRING'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Create a .env file in the scripts directory with these values.');
    process.exit(1);
  }
}

// Initialize Azure clients
function initializeClients() {
  const blobServiceClient = BlobServiceClient.fromConnectionString(config.storageConnectionString);
  const containerClient = blobServiceClient.getContainerClient(config.containerName);
  
  const cosmosClient = new CosmosClient(config.cosmosConnectionString);
  const database = cosmosClient.database(config.cosmosDatabaseName);
  
  return { containerClient, database };
}

// Upload image to blob storage
async function uploadToBlob(containerClient, filePath, fileName) {
  const blobName = `projects/${fileName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  
  console.log(`📤 Uploading ${fileName} to blob storage...`);
  
  const uploadResponse = await blockBlobClient.uploadFile(filePath);
  
  const url = `https://${containerClient.accountName}.blob.core.windows.net/${config.containerName}/${blobName}`;
  
  return {
    blobName,
    url,
    thumbnailUrl: url, // Using same URL for now
    uploadResponse
  };
}

// Save metadata to Cosmos DB
async function saveToDatabase(database, imageData) {
  const container = database.container('images');
  
  const document = {
    id: uuidv4(),
    title: imageData.title,
    description: imageData.description,
    categoryId: imageData.categoryId,
    blobName: imageData.blobName,
    thumbnailBlobName: imageData.blobName,
    fileName: imageData.fileName,
    contentType: imageData.contentType,
    size: imageData.size,
    width: 800, // Default values - you can enhance this with image analysis
    height: 600,
    tags: imageData.tags || ['portfolio'],
    isFeatured: imageData.isFeatured || false,
    order: imageData.order || 0,
    createdAt: new Date().toISOString()
  };
  
  console.log(`💾 Saving metadata to database...`);
  const { resource } = await container.items.create(document);
  
  return resource;
}

// Get categories for selection
async function getCategories(database) {
  const container = database.container('categories');
  const { resources } = await container.items.readAll().fetchAll();
  return resources;
}

// Main upload function
async function uploadImage(filePath, metadata) {
  try {
    validateConfig();
    
    const { containerClient, database } = initializeClients();
    
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const fileName = path.basename(filePath);
    const stats = fs.statSync(filePath);
    
    // Upload to blob storage
    const blobResult = await uploadToBlob(containerClient, filePath, fileName);
    
    // Prepare database record
    const imageData = {
      title: metadata.title || path.parse(fileName).name,
      description: metadata.description || `Professional artwork - ${path.parse(fileName).name}`,
      categoryId: metadata.categoryId,
      blobName: blobResult.blobName,
      fileName: fileName,
      contentType: 'image/jpeg', // Enhance this with proper detection
      size: stats.size,
      tags: metadata.tags,
      isFeatured: metadata.isFeatured,
      order: metadata.order
    };
    
    // Save to database
    const dbResult = await saveToDatabase(database, imageData);
    
    console.log(`✅ Successfully uploaded: ${fileName}`);
    console.log(`   📍 URL: ${blobResult.url}`);
    console.log(`   🆔 Database ID: ${dbResult.id}`);
    
    return {
      success: true,
      blobResult,
      dbResult
    };
    
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
    throw error;
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎨 Kihoko Portfolio - Secure Image Upload

Usage:
  node secure-upload.js <image-path> [options]

Options:
  --title "Title"           Image title
  --description "Desc"      Image description  
  --category-id "uuid"      Category ID
  --tags "tag1,tag2"        Comma-separated tags
  --featured                Mark as featured
  --order 5                 Display order

Examples:
  node secure-upload.js ~/Desktop/artwork.jpg --title "My Art" --featured
  node secure-upload.js image.png --description "Beautiful landscape"
    `);
    
    // Show available categories
    try {
      validateConfig();
      const { database } = initializeClients();
      const categories = await getCategories(database);
      
      if (categories.length > 0) {
        console.log('\n📂 Available Categories:');
        categories.forEach(cat => {
          console.log(`   ${cat.id} - ${cat.name} (${cat.slug})`);
        });
      }
    } catch (error) {
      console.log('\n⚠️  Could not fetch categories (check your configuration)');
    }
    
    return;
  }
  
  const filePath = args[0];
  const metadata = {};
  
  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--title':
        metadata.title = args[++i];
        break;
      case '--description':
        metadata.description = args[++i];
        break;
      case '--category-id':
        metadata.categoryId = args[++i];
        break;
      case '--tags':
        metadata.tags = args[++i].split(',').map(t => t.trim());
        break;
      case '--featured':
        metadata.isFeatured = true;
        break;
      case '--order':
        metadata.order = parseInt(args[++i]);
        break;
    }
  }
  
  await uploadImage(filePath, metadata);
}

// Export for programmatic use
module.exports = { uploadImage, getCategories };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 