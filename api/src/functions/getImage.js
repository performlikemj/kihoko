const { app } = require('@azure/functions');
const databaseService = require('../../shared/database');
const blobStorageService = require('../../shared/blobStorage');

app.http('getImage', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'image/{id}',
  handler: async (request, context) => {
    context.log('GetImage function triggered');

    try {
      const imageId = request.params.id;

      if (!imageId) {
        return {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, error: 'Image ID is required' })
        };
      }

      const image = await databaseService.getImageById(imageId);

      if (!image) {
        return {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ success: false, error: 'Image not found' })
        };
      }

      const transformedImage = {
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
      };

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        },
        body: JSON.stringify({ success: true, data: transformedImage })
      };

    } catch (error) {
      context.error('Error in GetImage:', error);

      const isDatabaseError = error.message?.includes('cosmos') ||
                              error.message?.includes('database') ||
                              error.code === 'ECONNREFUSED';

      if (isDatabaseError) {
        return {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
          body: JSON.stringify({ success: true, data: null })
        };
      }

      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, error: 'Internal server error' })
      };
    }
  }
});
