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
    containerName: 'media'
  },

  // Stripe payments
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },

  // Online store settings
  store: {
    currency: 'jpy', // zero-decimal: amounts are whole yen
    // Public site URL for Stripe success/cancel redirects. Set in production
    // (https://kihoko.com) so redirect URLs never depend on request headers;
    // leave unset locally so the browser's Origin (localhost:3000) is used.
    publicBaseUrl: process.env.PUBLIC_SITE_URL || null,
    allowedShippingCountries: ['JP'],
    defaultShippingJpy: parseInt(process.env.STORE_SHIPPING_FLAT_JPY, 10) || 1000,
    maxQuantityPerItem: 10,
    maxCartLines: 12
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