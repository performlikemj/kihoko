/**
 * Azure Function: Get all portfolio categories
 */

const databaseService = require('../shared/database');
const { defaultCategories } = require('../shared/models');

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
    context.log.error('Full error details:', JSON.stringify(error, null, 2));
    
    // Check if it's a database connection issue
    const isDatabaseError = error.message?.includes('cosmos') || 
                           error.message?.includes('database') ||
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
          count: fallbackCategories.length,
          fallback: true,
          message: 'Using default categories - database connection needs configuration'
        }
      };
    } else {
      context.res = {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Failed to fetch categories',
          message: error.message,
          details: process.env.AZURE_FUNCTIONS_ENVIRONMENT === 'Development' ? error.stack : undefined
        }
      };
    }
  }
}; 