/**
 * Azure Function: Get all portfolio categories
 */

const databaseService = require('../shared/database');
const blobStorageService = require('../shared/blobStorage');
const { defaultCategories } = require('../shared/models');

module.exports = async function (context, req) {
  context.log('GetCategories function triggered');

  try {
    // Get all categories from database
    const categories = await databaseService.getCategories();

    // Deduplicate by slug. Prefer entries that have a cover image or are newer
    const mapBySlug = new Map();
    for (const cat of categories) {
      const existing = mapBySlug.get(cat.slug);
      if (!existing) {
        mapBySlug.set(cat.slug, cat);
      } else {
        const hasCover = !!cat.coverImageId;
        const existingHasCover = !!existing.coverImageId;
        const newer = new Date(cat.createdAt) > new Date(existing.createdAt);

        if ((hasCover && !existingHasCover) || (!existingHasCover && newer) || (hasCover && newer)) {
          mapBySlug.set(cat.slug, cat);
        }
      }
    }
    const unique = Array.from(mapBySlug.values());

    // Sort by order field
    unique.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Transform categories for frontend and include cover image URL
    const transformedCategories = [];
    for (const category of unique) {
      let coverImageUrl = null;

      try {
        if (category.coverImageId) {
          const img = await databaseService.getImageById(category.coverImageId);
          if (img) {
            coverImageUrl =
              blobStorageService.getThumbnailUrl(img.thumbnailBlobName) ||
              blobStorageService.getImageUrl(img.blobName);
          }
        } else {
          const imgs = await databaseService.getImagesByCategory(category.id);
          if (imgs.length > 0) {
            const randomImg = imgs[Math.floor(Math.random() * imgs.length)];
            coverImageUrl =
              blobStorageService.getThumbnailUrl(randomImg.thumbnailBlobName) ||
              blobStorageService.getImageUrl(randomImg.blobName);
          }
        }
      } catch (err) {
        context.log.warn('Failed to fetch cover image for category', category.id, err.message);
      }

      transformedCategories.push({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        order: category.order,
        isActive: category.isActive,
        coverImageUrl,
        imageCount: 0,
      });
    }

    context.res = {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 5 minutes cache
      },
      body: {
        success: true,
        data: transformedCategories,
        count: transformedCategories.length
      }
    };

  } catch (error) {
    context.log.error('Error in GetCategories:', error);
    context.log.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Check if it's a database connection issue or indexing issue
    const isDatabaseError = error.message?.includes('cosmos') || 
                           error.message?.includes('database') ||
                           error.message?.includes('composite index') ||
                           error.code === 'ECONNREFUSED';
    
    if (isDatabaseError) {
      context.log.warn('Database connection failed, returning default categories');
      
      // Return default categories as fallback
      const fallbackCategories = defaultCategories.map((cat, index) => ({
        id: `default-${index + 1}`,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        order: cat.order,
        isActive: true,
        coverImageUrl: null,
        imageCount: 0
      }));

      context.res = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60' // Shorter cache for fallback
        },
        body: {
          success: true,
          data: fallbackCategories,
          count: fallbackCategories.length
        }
      };
    } else {
      context.res = {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Service temporarily unavailable',
          message: 'Please try again later'
        }
      };
    }
  }
};
