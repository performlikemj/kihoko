/**
 * Store logic tests — run with: npm test (node --test)
 * These cover the Stripe payload builders and webhook handling without
 * needing Stripe keys or a database.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');

const stripeService = require('../shared/stripeService');
const { applyStripeEvent } = require('../shared/webhookHandler');

const PRODUCTS = {
  print: {
    id: 'prod-print',
    type: 'product',
    title: 'Cherry Blossom Print',
    slug: 'cherry-blossom-print',
    description: 'A4 giclee print',
    priceJpy: 8000,
    productType: 'print',
    stock: 5,
    images: [{ blobName: 'images/a.jpg', thumbnailBlobName: 'images/a.jpg' }],
    status: 'active'
  },
  original: {
    id: 'prod-original',
    type: 'product',
    title: 'Koi Original',
    slug: 'koi-original',
    description: '',
    priceJpy: 120000,
    productType: 'original',
    stock: 1,
    images: [],
    status: 'active'
  },
  madeToOrder: {
    id: 'prod-tote',
    type: 'product',
    title: 'Tote Bag',
    slug: 'tote-bag',
    description: '',
    priceJpy: 2500,
    productType: 'merch',
    stock: null,
    images: [],
    status: 'active'
  }
};

describe('validateCartItems', () => {
  test('rejects empty carts', () => {
    assert.throws(() => stripeService.validateCartItems([]), /empty/);
    assert.throws(() => stripeService.validateCartItems(undefined), /empty/);
  });

  test('rejects bad quantities', () => {
    assert.throws(() => stripeService.validateCartItems([{ productId: 'x', quantity: 0 }]));
    assert.throws(() => stripeService.validateCartItems([{ productId: 'x', quantity: 1.5 }]));
    assert.throws(() => stripeService.validateCartItems([{ productId: 'x', quantity: 999 }]));
  });

  test('normalizes valid items', () => {
    const items = stripeService.validateCartItems([{ productId: ' prod-print ', quantity: '2' }]);
    assert.deepStrictEqual(items, [{ productId: 'prod-print', quantity: 2 }]);
  });
});

describe('checkAvailability', () => {
  test('rejects sold-out and missing products', () => {
    const sold = { ...PRODUCTS.original, status: 'sold', stock: 0 };
    assert.throws(
      () => stripeService.checkAvailability([sold], [{ productId: sold.id, quantity: 1 }]),
      /sold out/
    );
    assert.throws(
      () => stripeService.checkAvailability([], [{ productId: 'nope', quantity: 1 }]),
      /no longer available/
    );
  });

  test('rejects when stock is insufficient', () => {
    assert.throws(
      () => stripeService.checkAvailability([PRODUCTS.print], [{ productId: 'prod-print', quantity: 6 }]),
      /Only 5/
    );
  });

  test('allows made-to-order items in any quantity', () => {
    const result = stripeService.checkAvailability(
      [PRODUCTS.madeToOrder],
      [{ productId: 'prod-tote', quantity: 10 }]
    );
    assert.ok(result['prod-tote']);
  });
});

describe('buildSessionParams (Stripe correctness)', () => {
  const cartItems = [
    { productId: 'prod-print', quantity: 2 },
    { productId: 'prod-tote', quantity: 1 }
  ];
  const productsById = {
    'prod-print': PRODUCTS.print,
    'prod-tote': PRODUCTS.madeToOrder
  };

  test('JPY is zero-decimal: unit_amount is whole yen, never x100', () => {
    const params = stripeService.buildSessionParams({
      productsById,
      cartItems,
      settings: null,
      origin: 'https://kihoko.com'
    });
    assert.strictEqual(params.line_items[0].price_data.unit_amount, 8000);
    assert.strictEqual(params.line_items[0].price_data.currency, 'jpy');
    assert.strictEqual(params.line_items[1].price_data.unit_amount, 2500);
    assert.strictEqual(params.line_items[0].quantity, 2);
  });

  test('ships only to Japan and collects phone for the carrier', () => {
    const params = stripeService.buildSessionParams({
      productsById,
      cartItems,
      settings: null,
      origin: 'https://kihoko.com'
    });
    assert.deepStrictEqual(params.shipping_address_collection.allowed_countries, ['JP']);
    assert.strictEqual(params.phone_number_collection.enabled, true);
    assert.strictEqual(params.mode, 'payment');
  });

  test('redirect URLs point back at the shop', () => {
    const params = stripeService.buildSessionParams({
      productsById,
      cartItems,
      settings: null,
      origin: 'https://kihoko.com'
    });
    assert.strictEqual(
      params.success_url,
      'https://kihoko.com/shop/success?session_id={CHECKOUT_SESSION_ID}'
    );
    assert.strictEqual(params.cancel_url, 'https://kihoko.com/shop/cart');
  });

  test('metadata roundtrips the cart', () => {
    const params = stripeService.buildSessionParams({
      productsById,
      cartItems,
      settings: null,
      origin: 'https://kihoko.com'
    });
    const decoded = stripeService.decodeItemsMetadata(params.metadata.items);
    assert.deepStrictEqual(decoded, cartItems);
    assert.ok(params.metadata.items.length <= 500);
  });

  test('shipping: default flat rate, custom rate, and free threshold', () => {
    const def = stripeService.buildShippingOptions(null, 5000);
    assert.strictEqual(def[0].shipping_rate_data.fixed_amount.amount, 1000);
    assert.strictEqual(def[0].shipping_rate_data.fixed_amount.currency, 'jpy');

    const custom = stripeService.buildShippingOptions({ shippingFlatJpy: 1500 }, 5000);
    assert.strictEqual(custom[0].shipping_rate_data.fixed_amount.amount, 1500);

    const settings = { shippingFlatJpy: 1000, freeShippingThresholdJpy: 10000 };
    const below = stripeService.buildShippingOptions(settings, 9999);
    assert.strictEqual(below[0].shipping_rate_data.fixed_amount.amount, 1000);
    const above = stripeService.buildShippingOptions(settings, 10000);
    assert.strictEqual(above[0].shipping_rate_data.fixed_amount.amount, 0);
  });
});

describe('orderFromSession', () => {
  const baseSession = {
    id: 'cs_test_123',
    payment_intent: 'pi_123',
    payment_status: 'paid',
    amount_total: 18500,
    currency: 'jpy',
    customer_details: { email: 'buyer@example.jp', name: 'Buyer', phone: '+81901234567' },
    metadata: { items: 'prod-print:2,prod-tote:1' }
  };

  test('maps paid sessions and old-style shipping_details', () => {
    const session = {
      ...baseSession,
      shipping_details: {
        name: '山田太郎',
        address: { postal_code: '150-0001', state: '東京都', city: '渋谷区', line1: '1-2-3', country: 'JP' }
      }
    };
    const cartItems = stripeService.decodeItemsMetadata(session.metadata.items);
    const order = stripeService.orderFromSession(session, cartItems, {
      'prod-print': PRODUCTS.print,
      'prod-tote': PRODUCTS.madeToOrder
    });

    assert.strictEqual(order.id, 'cs_test_123');
    assert.strictEqual(order.status, 'paid');
    assert.strictEqual(order.amountTotalJpy, 18500);
    assert.strictEqual(order.customerName, '山田太郎');
    assert.strictEqual(order.shippingAddress.postal_code, '150-0001');
    assert.deepStrictEqual(order.items[0], {
      productId: 'prod-print',
      title: 'Cherry Blossom Print',
      quantity: 2,
      unitAmountJpy: 8000
    });
  });

  test('maps unpaid (konbini) sessions to pending and new-style collected_information', () => {
    const session = {
      ...baseSession,
      payment_status: 'unpaid',
      collected_information: {
        shipping_details: { name: 'Buyer', address: { postal_code: '060-0001', country: 'JP' } }
      }
    };
    const order = stripeService.orderFromSession(session, [], {});
    assert.strictEqual(order.status, 'pending');
    assert.strictEqual(order.shippingAddress.postal_code, '060-0001');
  });
});

describe('applyStripeEvent (webhook)', () => {
  function mockDb() {
    const products = {
      'prod-print': { ...PRODUCTS.print },
      'prod-original': { ...PRODUCTS.original }
    };
    const orders = {};
    const db = {
      products,
      orders,
      async getProductsByIds(ids) {
        return ids.map((id) => products[id]).filter(Boolean);
      },
      async createOrder(order) {
        if (orders[order.id]) {
          const error = new Error('conflict');
          error.code = 409;
          throw error;
        }
        orders[order.id] = { ...order };
        return orders[order.id];
      },
      async getOrderById(id) {
        return orders[id] || null;
      },
      async updateOrder(id, updates) {
        orders[id] = { ...orders[id], ...updates };
        return orders[id];
      },
      async adjustProductStock(id, delta) {
        const product = products[id];
        if (!product || product.stock === null) return product;
        product.stock = Math.max(0, product.stock + delta);
        product.status = product.stock === 0 ? 'sold' : 'active';
        return product;
      }
    };
    return db;
  }

  function completedEvent(overrides = {}) {
    return {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_abc',
          payment_intent: 'pi_abc',
          payment_status: 'paid',
          amount_total: 129000,
          currency: 'jpy',
          customer_details: { email: 'buyer@example.jp' },
          metadata: { items: 'prod-print:1,prod-original:1' },
          shipping_details: { name: 'Buyer', address: { postal_code: '150-0001', country: 'JP' } },
          ...overrides
        }
      }
    };
  }

  test('records the order and decrements stock, selling out one-of-a-kind items', async () => {
    const db = mockDb();
    const result = await applyStripeEvent(completedEvent(), db);
    assert.strictEqual(result, 'recorded');
    assert.strictEqual(db.orders['cs_test_abc'].status, 'paid');
    assert.strictEqual(db.products['prod-print'].stock, 4);
    assert.strictEqual(db.products['prod-original'].stock, 0);
    assert.strictEqual(db.products['prod-original'].status, 'sold');
  });

  test('is idempotent across webhook retries', async () => {
    const db = mockDb();
    await applyStripeEvent(completedEvent(), db);
    const result = await applyStripeEvent(completedEvent(), db);
    assert.strictEqual(result, 'duplicate');
    // stock only decremented once
    assert.strictEqual(db.products['prod-print'].stock, 4);
  });

  test('konbini flow: pending order becomes paid on async_payment_succeeded', async () => {
    const db = mockDb();
    await applyStripeEvent(completedEvent({ payment_status: 'unpaid' }), db);
    assert.strictEqual(db.orders['cs_test_abc'].status, 'pending');
    // stock reserved while waiting for payment
    assert.strictEqual(db.products['prod-original'].stock, 0);

    const result = await applyStripeEvent(
      { type: 'checkout.session.async_payment_succeeded', data: completedEvent().data },
      db
    );
    assert.strictEqual(result, 'marked-paid');
    assert.strictEqual(db.orders['cs_test_abc'].status, 'paid');
  });

  test('konbini flow: failed payment restores stock', async () => {
    const db = mockDb();
    await applyStripeEvent(completedEvent({ payment_status: 'unpaid' }), db);

    const result = await applyStripeEvent(
      { type: 'checkout.session.async_payment_failed', data: completedEvent().data },
      db
    );
    assert.strictEqual(result, 'marked-failed');
    assert.strictEqual(db.orders['cs_test_abc'].status, 'failed');
    assert.strictEqual(db.orders['cs_test_abc'].stockApplied, false);
    assert.strictEqual(db.products['prod-print'].stock, 5);
    assert.strictEqual(db.products['prod-original'].stock, 1);
    assert.strictEqual(db.products['prod-original'].status, 'active');
  });

  test('redelivery finishes stock application if the first delivery crashed mid-way', async () => {
    const db = mockDb();
    // Simulate a crash after createOrder but before stock was applied
    await db.createOrder({
      id: 'cs_test_abc',
      type: 'order',
      status: 'paid',
      stockApplied: false,
      items: [
        { productId: 'prod-print', quantity: 1 },
        { productId: 'prod-original', quantity: 1 }
      ]
    });

    const result = await applyStripeEvent(completedEvent(), db);
    assert.strictEqual(result, 'stock-recovered');
    assert.strictEqual(db.orders['cs_test_abc'].stockApplied, true);
    assert.strictEqual(db.products['prod-print'].stock, 4);
    assert.strictEqual(db.products['prod-original'].stock, 0);
  });

  test('failed payment never restores stock that was not applied (no phantom stock)', async () => {
    const db = mockDb();
    await db.createOrder({
      id: 'cs_test_abc',
      type: 'order',
      status: 'pending',
      stockApplied: false,
      items: [{ productId: 'prod-original', quantity: 1 }]
    });

    const result = await applyStripeEvent(
      { type: 'checkout.session.async_payment_failed', data: completedEvent().data },
      db
    );
    assert.strictEqual(result, 'marked-failed');
    assert.strictEqual(db.orders['cs_test_abc'].status, 'failed');
    // stock must NOT have been incremented above its real level
    assert.strictEqual(db.products['prod-original'].stock, 1);
  });

  test('records order via async_payment_succeeded if completed event was missed', async () => {
    const db = mockDb();
    const result = await applyStripeEvent(
      { type: 'checkout.session.async_payment_succeeded', data: completedEvent().data },
      db
    );
    assert.strictEqual(result, 'recorded');
    assert.ok(db.orders['cs_test_abc']);
  });

  test('ignores unrelated events', async () => {
    const db = mockDb();
    const result = await applyStripeEvent({ type: 'invoice.paid', data: { object: {} } }, db);
    assert.strictEqual(result, 'ignored');
  });
});

describe('function modules load', () => {
  test('all API function files register without throwing', () => {
    // Stub the Functions SDK so requiring the modules doesn't start the
    // worker plumbing (which keeps the test process alive for minutes)
    const fakeApp = { http: () => {}, get: () => {}, post: () => {} };
    require.cache[require.resolve('@azure/functions')] = {
      id: '@azure/functions',
      filename: require.resolve('@azure/functions'),
      loaded: true,
      exports: { app: fakeApp }
    };

    for (const name of ['getProducts', 'createCheckout', 'getCheckoutSession', 'stripeWebhook', 'getImages', 'getImage', 'getCategories', 'health']) {
      assert.doesNotThrow(() => require(`../src/functions/${name}`));
    }
  });
});
