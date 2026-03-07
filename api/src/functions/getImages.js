const { app } = require('@azure/functions');
const databaseService = require('../../shared/database');
const blobStorageService = require('../../shared/blobStorage');

app.http('getImages', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'images/{categorySlug?}',
  handler: async (request, context) => {
    context.log('GetImages function triggered');

    try {
      const categorySlug = request.params.categorySlug;
      const url = new URL(request.url);
      const limit = parseInt(url.searchParams.get('limit')) || 20;
      const offset = parseInt(url.searchParams.get('offset')) || 0;
      const featured = url.searchParams.get('featured') === 'true';

      let images = [];
      let category = null;

      if (featured) {
        images = await databaseService.getFeaturedImages(limit);
      } else if (categorySlug) {
        category = await databaseService.getCategoryBySlug(categorySlug);
        if (!category) {
          return {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ success: false, error: 'Category not found' })
          };
        }
        images = await databaseService.getImagesByCategory(category.id);
      } else {
        images = await databaseService.getImages(null, limit, offset);
      }

      const transformedImages = images.map(image => ({
        id: image.id,
        title: image.title,
        description: image.description,
        categoryId: image.categoryId,
        url: blobStorageService.getImageUrl(image.blobName),
        thumbnailUrl: blobStorageService.getThumbnailUrl(image.thumbnailBlobName),
        width: image.width,
        height: image.height,
        tags: image.tags,
        isFeatured: image.isFeatured,
        order: image.order,
        createdAt: image.createdAt
      }));

      const response = {
        success: true,
        data: transformedImages,
        count: transformedImages.length,
        pagination: { limit, offset, hasMore: transformedImages.length === limit }
      };

      if (category) {
        response.category = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description
        };
      }

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        },
        body: JSON.stringify(response)
      };

    } catch (error) {
      context.error('Error in GetImages:', error);

      const isDatabaseError = error.message?.includes('cosmos') ||
                              error.message?.includes('database') ||
                              error.message?.includes('composite index') ||
                              error.code === 'ECONNREFUSED';

      if (isDatabaseError) {
        return {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
          },
          body: JSON.stringify({
            success: true,
            data: [],
            count: 0,
            pagination: { limit: 20, offset: 0, hasMore: false }
          })
        };
      }

      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          error: 'Service temporarily unavailable',
          message: 'Please try again later'
        })
      };
    }
  }
});
