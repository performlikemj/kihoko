/**
 * Stripe service for the online store.
 *
 * The Checkout-session payload builders are pure functions so they can be
 * unit-tested without Stripe credentials. Only getStripe() touches the SDK.
 *
 * Note: JPY is a zero-decimal currency in Stripe — amounts are whole yen,
 * never multiplied by 100.
 */

const config = require('./config');

let stripeClient = null;

function getStripe() {
  if (!config.stripe.secretKey) {
    const error = new Error('Stripe is not configured (missing STRIPE_SECRET_KEY)');
    error.code = 'STRIPE_NOT_CONFIGURED';
    throw error;
  }
  if (!stripeClient) {
    // Lazy require so the API can run without the dependency until store is used
    const Stripe = require('stripe');
    stripeClient = new Stripe(config.stripe.secretKey);
  }
  return stripeClient;
}

/**
 * Validate and normalize cart items from the client.
 * Returns [{ productId, quantity }] or throws with a client-safe message.
 */
function validateCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw clientError('Your cart is empty');
  }
  if (items.length > config.store.maxCartLines) {
    throw clientError(`Cart cannot contain more than ${config.store.maxCartLines} different items`);
  }

  return items.map((item) => {
    const productId = typeof item.productId === 'string' ? item.productId.trim() : '';
    const quantity = Number(item.quantity);
    if (!productId) {
      throw clientError('Cart contains an invalid item');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > config.store.maxQuantityPerItem) {
      throw clientError(`Quantity must be between 1 and ${config.store.maxQuantityPerItem}`);
    }
    return { productId, quantity };
  });
}

/**
 * Check that every cart line maps to a purchasable product with enough stock.
 * Returns products keyed by id or throws with a client-safe message.
 */
function checkAvailability(products, cartItems) {
  const productsById = {};
  for (const product of products) {
    productsById[product.id] = product;
  }

  for (const item of cartItems) {
    const product = productsById[item.productId];
    if (!product || product.status === 'hidden') {
      throw clientError('An item in your cart is no longer available');
    }
    if (product.status === 'sold') {
      throw clientError(`"${product.title}" is sold out`);
    }
    if (!Number.isInteger(product.priceJpy) || product.priceJpy < 1) {
      throw clientError(`"${product.title}" cannot be purchased right now`);
    }
    if (product.stock !== null && product.stock !== undefined && product.stock < item.quantity) {
      throw clientError(`Only ${product.stock} of "${product.title}" left in stock`);
    }
  }

  return productsById;
}

/**
 * Build Stripe line_items from validated cart items (zero-decimal JPY).
 */
function buildLineItems(productsById, cartItems, imageUrlResolver = null) {
  return cartItems.map((item) => {
    const product = productsById[item.productId];
    const productData = {
      name: product.title,
      metadata: { productId: product.id }
    };
    if (product.description) {
      productData.description = product.description.slice(0, 300);
    }
    const firstImage = (product.images || [])[0];
    if (firstImage && imageUrlResolver) {
      const url = imageUrlResolver(firstImage.blobName);
      if (url) productData.images = [url];
    }

    return {
      quantity: item.quantity,
      price_data: {
        currency: config.store.currency,
        unit_amount: product.priceJpy,
        product_data: productData
      }
    };
  });
}

function calculateSubtotalJpy(productsById, cartItems) {
  return cartItems.reduce(
    (sum, item) => sum + productsById[item.productId].priceJpy * item.quantity,
    0
  );
}

/**
 * Flat-rate shipping within Japan, with optional free-shipping threshold.
 * Settings come from the store-settings document (may be null).
 */
function buildShippingOptions(settings, subtotalJpy) {
  const flat = settings && Number.isInteger(settings.shippingFlatJpy)
    ? settings.shippingFlatJpy
    : config.store.defaultShippingJpy;
  const threshold = settings ? settings.freeShippingThresholdJpy : null;

  const free = Number.isInteger(threshold) && subtotalJpy >= threshold;
  const amount = free ? 0 : flat;

  return [
    {
      shipping_rate_data: {
        type: 'fixed_amount',
        fixed_amount: { amount, currency: config.store.currency },
        display_name: free ? 'Free shipping (送料無料)' : 'Shipping within Japan (国内配送)'
      }
    }
  ];
}

/**
 * Encode cart items into session metadata: "productId:qty,productId:qty".
 * Stripe metadata values are capped at 500 chars; maxCartLines keeps us under.
 */
function encodeItemsMetadata(cartItems) {
  return cartItems.map((item) => `${item.productId}:${item.quantity}`).join(',');
}

function decodeItemsMetadata(value) {
  if (!value) return [];
  return value
    .split(',')
    .filter(Boolean)
    .map((pair) => {
      const [productId, quantity] = pair.split(':');
      return { productId, quantity: parseInt(quantity, 10) || 1 };
    });
}

/**
 * Build the full Checkout session params: JPY, ships only to Japan,
 * phone collected for the carrier, payment methods controlled from the
 * Stripe Dashboard (so konbini etc. can be enabled without code changes).
 */
function buildSessionParams({ productsById, cartItems, settings, origin, imageUrlResolver = null }) {
  const subtotal = calculateSubtotalJpy(productsById, cartItems);

  return {
    mode: 'payment',
    line_items: buildLineItems(productsById, cartItems, imageUrlResolver),
    shipping_address_collection: {
      allowed_countries: config.store.allowedShippingCountries
    },
    shipping_options: buildShippingOptions(settings, subtotal),
    phone_number_collection: { enabled: true },
    locale: 'auto',
    success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/cart`,
    metadata: {
      source: 'kihoko-store',
      items: encodeItemsMetadata(cartItems)
    }
  };
}

/**
 * Extract shipping details across Stripe API versions
 * (newest: session.collected_information, mid: session.shipping_details,
 * pre-2022 accounts: session.shipping).
 */
function extractShipping(session) {
  const details =
    (session.collected_information && session.collected_information.shipping_details) ||
    session.shipping_details ||
    session.shipping ||
    null;
  if (!details) return { name: null, address: null };
  return { name: details.name || null, address: details.address || null };
}

/**
 * Build an Order document (plain object) from a Checkout session.
 * productsById is used for titles/prices; falls back gracefully if missing.
 */
function orderFromSession(session, cartItems, productsById = {}) {
  const shipping = extractShipping(session);
  const customer = session.customer_details || {};

  return {
    id: session.id,
    type: 'order',
    stripeSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent && session.payment_intent.id) || null,
    status: session.payment_status === 'paid' ? 'paid' : 'pending',
    items: cartItems.map((item) => {
      const product = productsById[item.productId];
      return {
        productId: item.productId,
        title: product ? product.title : 'Unknown item',
        quantity: item.quantity,
        unitAmountJpy: product ? product.priceJpy : null
      };
    }),
    amountTotalJpy: session.amount_total || 0,
    currency: session.currency || config.store.currency,
    customerEmail: customer.email || null,
    customerName: shipping.name || customer.name || null,
    customerPhone: customer.phone || null,
    shippingAddress: shipping.address,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function clientError(message) {
  const error = new Error(message);
  error.isClientError = true;
  return error;
}

module.exports = {
  getStripe,
  validateCartItems,
  checkAvailability,
  buildLineItems,
  buildShippingOptions,
  buildSessionParams,
  calculateSubtotalJpy,
  encodeItemsMetadata,
  decodeItemsMetadata,
  orderFromSession,
  extractShipping
};
