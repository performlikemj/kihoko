const { app } = require('@azure/functions');
const config = require('../../shared/config');
const databaseService = require('../../shared/database');
const blobStorageService = require('../../shared/blobStorage');
const { jsonResponse, isDatabaseError } = require('../../shared/http');

const CACHE_60 = { 'Cache-Control': 'public, max-age=60' };

function transformProduct(product) {
  const unlimited = product.stock === null || product.stock === undefined;
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    description: product.description,
    priceJpy: product.priceJpy,
    productType: product.productType,
    // Expose stock only as a small number so the UI can show "only 2 left"
    stock: unlimited ? null : Math.min(product.stock, 10),
    // Single source of truth for the max quantity the UI may offer;
    // mirrors the server-side validateCartItems ceiling
    maxPerOrder: unlimited
      ? config.store.maxQuantityPerItem
      : Math.min(product.stock, config.store.maxQuantityPerItem),
    status: product.status,
    images: (product.images || []).map((image) => ({
      url: blobStorageService.getImageUrl(image.blobName),
      thumbnailUrl: blobStorageService.getThumbnailUrl(image.thumbnailBlobName || image.blobName)
    })),
    order: product.order,
    createdAt: product.createdAt
  };
}

app.http('getProducts', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'products/{slugOrId?}',
  handler: async (request, context) => {
    context.log('GetProducts function triggered');

    const slugOrId = request.params.slugOrId;

    try {
      if (slugOrId) {
        const product = await databaseService.getProductBySlugOrId(slugOrId);

        if (!product || product.status === 'hidden') {
          return jsonResponse(404, { success: false, error: 'Product not found' });
        }

        return jsonResponse(200, { success: true, data: transformProduct(product) }, CACHE_60);
      }

      const products = await databaseService.getProducts();
      const transformed = products.map(transformProduct);

      return jsonResponse(
        200,
        { success: true, data: transformed, count: transformed.length },
        CACHE_60
      );

    } catch (error) {
      context.error('Error in GetProducts:', error);

      if (isDatabaseError(error)) {
        // Degrade the list to empty, but never hand the detail page a
        // truthy-but-empty product — it would render a broken page.
        if (slugOrId) {
          return jsonResponse(404, { success: false, error: 'Product not found' });
        }
        return jsonResponse(200, { success: true, data: [], count: 0 }, CACHE_60);
      }

      return jsonResponse(500, { success: false, error: 'Service temporarily unavailable' });
    }
  }
});
