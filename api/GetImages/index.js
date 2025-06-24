/**
 * Azure Function: Get portfolio images
 * Supports filtering by category and pagination
 */

const databaseService = require('../shared/database');
const blobStorageService = require('../shared/blobStorage');

module.exports = async function (context, req) {
  context.log('GetImages function triggered');

  try {
    const categorySlug = req.params.categorySlug;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const featured = req.query.featured === 'true';

    let images = [];
    let category = null;

    if (featured) {
      // Get featured images
      images = await databaseService.getFeaturedImages(limit);
    } else if (categorySlug) {
      // Get category and its images
      category = await databaseService.getCategoryBySlug(categorySlug);
      
      if (!category) {
        context.res = {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: false,
            error: 'Category not found'
          }
        };
        return;
      }

      images = await databaseService.getImagesByCategory(category.id);
    } else {
      // Get all images with pagination
      images = await databaseService.getImages(null, limit, offset);
    }

    // Transform images for frontend
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
      pagination: {
        limit,
        offset,
        hasMore: transformedImages.length === limit
      }
    };

    if (category) {
      response.category = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      };
    }

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      },
      body: response
    };

  } catch (error) {
    context.log.error('Error in GetImages:', error);
    context.log.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Check if it's a database connection issue
    const isDatabaseError = error.message?.includes('cosmos') || 
                           error.message?.includes('database') ||
                           error.code === 'ECONNREFUSED';
    
    if (isDatabaseError) {
      context.log.warn('Database connection failed, returning demo images');
      
      // Return demo images as fallback
      const demoImages = [
        {
          id: 'demo-1',
          title: 'Demo Artwork 1',
          description: 'This is a demo image - configure your database to see real content',
          categoryId: 'default-1',
          url: 'https://picsum.photos/800/600?random=1',
          thumbnailUrl: 'https://picsum.photos/400/400?random=1',
          width: 800,
          height: 600,
          tags: ['demo'],
          isFeatured: true,
          order: 1,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-2',
          title: 'Demo Artwork 2', 
          description: 'This is a demo image - configure your database to see real content',
          categoryId: 'default-2',
          url: 'https://picsum.photos/800/600?random=2',
          thumbnailUrl: 'https://picsum.photos/400/400?random=2',
          width: 800,
          height: 600,
          tags: ['demo'],
          isFeatured: true,
          order: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: 'demo-3',
          title: 'Demo Artwork 3',
          description: 'This is a demo image - configure your database to see real content',
          categoryId: 'default-3',
          url: 'https://picsum.photos/800/600?random=3',
          thumbnailUrl: 'https://picsum.photos/400/400?random=3',
          width: 800,
          height: 600,
          tags: ['demo'],
          isFeatured: true,
          order: 3,
          createdAt: new Date().toISOString()
        }
      ];

      context.res = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
        body: {
          success: true,
          data: demoImages,
          count: demoImages.length,
          fallback: true,
          message: 'Using demo images - database connection needs configuration',
          pagination: {
            limit: limit,
            offset: offset,
            hasMore: false
          }
        }
      };
    } else {
      context.res = {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Failed to fetch images',
          message: error.message,
          details: process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Development' ? error.stack : undefined
        }
      };
    }
  }
}; 