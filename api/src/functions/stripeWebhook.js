const { app } = require('@azure/functions');
const config = require('../../shared/config');
const databaseService = require('../../shared/database');
const stripeService = require('../../shared/stripeService');
const { applyStripeEvent } = require('../../shared/webhookHandler');
const { jsonResponse } = require('../../shared/http');

/**
 * POST /api/stripe-webhook
 * Configure this URL in the Stripe Dashboard (Developers → Webhooks) with events:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *   checkout.session.async_payment_failed
 * Signature verification requires the raw request body.
 */
app.http('stripeWebhook', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'stripe-webhook',
  handler: async (request, context) => {
    context.log('StripeWebhook function triggered');

    if (!config.stripe.webhookSecret) {
      context.error('STRIPE_WEBHOOK_SECRET is not configured');
      return { status: 503, body: 'Webhook not configured' };
    }

    let event;
    try {
      const rawBody = await request.text();
      const signature = request.headers.get('stripe-signature');
      const stripe = stripeService.getStripe();
      event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
    } catch (error) {
      context.error('Webhook signature verification failed:', error.message);
      return { status: 400, body: 'Invalid signature' };
    }

    try {
      const result = await applyStripeEvent(event, databaseService, (msg) => context.log(msg));
      context.log(`Webhook ${event.type}: ${result}`);
      return jsonResponse(200, { received: true });
    } catch (error) {
      context.error('Error applying webhook event:', error);
      // Non-2xx makes Stripe retry, which is what we want for transient failures
      return { status: 500, body: 'Webhook processing failed' };
    }
  }
});
