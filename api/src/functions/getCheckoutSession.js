const { app } = require('@azure/functions');
const stripeService = require('../../shared/stripeService');
const { jsonResponse } = require('../../shared/http');

/**
 * GET /api/checkout/session?session_id=cs_...
 * Lets the success page confirm what happened after the Stripe redirect.
 * Only returns a safe summary, never full payment details.
 */
app.http('getCheckoutSession', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'checkout/session',
  handler: async (request, context) => {
    context.log('GetCheckoutSession function triggered');

    try {
      const url = new URL(request.url);
      const sessionId = url.searchParams.get('session_id');

      if (!sessionId || !sessionId.startsWith('cs_')) {
        return jsonResponse(400, { success: false, error: 'A valid session_id is required' });
      }

      const stripe = stripeService.getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return jsonResponse(200, {
        success: true,
        data: {
          status: session.status,
          paymentStatus: session.payment_status,
          customerEmail: (session.customer_details && session.customer_details.email) || null,
          amountTotalJpy: session.amount_total,
          currency: session.currency
        }
      });

    } catch (error) {
      if (error.code === 'STRIPE_NOT_CONFIGURED') {
        return jsonResponse(503, { success: false, error: 'Store is not configured' });
      }
      if (error.type === 'StripeInvalidRequestError') {
        return jsonResponse(404, { success: false, error: 'Checkout session not found' });
      }

      context.error('Error in GetCheckoutSession:', error);
      return jsonResponse(500, { success: false, error: 'Could not load checkout session' });
    }
  }
});
