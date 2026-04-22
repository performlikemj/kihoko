/**
 * Upload Ki's ceramics photo to kihoko.com
 * Uploads to Azure Blob Storage + saves metadata to Cosmos DB
 */

const { BlobServiceClient } = require('@azure/storage-blob');
const { CosmosClient } = require('@azure/cosmos');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const CONN_STR = process.env.AZURE_STORAGE_CONNECTION_STRING;
const COSMOS_ENDPOINT = process.env.COSMOS_DB_ENDPOINT;
const COSMOS_KEY = process.env.COSMOS_DB_KEY;
const CONTAINER_NAME = 'media';
const CERAMICS_CATEGORY_SLUG = 'ceramics';

// ceramics category ID - you'll need to find this in your Cosmos DB
const CERAMICS_CATEGORY_ID = process.env.CERAMICS_CATEGORY_ID;

const PHOTO = '/home/openclaw/.openclaw/media/inbound/file_30---9c3f760c-ebe2-4c29-be98-156df9d2a480.jpg';

async function main() {
  console.log('🏺 Kihoko Ceramics Photo Upload');
  console.log(`📸 Photo: ${PHOTO}\n`);

  if (!CERAMICS_CATEGORY_ID) {
    console.error('❌ CERAMICS_CATEGORY_ID environment variable not set');
    console.log('   Please set it to the category ID for ceramics in your Cosmos DB');
    process.exit(1);
  }

  // Init Azure Blob
  const blobService = BlobServiceClient.fromConnectionString(CONN_STR);
  const containerClient = blobService.getContainerClient(CONTAINER_NAME);

  // Init Cosmos DB
  const cosmosClient = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
  const database = cosmosClient.database('KihokoPortfolio');
  const container = database.container('Portfolio');

  const filename = path.basename(PHOTO);
  const blobName = `projects/${CERAMICS_CATEGORY_SLUG}/${uuidv4()}.jpg`;

  try {
    // Upload to blob
    const fileData = fs.readFileSync(PHOTO);
    const blockBlob = containerClient.getBlockBlobClient(blobName);
    await blockBlob.upload(fileData, fileData.length, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg', blobCacheControl: 'public, max-age=31536000' }
    });
    const url = `https://kihokoblob.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`;

    // Save to Cosmos DB
    const doc = {
      id: uuidv4(),
      type: 'image',
      title: 'Ceramics',
      description: '',
      categoryId: CERAMICS_CATEGORY_ID,
      blobName,
      thumbnailBlobName: blobName,
      fileName: filename,
      contentType: 'image/jpeg',
      size: fileData.length,
      width: 0,
      height: 0,
      tags: ['ceramics', 'portfolio'],
      isFeatured: false,
      order: 0,
      createdAt: new Date().toISOString()
    };
    await container.items.create(doc);

    console.log(`✅ Uploaded successfully!`);
    console.log(`   🔗 ${url}`);
  } catch (err) {
    console.error(`❌ Failed: ${err.message}`);
    process.exit(1);
  }
}

main().catch(console.error);
