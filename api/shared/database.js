/**
 * Azure Cosmos DB service for portfolio data
 */

const { CosmosClient } = require('@azure/cosmos');
const config = require('./config');
const { Category, PortfolioImage, defaultCategories } = require('./models');

class DatabaseService {
  constructor() {
    this.client = null;
    this.database = null;
    this.container = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Cosmos DB client
      this.client = new CosmosClient({
        endpoint: config.cosmosDb.endpoint,
        key: config.cosmosDb.key
      });

      // Create database if it doesn't exist
      const { database } = await this.client.databases.createIfNotExists({
        id: config.cosmosDb.databaseId
      });
      this.database = database;

      // Create container if it doesn't exist
      const { container } = await this.database.containers.createIfNotExists({
        id: config.cosmosDb.containerId,
        partitionKey: { paths: ['/type'] }
      });
      this.container = container;

      this.initialized = true;
      console.log('Database service initialized successfully');

      // Initialize default categories
      await this.initializeDefaultCategories();

    } catch (error) {
      console.error('Failed to initialize database service:', error);
      throw error;
    }
  }

  async initializeDefaultCategories() {
    try {
      // Check if categories already exist
      const existingCategories = await this.getCategories();
      
      if (existingCategories.length === 0) {
        console.log('Creating default categories...');
        
        for (const categoryData of defaultCategories) {
          const category = new Category(categoryData);
          await this.createCategory(category);
        }
        
        console.log('Default categories created successfully');
      }
    } catch (error) {
      console.error('Failed to initialize default categories:', error);
    }
  }

  // Category operations
  async getCategories() {
    await this.initialize();
    
    const query = {
      query: 'SELECT * FROM c WHERE c.type = @type ORDER BY c["order"] ASC, c.name ASC',
      parameters: [{ name: '@type', value: 'category' }]
    };

    const { resources } = await this.container.items.query(query).fetchAll();
    return resources;
  }

  async getCategoryBySlug(slug) {
    await this.initialize();
    
    const query = {
      query: 'SELECT * FROM c WHERE c.type = @type AND c.slug = @slug',
      parameters: [
        { name: '@type', value: 'category' },
        { name: '@slug', value: slug }
      ]
    };

    const { resources } = await this.container.items.query(query).fetchAll();
    return resources[0] || null;
  }

  async createCategory(category) {
    await this.initialize();
    
    const { resource } = await this.container.items.create(category.toJSON());
    return resource;
  }

  async updateCategory(id, updates) {
    await this.initialize();
    
    const { resource: existingCategory } = await this.container.item(id, 'category').read();
    const updatedCategory = { ...existingCategory, ...updates, updatedAt: new Date().toISOString() };
    
    const { resource } = await this.container.item(id, 'category').replace(updatedCategory);
    return resource;
  }

  async deleteCategory(id) {
    await this.initialize();
    
    // First check if category has images
    const images = await this.getImagesByCategory(id);
    if (images.length > 0) {
      throw new Error('Cannot delete category that contains images');
    }
    
    await this.container.item(id, 'category').delete();
    return true;
  }

  // Image operations
  async getImages(categoryId = null, limit = 50, offset = 0) {
    await this.initialize();
    
    let query;
    if (categoryId) {
      query = {
        query: `SELECT * FROM c WHERE c.type = @type AND c.categoryId = @categoryId AND c.isActive = true 
                ORDER BY c["order"] ASC, c.createdAt DESC OFFSET @offset LIMIT @limit`,
        parameters: [
          { name: '@type', value: 'image' },
          { name: '@categoryId', value: categoryId },
          { name: '@offset', value: offset },
          { name: '@limit', value: limit }
        ]
      };
    } else {
      query = {
        query: `SELECT * FROM c WHERE c.type = @type AND c.isActive = true 
                ORDER BY c["order"] ASC, c.createdAt DESC OFFSET @offset LIMIT @limit`,
        parameters: [
          { name: '@type', value: 'image' },
          { name: '@offset', value: offset },
          { name: '@limit', value: limit }
        ]
      };
    }

    const { resources } = await this.container.items.query(query).fetchAll();
    return resources;
  }

  async getImagesByCategory(categoryId) {
    await this.initialize();
    
    const query = {
      query: 'SELECT * FROM c WHERE c.type = @type AND c.categoryId = @categoryId ORDER BY c["order"] ASC, c.createdAt DESC',
      parameters: [
        { name: '@type', value: 'image' },
        { name: '@categoryId', value: categoryId }
      ]
    };

    const { resources } = await this.container.items.query(query).fetchAll();
    return resources;
  }

  async getImageById(id) {
    await this.initialize();
    
    try {
      const { resource } = await this.container.item(id, 'image').read();
      return resource;
    } catch (error) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }

  async getFeaturedImages(limit = 10) {
    await this.initialize();
    
    const query = {
      query: `SELECT * FROM c WHERE c.type = @type AND c.isFeatured = true AND c.isActive = true 
              ORDER BY c["order"] ASC, c.createdAt DESC OFFSET 0 LIMIT @limit`,
      parameters: [
        { name: '@type', value: 'image' },
        { name: '@limit', value: limit }
      ]
    };

    const { resources } = await this.container.items.query(query).fetchAll();
    return resources;
  }

  async createImage(image) {
    await this.initialize();
    
    const { resource } = await this.container.items.create(image.toJSON());
    return resource;
  }

  async updateImage(id, updates) {
    await this.initialize();
    
    const { resource: existingImage } = await this.container.item(id, 'image').read();
    const updatedImage = { ...existingImage, ...updates, updatedAt: new Date().toISOString() };
    
    const { resource } = await this.container.item(id, 'image').replace(updatedImage);
    return resource;
  }

  async deleteImage(id) {
    await this.initialize();
    
    await this.container.item(id, 'image').delete();
    return true;
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService; 