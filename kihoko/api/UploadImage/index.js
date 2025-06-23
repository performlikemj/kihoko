/**
 * Azure Function: Upload portfolio image
 * Handles multipart form data, uploads to blob storage, and saves metadata to database
 */

const databaseService = require('../shared/database');
const blobStorageService = require('../shared/blobStorage');
const { PortfolioImage } = require('../shared/models');

// Simple multipart parser for Azure Functions
function parseMultipartFormData(body, contentType) {
  const boundary = contentType.split('boundary=')[1];
  const parts = body.split(`--${boundary}`);
  const formData = {};
  let files = {};

  for (let part of parts) {
    if (part.includes('Content-Disposition')) {
      const lines = part.split('\r\n');
      const dispositionLine = lines.find(line => line.includes('Content-Disposition'));
      const nameMatch = dispositionLine.match(/name="([^"]+)"/);
      
      if (!nameMatch) continue;
      
      const fieldName = nameMatch[1];
      const isFile = dispositionLine.includes('filename=');
      
      if (isFile) {
        const filenameMatch = dispositionLine.match(/filename="([^"]+)"/);
        const contentTypeLine = lines.find(line => line.includes('Content-Type'));
        
        if (filenameMatch) {
          // Find the file content (after the headers)
          const headerEndIndex = part.indexOf('\r\n\r\n');
          if (headerEndIndex !== -1) {
            const fileContent = part.slice(headerEndIndex + 4, -2); // Remove trailing \r\n
            files[fieldName] = {
              filename: filenameMatch[1],
              contentType: contentTypeLine ? contentTypeLine.split(': ')[1] : 'application/octet-stream',
              content: Buffer.from(fileContent, 'binary')
            };
          }
        }
      } else {
        // Regular form field
        const valueStartIndex = part.indexOf('\r\n\r\n');
        if (valueStartIndex !== -1) {
          const value = part.slice(valueStartIndex + 4, -2).trim();
          formData[fieldName] = value;
        }
      }
    }
  }
  
  return { formData, files };
}

module.exports = async function (context, req) {
  context.log('UploadImage function triggered');

  try {
    // Parse multipart form data
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      context.res = {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'Content-Type must be multipart/form-data'
        }
      };
      return;
    }

    const { formData, files } = parseMultipartFormData(req.rawBody.toString('binary'), contentType);

    // Validate required fields
    if (!files.image) {
      context.res = {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: {
          success: false,
          error: 'No image file provided'
        }
      };
      return;
    }

    const imageFile = files.image;
    const title = formData.title || 'Untitled';
    const description = formData.description || '';
    const categorySlug = formData.categorySlug;
    const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];
    const isFeatured = formData.isFeatured === 'true';
    const order = parseInt(formData.order) || 0;

    // Validate category if provided
    let categoryId = null;
    if (categorySlug) {
      const category = await databaseService.getCategoryBySlug(categorySlug);
      if (!category) {
        context.res = {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
          body: {
            success: false,
            error: `Category '${categorySlug}' not found`
          }
        };
        return;
      }
      categoryId = category.id;
    }

    // Upload image to blob storage
    context.log('Uploading image to blob storage...');
    const uploadResult = await blobStorageService.uploadImage(
      imageFile.content,
      imageFile.filename,
      imageFile.contentType
    );

    // Create image record in database
    const portfolioImage = new PortfolioImage({
      title,
      description,
      categoryId,
      blobName: uploadResult.blobName,
      thumbnailBlobName: uploadResult.thumbnailBlobName,
      fileName: imageFile.filename,
      contentType: imageFile.contentType,
      size: uploadResult.size,
      width: uploadResult.width,
      height: uploadResult.height,
      tags,
      isFeatured,
      order
    });

    const savedImage = await databaseService.createImage(portfolioImage);

    // Return success response
    context.res = {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: true,
        data: {
          id: savedImage.id,
          title: savedImage.title,
          description: savedImage.description,
          categoryId: savedImage.categoryId,
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          width: savedImage.width,
          height: savedImage.height,
          tags: savedImage.tags,
          isFeatured: savedImage.isFeatured,
          order: savedImage.order,
          createdAt: savedImage.createdAt
        },
        message: 'Image uploaded successfully'
      }
    };

  } catch (error) {
    context.log.error('Error in UploadImage:', error);
    
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: {
        success: false,
        error: 'Failed to upload image',
        message: error.message
      }
    };
  }
}; 