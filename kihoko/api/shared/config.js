/**
 * Shared configuration for Azure services
 */

const config = {
  // Azure Cosmos DB
  cosmosDb: {
    endpoint: process.env.COSMOS_DB_ENDPOINT,
    key: process.env.COSMOS_DB_KEY,
    databaseId: 'KihokoPortfolio',
    containerId: 'Portfolio'
  },

  // Azure Blob Storage
  blobStorage: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
    containerName: 'portfolio-images'
  },

  // Application settings
  app: {
    environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT || 'Development',
    allowedImageTypes: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxImageSize: 10 * 1024 * 1024, // 10MB
    thumbnailSize: {
      width: 400,
      height: 400
    }
  }
};

module.exports = config; 