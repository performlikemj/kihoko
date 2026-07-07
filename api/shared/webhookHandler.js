/**
 * Applies Stripe webhook events to the store database.
 * Separated from the Azure Function so it can be tested with a mock db.
 *
 * Payment flows handled:
 * - Cards: checkout.session.completed arrives with payment_status 'paid'.
 * - Konbini/bank transfer (async): completed arrives 'unpaid' (order recorded
 *   as pending and stock reserved), then async_payment_succeeded or
 *   async_payment_failed resolves it.
 *
 * Stock consistency: the order document carries a `stockApplied` flag so a
 * webhook redelivery can finish an interrupted stock application instead of
 * short-circuiting on "order already exists". The flag transitions are
 * ordered so that every crash/redelivery window errs toward showing an item
 * sold-out early (safe) and never toward overselling:
 * - apply:   adjust stock first, THEN set stockApplied=true
 *            (redelivery may re-decrement — clamped at 0, fails safe)
 * - restore: set stockApplied=false FIRST, then adjust stock back
 *            (a crash mid-restore under-restores — fails safe; fix by
 *            restocking via manage-store.js)
 */

const { decodeItemsMetadata, orderFromSession } = require('./stripeService');

/**
 * Handle one Stripe event. `db` is the database service (or a mock).
 * Returns a short string describing what was done (useful for logs/tests).
 */
async function applyStripeEvent(event, db, log = () => {}) {
  const session = event.data && event.data.object;

  switch (event.type) {
    case 'checkout.session.completed':
      return recordOrder(session, db, log);

    case 'checkout.session.async_payment_succeeded': {
      const existing = await db.getOrderById(session.id);
      if (!existing) {
        // completed event was missed — record it now (payment_status is paid)
        return recordOrder(session, db, log);
      }
      if (!existing.stockApplied) {
        // completed event crashed before finishing stock application
        await applyStock(existing.items, db, -1);
        await db.updateOrder(session.id, { stockApplied: true });
      }
      if (existing.status === 'paid') return 'already-paid';
      await db.updateOrder(session.id, { status: 'paid' });
      log(`Order ${session.id} marked paid (async payment succeeded)`);
      return 'marked-paid';
    }

    case 'checkout.session.async_payment_failed': {
      const existing = await db.getOrderById(session.id);
      if (!existing) return 'nothing-to-do';

      // Give reserved stock back — but only if it was actually applied,
      // and clear the flag before adjusting so a redelivery can never
      // restore twice (which would oversell)
      if (existing.stockApplied) {
        await db.updateOrder(session.id, { stockApplied: false, status: 'failed' });
        await applyStock(existing.items, db, +1);
      } else if (existing.status !== 'failed') {
        await db.updateOrder(session.id, { status: 'failed' });
      }
      log(`Order ${session.id} marked failed, stock restored`);
      return 'marked-failed';
    }

    default:
      return 'ignored';
  }
}

async function recordOrder(session, db, log) {
  const cartItems = decodeItemsMetadata(session.metadata && session.metadata.items);

  const products = await db.getProductsByIds(cartItems.map((item) => item.productId));
  const productsById = {};
  for (const product of products) {
    productsById[product.id] = product;
  }

  const order = orderFromSession(session, cartItems, productsById);
  order.stockApplied = false;

  let existing = null;
  try {
    await db.createOrder(order);
  } catch (error) {
    if (error.code !== 409) throw error;
    // Webhook retry — finish stock application if the first delivery
    // crashed between creating the order and setting the flag
    existing = await db.getOrderById(session.id);
    if (!existing || existing.stockApplied) return 'duplicate';
  }

  await applyStock((existing || order).items, db, -1);
  await db.updateOrder(session.id, { stockApplied: true });

  log(`Order ${session.id} recorded (${order.status}), ${cartItems.length} line(s)`);
  return existing ? 'stock-recovered' : 'recorded';
}

/**
 * Adjust stock for all order lines concurrently (distinct products; the
 * db layer is etag-guarded). If any line fails, throw so the webhook
 * returns 5xx and Stripe redelivers.
 */
async function applyStock(items, db, direction) {
  const results = await Promise.allSettled(
    (items || [])
      .filter((item) => item.productId)
      .map((item) => db.adjustProductStock(item.productId, direction * item.quantity))
  );
  const failed = results.find((result) => result.status === 'rejected');
  if (failed) throw failed.reason;
}

module.exports = { applyStripeEvent };
