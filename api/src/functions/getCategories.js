const { app } = require('@azure/functions');
const databaseService = require('../../shared/database');
const blobStorageService = require('../../shared/blobStorage');
const { defaultCategories } = require('../../shared/models');

app.http('getCategories', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'categories',
  handler: async (request, context) => {
    context.log('GetCategories function triggered');

    try {
      const categories = await databaseService.getCategories();

      // Deduplicate by slug
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
      unique.sort((a, b) => (a.order || 0) - (b.order || 0));

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
          context.warn('Failed to fetch cover image for category', category.id, err.message);
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

      return {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        },
        body: JSON.stringify({
          success: true,
          data: transformedCategories,
          count: transformedCategories.length
        })
      };

    } catch (error) {
      context.error('Error in GetCategories:', error);

      const isDatabaseError = error.message?.includes('cosmos') ||
                              error.message?.includes('database') ||
                              error.message?.includes('composite index') ||
                              error.code === 'ECONNREFUSED';

      if (isDatabaseError) {
        context.warn('Database connection failed, returning default categories');
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

        return {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60'
          },
          body: JSON.stringify({
            success: true,
            data: fallbackCategories,
            count: fallbackCategories.length
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
