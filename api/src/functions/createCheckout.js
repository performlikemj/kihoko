const { app } = require('@azure/functions');
const config = require('../../shared/config');
const databaseService = require('../../shared/database');
const blobStorageService = require('../../shared/blobStorage');
const stripeService = require('../../shared/stripeService');
const { jsonResponse } = require('../../shared/http');

/**
 * POST /api/checkout
 * Body: { items: [{ productId, quantity }] }
 * Prices and availability are always resolved server-side from the database —
 * the client never sends amounts. Returns the Stripe-hosted Checkout URL.
 */
app.http('createCheckout', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'checkout',
  handler: async (request, context) => {
    context.log('CreateCheckout function triggered');

    try {
      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse(400, { success: false, error: 'Invalid request body' });
      }

      const cartItems = stripeService.validateCartItems(body.items);

      const [products, settings] = await Promise.all([
        databaseService.getProductsByIds(cartItems.map((item) => item.productId)),
        databaseService.getStoreSettings()
      ]);
      const productsById = stripeService.checkAvailability(products, cartItems);

      // Configured public URL wins so redirect URLs never depend on
      // client-supplied headers in production
      const origin =
        config.store.publicBaseUrl ||
        request.headers.get('origin') ||
        new URL(request.url).origin;

      const params = stripeService.buildSessionParams({
        productsById,
        cartItems,
        settings,
        origin,
        imageUrlResolver: (blobName) => blobStorageService.getImageUrl(blobName)
      });

      const stripe = stripeService.getStripe();
      const session = await stripe.checkout.sessions.create(params);

      return jsonResponse(200, {
        success: true,
        data: { url: session.url, sessionId: session.id }
      });

    } catch (error) {
      if (error.isClientError) {
        return jsonResponse(409, { success: false, error: error.message });
      }
      if (error.code === 'STRIPE_NOT_CONFIGURED') {
        context.error('Stripe is not configured');
        return jsonResponse(503, {
          success: false,
          error: 'The store is not accepting payments right now. Please try again later.'
        });
      }

      context.error('Error in CreateCheckout:', error);
      return jsonResponse(500, {
        success: false,
        error: 'Could not start checkout. Please try again later.'
      });
    }
  }
});
