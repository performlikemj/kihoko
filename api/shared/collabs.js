// Read-only public projection, shared with the credential-free local preview.
function text(value, cap, required = false) {
  return typeof value === 'string' && value.length <= cap && (!required || value.trim().length > 0);
}

function safeLink(value) {
  if (!text(value, 500) || !/^https?:\/\//i.test(value)) return '';
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? value : '';
  } catch { return ''; }
}

function publicCollab(doc, urls) {
  if (!doc || doc.type !== 'collab' || doc.status !== 'visible' ||
      !text(doc.id, Infinity, true) || !text(doc.title, 120, true) || !text(doc.note, 300) ||
      !Number.isFinite(doc.order) || !text(doc.createdAt, Infinity, true) || !Number.isFinite(Date.parse(doc.createdAt)) ||
      !text(doc.updatedAt, Infinity, true) || !Number.isFinite(Date.parse(doc.updatedAt)) || !Array.isArray(doc.images)) return null;

  const images = doc.images.map(image => {
    if (!image || !text(image.id, Infinity, true) || !text(image.blobName, Infinity, true) ||
        (image.thumbnailBlobName != null && !text(image.thumbnailBlobName, Infinity)) ||
        !Number.isInteger(image.width) || image.width <= 0 || !Number.isInteger(image.height) || image.height <= 0) {
      throw new Error('Malformed collaboration image');
    }
    const url = urls.getImageUrl(image.blobName);
    return {
      url,
      thumbnailUrl: image.thumbnailBlobName ? urls.getThumbnailUrl(image.thumbnailBlobName) || url : url,
      width: image.width,
      height: image.height
    };
  });
  return { id: doc.id, title: doc.title, note: doc.note, link: safeLink(doc.link), images, order: doc.order, createdAt: doc.createdAt };
}

async function listCollabs({ db, urls }) {
  const docs = await db.getCollabs();
  return docs.flatMap(doc => {
    // A single malformed Studio document must never break the public list.
    try { const collab = publicCollab(doc, urls); return collab ? [collab] : []; }
    catch { return []; }
  }).sort((a, b) => a.order - b.order || Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

module.exports = { listCollabs };
