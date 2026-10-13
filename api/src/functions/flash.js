const { app } = require('@azure/functions');
const config = require('../../shared/config');
const db = require('../../shared/database');
const urls = require('../../shared/blobStorage');
const { getStripe } = require('../../shared/stripeService');
const flash = require('../../shared/flash');
const { jsonResponse } = require('../../shared/http');

function endpoint(name, methods, route, work) {
  app.http(name, { methods, route, authLevel: 'anonymous', handler: async (request, context) => {
    try { return jsonResponse(200, { success: true, data: await work(request, context) }, { 'Cache-Control': 'no-store' }); }
    catch (error) {
      if (error.isClientError) return jsonResponse(error.status || 400, { success: false, error: error.message });
      context.error(`Flash ${name} failed`, error);
      return jsonResponse(error.code === 'STRIPE_NOT_CONFIGURED' ? 503 : 500, { success: false, error: 'We could not complete that request. Please try again in a moment.' });
    }
  } });
}
async function readBody(request) {
  try { return await request.json(); }
  catch { throw Object.assign(new Error('Please send a valid booking form.'), { isClientError: true, status: 400 }); }
}
endpoint('flashList', ['GET'], 'flash', async (request, context) => flash.listFlash({ db, urls, stripeFactory: getStripe, log: message => context.warn(message) }));
endpoint('flashCreateClaim', ['POST'], 'flash/{id}/claim', async request => {
  const body = await readBody(request);
  flash.validateBooking(body);
  const origin = config.store.publicBaseUrl || request.headers.get('origin') || new URL(request.url).origin;
  return flash.createClaim({ db, stripe: getStripe(), flashId: request.params.id, body, origin, currency: config.store.currency });
});
endpoint('flashCancelClaim', ['POST'], 'flash/claim/cancel', async request => {
  const body = await readBody(request);
  flash.validateSessionId(body?.sessionId);
  await flash.cancelClaim({ db, stripe: getStripe(), sessionId: body.sessionId });
  return { cancelled: true };
});
endpoint('flashClaimSummary', ['GET'], 'flash/claim', async request => flash.claimSummary(db, new URL(request.url).searchParams.get('session_id'), urls));
