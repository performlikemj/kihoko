/**
 * Upload Ki's tattoo photos to kihoko.com
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
const TATTOO_CATEGORY_ID = 'dc9cad11-7186-41f3-989c-b9eec75e480c';
const TATTOO_CATEGORY_SLUG = 'tattoo-art';

const PHOTOS = [
  '/home/openclaw/.openclaw/media/inbound/file_2---b3e474f6-f041-44c4-b7d6-58a953c99949.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_3---8e5fe3c1-be44-46a8-bad2-f8663e1fc047.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_4---b24a778b-a8ea-481c-abaf-93f6c9a75895.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_5---f29d7a1f-a274-4cb9-8a2c-d50090408016.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_6---0e990a75-bd54-44e0-bbfd-af9132c20aaf.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_7---b58044b3-e3fe-42c1-a335-291c08b23ba5.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_8---868932f4-42b1-4247-be96-2a6e641c6f5d.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_9---1576df21-1b2f-4e61-8edf-c0029047c850.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_10---d75c9114-17a2-4e75-80e7-e70e8046272f.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_11---96fcef98-fd7f-423d-9001-2557decc0a66.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_12---aa3c905c-d364-4daa-8f95-c1772b5061b0.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_13---920a7156-a972-41fe-a171-0534782d2fe4.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_14---347c1ddc-24b2-4206-90c3-5eaaac0deab8.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_15---79a655a5-039c-4079-b933-5f3b0f2fd920.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_16---ccbb99b9-f35d-42fb-9b04-cea69d0a0462.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_17---a2ed7279-2081-4649-a499-d6c5a9026a1a.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_18---c4ea42bb-8993-4374-a7d5-5ae0f40bee08.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_19---15ebbd39-073b-4597-8aa0-f52c3460da51.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_20---0f5423d6-9692-48f6-bb7a-1dac5744135a.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_21---2e69f6cf-63f0-46e0-804d-a097934fdb49.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_22---2101f34c-400a-4ae5-818d-20c564a6febf.jpg',
  '/home/openclaw/.openclaw/media/inbound/file_23---54bc0930-ed37-4583-a572-939875498ef3.jpg',
];

async function main() {
  console.log('🎨 Kihoko Tattoo Photo Upload');
  console.log(`📸 ${PHOTOS.length} photos to upload\n`);

  // Init Azure Blob
  const blobService = BlobServiceClient.fromConnectionString(CONN_STR);
  const containerClient = blobService.getContainerClient(CONTAINER_NAME);

  // Init Cosmos DB
  const cosmosClient = new CosmosClient({ endpoint: COSMOS_ENDPOINT, key: COSMOS_KEY });
  const database = cosmosClient.database('KihokoPortfolio');
  const container = database.container('Portfolio');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < PHOTOS.length; i++) {
    const filePath = PHOTOS[i];
    const filename = path.basename(filePath);
    const blobName = `projects/${TATTOO_CATEGORY_SLUG}/${uuidv4()}.jpg`;

    try {
      // Upload to blob
      const fileData = fs.readFileSync(filePath);
      const blockBlob = containerClient.getBlockBlobClient(blobName);
      await blockBlob.upload(fileData, fileData.length, {
        blobHTTPHeaders: { blobContentType: 'image/jpeg', blobCacheControl: 'public, max-age=31536000' }
      });
      const url = `https://kihokoblob.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`;

      // Save to Cosmos DB
      const doc = {
        id: uuidv4(),
        type: 'image',
        title: `Tattoo ${i + 1}`,
        description: '',
        categoryId: TATTOO_CATEGORY_ID,
        blobName,
        thumbnailBlobName: blobName,
        fileName: filename,
        contentType: 'image/jpeg',
        size: fileData.length,
        width: 0,
        height: 0,
        tags: ['tattoo', 'portfolio'],
        isFeatured: false,
        order: i,
        createdAt: new Date().toISOString()
      };
      await container.items.create(doc);

      console.log(`✅ [${i + 1}/${PHOTOS.length}] ${filename}`);
      console.log(`   🔗 ${url}`);
      success++;
    } catch (err) {
      console.error(`❌ [${i + 1}/${PHOTOS.length}] ${filename}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🎉 Done! ${success} uploaded, ${failed} failed.`);
}

main().catch(console.error);
