#!/usr/bin/env node

/**
 * Kihoko Store Manager
 *
 * Friendly command-line tool for running the online shop: add items,
 * change prices, check stock, and see orders that need shipping.
 * Designed so it can be driven by Kihoko's AI assistant — every command
 * prints plain confirmation of what it did.
 *
 * Talks to the SAME database and container the live API uses
 * (KihokoPortfolio / Portfolio), so changes appear on the website
 * within a minute.
 *
 * Setup: needs a .env file in this directory with
 *   COSMOS_DB_ENDPOINT, COSMOS_DB_KEY, AZURE_STORAGE_CONNECTION_STRING
 * (same values as api/local.settings.json).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { CosmosClient } = require('@azure/cosmos');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

// Must match api/shared/config.js
const DATABASE_ID = process.env.COSMOS_DB_DATABASE_ID || 'KihokoPortfolio';
const CONTAINER_ID = process.env.COSMOS_DB_CONTAINER_ID || 'Portfolio';
const BLOB_CONTAINER = process.env.BLOB_CONTAINER_NAME || 'media';

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
};

function getContainer() {
  let client;
  if (process.env.COSMOS_DB_ENDPOINT && process.env.COSMOS_DB_KEY) {
    client = new CosmosClient({
      endpoint: process.env.COSMOS_DB_ENDPOINT,
      key: process.env.COSMOS_DB_KEY
    });
  } else if (process.env.AZURE_COSMOS_CONNECTION_STRING) {
    client = new CosmosClient(process.env.AZURE_COSMOS_CONNECTION_STRING);
  } else {
    fail(
      'Missing database credentials.\n' +
      'Add COSMOS_DB_ENDPOINT and COSMOS_DB_KEY to the .env file in the scripts folder.'
    );
  }
  return client.database(DATABASE_ID).container(CONTAINER_ID);
}

function getBlobContainer() {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    fail(
      'Missing AZURE_STORAGE_CONNECTION_STRING in .env — needed to upload product photos.'
    );
  }
  return BlobServiceClient.fromConnectionString(connectionString).getContainerClient(BLOB_CONTAINER);
}

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function formatYen(amount) {
  if (amount === null || amount === undefined) return '-';
  return `¥${Number(amount).toLocaleString('ja-JP')}`;
}

/** Accepts "12000", "¥12,000", "12,000 yen" — returns integer yen */
function parseYen(value) {
  const digits = String(value).replace(/[^0-9]/g, '');
  const amount = parseInt(digits, 10);
  if (!Number.isInteger(amount) || amount < 1) {
    fail(`"${value}" is not a valid price in yen`);
  }
  return amount;
}

function slugify(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `item-${uuidv4().slice(0, 8)}`;
}

function describeStock(product) {
  if (product.status === 'sold') return 'SOLD OUT';
  if (product.stock === null || product.stock === undefined) return 'made to order';
  return `${product.stock} in stock`;
}

// ---------- database helpers ----------

async function findProduct(container, idOrSlug) {
  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.type = @type AND (c.id = @v OR c.slug = @v)',
      parameters: [
        { name: '@type', value: 'product' },
        { name: '@v', value: idOrSlug }
      ]
    })
    .fetchAll();
  if (resources.length === 0) {
    fail(`No product found matching "${idOrSlug}". Run "node manage-store.js list" to see everything.`);
  }
  return resources[0];
}

async function slugExists(container, slug) {
  const { resources } = await container.items
    .query({
      query: 'SELECT c.id FROM c WHERE c.type = @type AND c.slug = @slug',
      parameters: [
        { name: '@type', value: 'product' },
        { name: '@slug', value: slug }
      ]
    })
    .fetchAll();
  return resources.length > 0;
}

async function replaceProduct(container, product) {
  product.updatedAt = new Date().toISOString();
  const { resource } = await container.item(product.id, 'product').replace(product);
  return resource;
}

async function uploadProductImage(filePath) {
  const resolved = filePath.replace(/^~(?=$|\/)/, process.env.HOME || '~');
  if (!fs.existsSync(resolved)) {
    fail(`Photo not found: ${filePath}`);
  }
  const ext = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    fail(`Unsupported photo type "${ext}". Use jpg, png, gif or webp.`);
  }

  const blobContainer = getBlobContainer();
  const id = uuidv4();
  const blobName = `images/${id}${ext}`;
  const blobClient = blobContainer.getBlockBlobClient(blobName);

  console.log(`📤 Uploading photo ${path.basename(resolved)}...`);
  await blobClient.uploadFile(resolved, {
    blobHTTPHeaders: {
      blobContentType: contentType,
      blobCacheControl: 'public, max-age=31536000'
    }
  });

  // Generate a real thumbnail (same size/format the API uses for the
  // gallery) so the shop grid doesn't load full-resolution photos
  let thumbnailBlobName = blobName;
  try {
    const sharp = require('sharp');
    const thumbnailBuffer = await sharp(resolved)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    thumbnailBlobName = `thumbnails/${id}.jpg`;
    await blobContainer.getBlockBlobClient(thumbnailBlobName).uploadData(thumbnailBuffer, {
      blobHTTPHeaders: {
        blobContentType: 'image/jpeg',
        blobCacheControl: 'public, max-age=31536000'
      }
    });
  } catch (error) {
    console.warn(`⚠️  Could not create a thumbnail (${error.message}) — using the full image.`);
  }

  return { blobName, thumbnailBlobName };
}

async function findPortfolioImage(container, imageId) {
  try {
    const { resource } = await container.item(imageId, 'image').read();
    if (resource) return resource;
  } catch (error) {
    if (error.code !== 404) throw error;
  }
  fail(`No portfolio image found with id "${imageId}".`);
}

// ---------- commands ----------

async function cmdList(container) {
  const { resources } = await container.items
    .query({
      query: 'SELECT * FROM c WHERE c.type = @type ORDER BY c["order"] ASC',
      parameters: [{ name: '@type', value: 'product' }]
    })
    .fetchAll();

  if (resources.length === 0) {
    console.log('The shop is empty. Add something with:\n  node manage-store.js add --title "Name" --price 12000 --image ~/photo.jpg');
    return;
  }

  console.log(`\n🛍  ${resources.length} item(s) in the shop:\n`);
  for (const p of resources) {
    const visibility = p.status === 'hidden' ? '  (hidden from the site)' : '';
    console.log(`• ${p.title}${visibility}`);
    console.log(`    price: ${formatYen(p.priceJpy)}   ${describeStock(p)}   type: ${p.productType}`);
    console.log(`    id: ${p.id}`);
    console.log(`    page: /shop/item/${p.slug}\n`);
  }
}

async function cmdShow(container, idOrSlug) {
  const p = await findProduct(container, idOrSlug);
  console.log(JSON.stringify(p, null, 2));
}

async function cmdAdd(container, options) {
  if (!options.title) fail('Please give the item a name: --title "Cherry Blossom Print"');
  if (!options.price) fail('Please give the item a price in yen: --price 12000');
  // Validate the price before uploading photos so a typo doesn't leave
  // orphaned images in blob storage
  const priceJpy = parseYen(options.price);

  const images = [];
  for (const imagePath of options.images) {
    images.push(await uploadProductImage(imagePath));
  }
  for (const imageId of options.imageIds) {
    const image = await findPortfolioImage(container, imageId);
    images.push({
      imageId: image.id,
      blobName: image.blobName,
      thumbnailBlobName: image.thumbnailBlobName || image.blobName
    });
  }
  if (images.length === 0) {
    fail('Every item needs at least one photo: --image ~/photo.jpg (or --image-id <gallery image id>)');
  }

  let slug = slugify(options.title);
  let suffix = 2;
  while (await slugExists(container, slug)) {
    slug = `${slugify(options.title)}-${suffix++}`;
  }

  const now = new Date().toISOString();
  const stock = options.oneOfAKind ? 1 : options.stock !== undefined ? options.stock : null;
  const product = {
    id: uuidv4(),
    type: 'product',
    title: options.title,
    slug,
    description: options.description || '',
    priceJpy,
    productType: options.productType || 'art',
    stock,
    images,
    status: options.hidden ? 'hidden' : stock === 0 ? 'sold' : 'active',
    order: options.order || 0,
    createdAt: now,
    updatedAt: now
  };

  await container.items.create(product);

  console.log(`\n✅ "${product.title}" added to the shop!`);
  console.log(`   price: ${formatYen(product.priceJpy)}`);
  console.log(`   stock: ${describeStock(product)}`);
  console.log(`   page:  /shop/item/${product.slug}`);
  console.log(`   id:    ${product.id}`);
  if (product.status === 'hidden') {
    console.log('   ⚠️  It is hidden — run this to make it visible:');
    console.log(`   node manage-store.js unhide ${product.slug}`);
  }
}

async function cmdUpdate(container, idOrSlug, options) {
  const product = await findProduct(container, idOrSlug);
  const changes = [];

  if (options.title) {
    product.title = options.title;
    changes.push(`name → "${options.title}"`);
  }
  if (options.price) {
    product.priceJpy = parseYen(options.price);
    changes.push(`price → ${formatYen(product.priceJpy)}`);
  }
  if (options.description !== undefined) {
    product.description = options.description;
    changes.push('description updated');
  }
  if (options.productType) {
    product.productType = options.productType;
    changes.push(`type → ${options.productType}`);
  }
  if (options.stock !== undefined) {
    product.stock = options.stock;
    if (options.stock === null) {
      changes.push('stock → made to order (never sells out)');
    } else {
      changes.push(`stock → ${options.stock}`);
    }
    if (product.stock !== null && product.stock > 0 && product.status === 'sold') {
      product.status = 'active';
      changes.push('back on sale');
    }
    // Only flip active items to sold — hidden items stay hidden
    if (product.stock === 0 && product.status === 'active') {
      product.status = 'sold';
      changes.push('marked as sold out');
    }
  }
  for (const imagePath of options.images) {
    product.images.push(await uploadProductImage(imagePath));
    changes.push('photo added');
  }

  if (changes.length === 0) {
    fail('Nothing to change. Example: node manage-store.js update <item> --price 15000');
  }

  await replaceProduct(container, product);
  console.log(`✅ "${product.title}" updated: ${changes.join(', ')}`);
}

async function cmdSetStatus(container, idOrSlug, status) {
  const product = await findProduct(container, idOrSlug);
  product.status = status;
  if (status === 'sold' && product.stock !== null && product.stock !== undefined) {
    product.stock = 0;
  }
  await replaceProduct(container, product);

  const messages = {
    hidden: `"${product.title}" is now hidden from the shop.`,
    active: `"${product.title}" is now visible in the shop.`,
    sold: `"${product.title}" is now marked as sold out.`
  };
  console.log(`✅ ${messages[status]}`);
}

async function cmdOrders(container, options) {
  const { resources } = await container.items
    .query({
      query: `SELECT * FROM c WHERE c.type = @type ORDER BY c.createdAt DESC OFFSET 0 LIMIT @limit`,
      parameters: [
        { name: '@type', value: 'order' },
        { name: '@limit', value: options.limit || 20 }
      ]
    })
    .fetchAll();

  const orders = options.all
    ? resources
    : resources.filter((o) => o.status === 'paid' || o.status === 'pending');

  if (orders.length === 0) {
    console.log(options.all
      ? 'No orders yet.'
      : 'No orders waiting to be shipped. 🎉  (use --all to see every order)');
    return;
  }

  console.log(`\n📦 ${orders.length} order(s):\n`);
  for (const order of orders) {
    const date = new Date(order.createdAt).toLocaleString('ja-JP');
    const statusLabel = {
      paid: '💰 PAID — ready to ship',
      pending: '⏳ waiting for payment (konbini/bank)',
      fulfilled: '✅ shipped',
      failed: '✖ payment failed',
      refunded: '↩ refunded'
    }[order.status] || order.status;

    console.log(`— Order ${order.id}`);
    console.log(`    ${date}   ${statusLabel}   total ${formatYen(order.amountTotalJpy)}`);
    for (const item of order.items || []) {
      console.log(`    ${item.quantity} × ${item.title}`);
    }
    if (order.customerName || order.customerEmail) {
      console.log(`    buyer: ${order.customerName || ''} ${order.customerEmail ? `<${order.customerEmail}>` : ''}`);
    }
    if (order.customerPhone) {
      console.log(`    phone: ${order.customerPhone}`);
    }
    if (order.shippingAddress) {
      const a = order.shippingAddress;
      const parts = [a.postal_code, a.state, a.city, a.line1, a.line2].filter(Boolean);
      console.log(`    ship to: 〒${parts.join(' ')}`);
    }
    console.log('');
  }
  if (!options.all) {
    console.log('After shipping an order, mark it done with:\n  node manage-store.js fulfill <order id>');
  }
}

async function cmdFulfill(container, orderId) {
  let order;
  try {
    const { resource } = await container.item(orderId, 'order').read();
    order = resource;
  } catch (error) {
    if (error.code !== 404) throw error;
  }
  if (!order) fail(`No order found with id "${orderId}".`);

  order.status = 'fulfilled';
  order.updatedAt = new Date().toISOString();
  await container.item(order.id, 'order').replace(order);
  console.log(`✅ Order ${orderId} marked as shipped. Nice work!`);
}

async function cmdShipping(container, options) {
  let settings = null;
  try {
    const { resource } = await container.item('store-settings', 'settings').read();
    settings = resource;
  } catch (error) {
    if (error.code !== 404) throw error;
  }

  const changes = {};
  if (options.flat !== undefined) changes.shippingFlatJpy = parseYen(options.flat);
  if (options.freeOver !== undefined) changes.freeShippingThresholdJpy = parseYen(options.freeOver);
  if (options.noFree) changes.freeShippingThresholdJpy = null;

  if (Object.keys(changes).length > 0) {
    settings = {
      id: 'store-settings',
      type: 'settings',
      createdAt: new Date().toISOString(),
      ...settings,
      ...changes,
      updatedAt: new Date().toISOString()
    };
    await container.items.upsert(settings);
    console.log('✅ Shipping settings saved.');
  }

  // Same default resolution as api/shared/config.js defaultShippingJpy,
  // so the CLI reports what checkout actually charges
  const flat = settings?.shippingFlatJpy ?? (parseInt(process.env.STORE_SHIPPING_FLAT_JPY, 10) || 1000);
  const threshold = settings?.freeShippingThresholdJpy ?? null;
  console.log(`\n🚚 Shipping (within Japan only):`);
  console.log(`   flat rate: ${formatYen(flat)} per order${settings?.shippingFlatJpy === undefined ? ' (default)' : ''}`);
  console.log(threshold
    ? `   free shipping for orders over ${formatYen(threshold)}`
    : '   no free-shipping threshold');
}

// ---------- argument parsing ----------

function parseOptions(args) {
  const options = { images: [], imageIds: [] };
  const positional = [];

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--title': options.title = args[++i]; break;
      case '--price': options.price = args[++i]; break;
      case '--description': options.description = args[++i]; break;
      case '--image': options.images.push(args[++i]); break;
      case '--image-id': options.imageIds.push(args[++i]); break;
      case '--type': options.productType = args[++i]; break;
      case '--stock': {
        const value = args[++i];
        options.stock = value === 'unlimited' ? null : parseInt(value, 10);
        if (options.stock !== null && (!Number.isInteger(options.stock) || options.stock < 0)) {
          fail(`--stock must be a number or "unlimited", got "${value}"`);
        }
        break;
      }
      case '--one-of-a-kind': options.oneOfAKind = true; break;
      case '--hidden': options.hidden = true; break;
      case '--order': options.order = parseInt(args[++i], 10) || 0; break;
      case '--limit': options.limit = parseInt(args[++i], 10) || 20; break;
      case '--all': options.all = true; break;
      case '--flat': options.flat = args[++i]; break;
      case '--free-over': options.freeOver = args[++i]; break;
      case '--no-free': options.noFree = true; break;
      default: positional.push(args[i]);
    }
  }

  return { options, positional };
}

const HELP = `
🎨 Kihoko Store Manager — run the online shop from the command line

Everyday commands:
  node manage-store.js list                         See everything in the shop
  node manage-store.js orders                       See orders that need shipping
  node manage-store.js fulfill <order id>           Mark an order as shipped

Adding items:
  node manage-store.js add --title "Cherry Blossom Print" --price 8000 \\
      --image ~/Desktop/photo.jpg --stock 10 --type print

  Options for add:
    --title "Name"          Item name (required)
    --price 8000            Price in yen (required)
    --image ~/photo.jpg     Photo file (repeat for more photos)
    --image-id <id>         Use an existing gallery image instead
    --description "..."     Longer description shown on the item page
    --stock 10              How many exist ("unlimited" = made to order)
    --one-of-a-kind         Exactly one exists (originals)
    --type print            original / print / merch / art
    --hidden                Add without showing it in the shop yet

Changing items:
  node manage-store.js update <item> --price 15000 --stock 3
  node manage-store.js sold <item>                  Mark sold out
  node manage-store.js hide <item>                  Hide from the shop
  node manage-store.js unhide <item>                Show in the shop again
  node manage-store.js show <item>                  Full details

Shipping fee:
  node manage-store.js shipping                     Show current settings
  node manage-store.js shipping --flat 1000         Set flat rate per order
  node manage-store.js shipping --free-over 10000   Free shipping over ¥10,000

<item> can be the item's id or its page name (slug), e.g. "cherry-blossom-print".
Refunds and payment questions are handled in the Stripe Dashboard: https://dashboard.stripe.com
`;

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { options, positional } = parseOptions(rest);

  if (!command || command === 'help' || command === '--help') {
    console.log(HELP);
    return;
  }

  const KNOWN_COMMANDS = ['list', 'show', 'add', 'update', 'hide', 'unhide', 'sold', 'orders', 'fulfill', 'shipping'];
  if (!KNOWN_COMMANDS.includes(command)) {
    fail(`Unknown command "${command}". Run "node manage-store.js help" to see what I can do.`);
  }

  const container = getContainer();

  switch (command) {
    case 'list': return cmdList(container);
    case 'show': return cmdShow(container, requireItem(positional));
    case 'add': return cmdAdd(container, options);
    case 'update': return cmdUpdate(container, requireItem(positional), options);
    case 'hide': return cmdSetStatus(container, requireItem(positional), 'hidden');
    case 'unhide': return cmdSetStatus(container, requireItem(positional), 'active');
    case 'sold': return cmdSetStatus(container, requireItem(positional), 'sold');
    case 'orders': return cmdOrders(container, options);
    case 'fulfill': return cmdFulfill(container, requireItem(positional));
    case 'shipping': return cmdShipping(container, options);
    default:
      fail(`Unknown command "${command}". Run "node manage-store.js help" to see what I can do.`);
  }
}

function requireItem(positional) {
  if (positional.length === 0) {
    fail('Please tell me which item/order, e.g. node manage-store.js show cherry-blossom-print');
  }
  return positional[0];
}

main().catch((error) => {
  fail(error.message || String(error));
});
