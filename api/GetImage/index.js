/**
 * Azure Function: Get single portfolio image by ID
 */

const databaseService = require('../shared/database');
const blobStorageService = require('../shared/blobStorage');

module.exports = async function (context, req) {
  context.log('GetImage function triggered');

  try {
    const imageId = req.params.id;

    if (!imageId) {
      context.res = {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Image ID is required'
        }
      };
      return;
    }

    // Get image from database
    const image = await databaseService.getImageById(imageId);
    
    if (!image) {
      context.res = {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Image not found'
        }
      };
      return;
    }

    // Transform image for frontend
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

    const response = {
      success: true,
      data: transformedImage
    };

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      },
      body: response
    };

  } catch (error) {
    context.log.error('Error in GetImage:', error);
    context.log.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Check if it's a database connection issue
    const isDatabaseError = error.message?.includes('cosmos') || 
                           error.message?.includes('database') ||
                           error.message?.includes('composite index') ||
                           error.code === 'ECONNREFUSED';
    
    if (isDatabaseError) {
      context.log.warn('Database connection failed, returning demo image');
      
      // Return demo image as fallback
      const demoImage = {
        id: req.params.id,
        title: 'Demo Artwork',
        description: 'This is a demo image while the database is unavailable',
        categoryId: 'demo-category',
        url: `https://picsum.photos/800/600?random=${req.params.id}`,
        thumbnailUrl: `https://picsum.photos/400/400?random=${req.params.id}`,
        width: 800,
        height: 600,
        tags: ['demo'],
        isFeatured: false,
        order: 1,
        createdAt: new Date().toISOString()
      };

      context.res = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
        body: {
          success: true,
          data: demoImage
        }
      };
    } else {
      context.res = {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Internal server error'
        }
      };
    }
  }
}; 