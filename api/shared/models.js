/**
 * Data models for Kihoko Portfolio
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Portfolio Category model
 */
class Category {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.type = 'category';
    this.name = data.name || '';
    this.slug = data.slug || this.generateSlug(data.name);
    this.description = data.description || '';
    this.coverImageId = data.coverImageId || null;
    this.order = data.order || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      slug: this.slug,
      description: this.description,
      coverImageId: this.coverImageId,
      order: this.order,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Portfolio Image model
 */
class PortfolioImage {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.type = 'image';
    this.title = data.title || 'Untitled';
    this.description = data.description || '';
    this.categoryId = data.categoryId || null;
    this.blobName = data.blobName || '';
    this.thumbnailBlobName = data.thumbnailBlobName || '';
    this.fileName = data.fileName || '';
    this.contentType = data.contentType || '';
    this.size = data.size || 0;
    this.width = data.width || 0;
    this.height = data.height || 0;
    this.order = data.order || 0;
    this.tags = data.tags || [];
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isFeatured = data.isFeatured || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      categoryId: this.categoryId,
      blobName: this.blobName,
      thumbnailBlobName: this.thumbnailBlobName,
      fileName: this.fileName,
      contentType: this.contentType,
      size: this.size,
      width: this.width,
      height: this.height,
      order: this.order,
      tags: this.tags,
      isActive: this.isActive,
      isFeatured: this.isFeatured,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Default categories for the portfolio
 */
const defaultCategories = [
  {
    name: 'Tattoo Art',
    slug: 'tattoo-art',
    description: 'Tattoo photography and artwork',
    order: 1
  },
  {
    name: 'Art Photography',
    slug: 'art-photography',
    description: 'Artistic photography and visual art',
    order: 2
  },
  {
    name: 'Digital Art',
    slug: 'digital-art',
    description: 'Digital artwork and illustrations',
    order: 3
  }
];

module.exports = {
  Category,
  PortfolioImage,
  defaultCategories
}; 