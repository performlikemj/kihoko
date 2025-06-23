/**
 * Azure Function: Get all portfolio categories
 */

const databaseService = require('../shared/database');

module.exports = async function (context, req) {
  context.log('GetCategories function triggered');

  try {
    // Get all categories from database
    const categories = await databaseService.getCategories();

    // Transform categories for frontend
    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
      imageCount: 0 // Will be populated by a separate call if needed
    }));

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
    
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: false,
        error: 'Failed to fetch categories',
        message: error.message
      }
    };
  }
}; 