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
    
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: false,
        error: 'Failed to fetch images',
        message: error.message
      }
    };
  }
}; 