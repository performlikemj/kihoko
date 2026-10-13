/** Flash shapes, pure validation/transitions, and dependency-injected workflows.
 * No SDK clients or environment access: db/Stripe/clock are supplied by callers.
 */
const { randomUUID } = require('node:crypto');
const CAPS = { name: 80, email: 254, instagram: 60, placement: 200, size: 200, skinTone: 60, dates: 300, notes: 2000 };
function clientError(message, status = 400) { return Object.assign(new Error(message), { status, isClientError: true }); }
function normalizePlace(value) {
  if (value == null) return '';
  if (typeof value !== 'string' || /[\x00-\x1f\x7f-\x9f]/.test(value)) throw clientError('Place must be plain text.');
  const place = value.trim();
  if (place.length > 40) throw clientError('Place must be 40 characters or fewer.');
  return place;
}
// Canonical flash shape for direct uploaders. Identity/time are supplied so
// constructing a document is deterministic and needs no Cosmos/Stripe client.
function flashDocument(data, now) {
  if (!data || typeof data.id !== 'string' || !data.id || typeof data.title !== 'string' || !data.title.trim()) throw clientError('A design id and title are required.');
  if (!Number.isInteger(data.width) || data.width < 1 || !Number.isInteger(data.height) || data.height < 1) throw clientError('Positive image dimensions are required.');
  if (typeof data.blobName !== 'string' || !data.blobName) throw clientError('An image blob path is required.');
  const status = data.status ?? 'available';
  if (!['available', 'held', 'taken', 'hidden'].includes(status)) throw clientError('Invalid flash status.');
  const order = data.order ?? 0;
  if (!Number.isFinite(order)) throw clientError('Design order must be a number.');
  for (const field of ['description', 'thumbnailBlobName', 'sizeNote', 'priceNote']) {
    if (data[field] != null && typeof data[field] !== 'string') throw clientError(`${field} must be text.`);
  }
  const place = normalizePlace(data.place);
  const timestamp = new Date(now).toISOString();
  return { id: data.id, type: 'flash', title: data.title.trim(), description: data.description ?? '',
    blobName: data.blobName, thumbnailBlobName: data.thumbnailBlobName ?? '', width: data.width, height: data.height,
    depositJpy: deposit(data), ...(place ? { place } : {}), ...(data.sizeNote == null ? {} : { sizeNote: data.sizeNote }), ...(data.priceNote == null ? {} : { priceNote: data.priceNote }),
    status, holdSessionId: data.holdSessionId ?? null, heldUntil: data.heldUntil ?? null, claimId: data.claimId ?? null,
    order, createdAt: data.createdAt ?? timestamp, updatedAt: timestamp };
}
function validateBooking(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw clientError('Please fill in the booking form.');
  const booking = {};
  for (const [key, cap] of Object.entries(CAPS)) {
    const raw = body[key] ?? '';
    if (typeof raw !== 'string' || /[\x00-\x1f\x7f-\x9f]/.test(raw)) throw clientError(`Please use plain text for ${key}.`);
    booking[key] = raw.trim();
    if (booking[key].length > cap) throw clientError(`${key} must be ${cap} characters or fewer.`);
  }
  for (const key of ['name', 'email', 'placement']) if (!booking[key]) throw clientError(`Please enter your ${key}.`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) throw clientError('Please enter a valid email address.');
  if (body.agree !== true) throw clientError('Please agree to the non-refundable deposit.');
  return booking;
}
function effectiveStatus(doc, now = Date.now()) {
  return doc.status === 'held' && Date.parse(doc.heldUntil) <= now ? 'available' : doc.status;
}
function deposit(doc) {
  const amount = doc.depositJpy ?? 2000;
  if (!Number.isInteger(amount) || amount < 1) throw clientError('This design cannot be booked right now.', 409);
  return amount;
}
function publicFlash(doc, urls, now = Date.now()) {
  const place = normalizePlace(doc.place);
  return { id: doc.id, title: doc.title, description: doc.description || '',
    imageUrl: urls.getImageUrl(doc.blobName), thumbnailUrl: urls.getThumbnailUrl(doc.thumbnailBlobName) || urls.getImageUrl(doc.blobName),
    width: doc.width, height: doc.height, depositJpy: deposit(doc), ...(place ? { place } : {}), sizeNote: doc.sizeNote || '', priceNote: doc.priceNote || '', status: effectiveStatus(doc, now) };
}
function publicList(docs, urls, now = Date.now()) {
  return docs.filter(d => ['available', 'held', 'taken'].includes(d.status)).sort((a, b) => a.order - b.order).map(d => publicFlash(d, urls, now));
}
function holdTransition(doc, token, now) {
  if (!doc || effectiveStatus(doc, now) !== 'available') throw clientError('Someone just claimed this design', 409);
  deposit(doc);
  return { ...doc, status: 'held', holdSessionId: token, heldUntil: new Date(now + 33 * 60000).toISOString(), claimId: null, updatedAt: new Date(now).toISOString() };
}
function releaseTransition(doc, sessionId, now) {
  if (!doc || doc.status !== 'held' || doc.holdSessionId !== sessionId) return null;
  return { ...doc, status: 'available', holdSessionId: null, heldUntil: null, updatedAt: new Date(now).toISOString() };
}
function claimFromSession(session, doc, booking, now) {
  return { id: session.id, type: 'flashClaim', flashId: doc.id, flashTitle: doc.title, status: 'pending', depositJpy: deposit(doc), booking,
    stripePaymentIntentId: null, createdAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString(), paidAt: null };
}
function buildSessionParams(doc, booking, origin, now, currency = 'jpy') {
  return { mode: 'payment', payment_method_types: ['card'], customer_email: booking.email,
    line_items: [{ quantity: 1, price_data: { currency, unit_amount: deposit(doc), product_data: { name: `Flash deposit — ${doc.title}` } } }],
    expires_at: Math.floor(now / 1000) + 31 * 60,
    custom_text: { submit: { message: 'Your deposit is non-refundable and will be deducted from the final tattoo price.' } },
    success_url: `${origin}/flash/claimed?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/flash?cancelled={CHECKOUT_SESSION_ID}`,
    metadata: { source: 'kihoko-flash', flashId: doc.id } };
}
async function changeFlash(db, id, transition) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const doc = await db.getFlashById(id);
    const next = transition(doc);
    if (!next) return doc;
    try { return await db.replaceFlashIfMatch(id, next, doc._etag); }
    catch (error) { if (error.code !== 412) throw error; }
  }
  throw clientError('Someone just claimed this design', 409);
}
async function changeClaim(db, id, transition) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const doc = await db.getFlashClaimById(id);
    if (!doc) throw new Error(`Missing flash claim ${id}; retry webhook`);
    const updates = transition(doc);
    if (!updates) return doc;
    try { return await db.updateFlashClaim(id, updates, doc._etag); }
    catch (error) { if (error.code !== 412) throw error; }
  }
  throw new Error(`Could not update flash claim ${id}; retry`);
}
// Expiring a session is authoritative: if expiry races payment, re-read before
// releasing. Other Stripe errors must propagate; uncertainty keeps the hold.
async function settleSession(stripe, id) {
  let session = await stripe.checkout.sessions.retrieve(id);
  if (session.status === 'open' && session.payment_status !== 'paid') {
    try { session = await stripe.checkout.sessions.expire(id); }
    catch (error) {
      session = await stripe.checkout.sessions.retrieve(id);
      if (session.status === 'open' && session.payment_status !== 'paid') throw error;
    }
  }
  return session;
}
async function applyFlashEvent(event, db, log = () => {}, now = Date.now()) {
  const session = event.data.object;
  if (event.type === 'checkout.session.completed' && session.payment_status === 'paid') {
    const claim = await db.getFlashClaimById(session.id);
    if (!claim) throw new Error(`PAID flash session ${session.id} has no claim; retry webhook`);
    let conflict = false;
    // Take design BEFORE recording payment. Retries finish the claim; a crash
    // cannot turn a paid design available. Even an expired/cancelled claim pays.
    await changeFlash(db, claim.flashId, doc => {
      if (!doc) throw new Error(`Missing PAID flash ${claim.flashId}`);
      if (doc.status === 'taken') { conflict = doc.claimId !== session.id; return null; }
      return { ...doc, status: 'taken', claimId: session.id, holdSessionId: null, heldUntil: null, updatedAt: new Date(now).toISOString() };
    });
    if (conflict) log(`CRITICAL: PAID FLASH CONFLICT ${claim.flashId}, session ${session.id}`);
    await changeClaim(db, session.id, current => ({ status: 'paid', paidAt: current.paidAt || new Date(now).toISOString(),
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
      ...(conflict ? { conflict: true } : {}), updatedAt: new Date(now).toISOString() }));
    return conflict ? 'flash-paid-conflict' : 'flash-paid';
  }
  if (event.type === 'checkout.session.expired') {
    const claim = await changeClaim(db, session.id, doc => doc.status === 'pending' ? { status: 'expired', updatedAt: new Date(now).toISOString() } : null);
    if (claim.status === 'expired') await changeFlash(db, claim.flashId, doc => releaseTransition(doc, session.id, now));
    return 'flash-expired';
  }
  return 'ignored';
}
async function listFlash({ db, urls, stripeFactory, log = () => {}, now = Date.now() }) {
  const docs = await db.getFlash();
  const settledSessions = new Set();
  for (const doc of docs) {
    if (doc.status !== 'held' || effectiveStatus(doc, now) !== 'available' || !doc.holdSessionId?.startsWith('cs_')) continue;
    try {
      const session = await settleSession(stripeFactory(), doc.holdSessionId);
      if (session.payment_status === 'paid') await applyFlashEvent({ type: 'checkout.session.completed', data: { object: session } }, db, log);
      else if (session.status === 'expired') await applyFlashEvent({ type: 'checkout.session.expired', data: { object: session } }, db, log);
      else throw new Error('Expired flash session is not safely settled');
      settledSessions.add(doc.holdSessionId);
    } catch (error) {
      // Keep browsing available during Stripe/reconciliation outages. This is
      // only a public status override: never release or rewrite an uncertain hold.
      log(`Flash ${doc.id} remains held: could not settle checkout (${error.message})`);
    }
  }
  // Re-read after reconciliation/concurrent webhook writes. A new expired real
  // session appearing during this read also stays held until it is settled.
  const fresh = await db.getFlash();
  const unsettledIds = new Set(fresh.filter(doc => doc.status === 'held' && effectiveStatus(doc, now) === 'available' && doc.holdSessionId?.startsWith('cs_') && !settledSessions.has(doc.holdSessionId)).map(doc => doc.id));
  return publicList(fresh, urls, now).map(doc => unsettledIds.has(doc.id) ? { ...doc, status: 'held' } : doc);
}
async function createClaim({ db, stripe, flashId, body, origin, currency = 'jpy', now = Date.now(), token = `pending:${randomUUID()}` }) {
  const booking = validateBooking(body);
  const old = await db.getFlashById(flashId);
  // Lazy expiry must check payment, even if its webhook has not arrived yet.
  if (old?.status === 'held' && effectiveStatus(old, now) === 'available' && old.holdSessionId?.startsWith('cs_')) {
    const session = await settleSession(stripe, old.holdSessionId);
    if (session.payment_status === 'paid') {
      await applyFlashEvent({ type: 'checkout.session.completed', data: { object: session } }, db);
      throw clientError('Someone just claimed this design', 409);
    }
    if (session.status !== 'expired') throw clientError('Someone just claimed this design', 409);
    await applyFlashEvent({ type: 'checkout.session.expired', data: { object: session } }, db);
  }
  const held = await changeFlash(db, flashId, doc => {
    // A concurrently installed expired session must be reconciled on a new request.
    if (doc?.status === 'held' && doc.holdSessionId?.startsWith('cs_') && doc.holdSessionId !== old?.holdSessionId) throw clientError('Someone just claimed this design', 409);
    return holdTransition(doc, token, now);
  });
  let session;
  try {
    session = await stripe.checkout.sessions.create(buildSessionParams(held, booking, origin, now, currency));
    await db.createFlashClaim(claimFromSession(session, held, booking, now));
    await changeFlash(db, flashId, doc => {
      if (doc?.status === 'taken' && doc.claimId === session.id) return null; // fast webhook
      if (doc?.status !== 'held' || doc.holdSessionId !== token) throw new Error('Flash hold changed before checkout');
      return { ...doc, holdSessionId: session.id, updatedAt: new Date(now).toISOString() };
    });
    return { url: session.url, sessionId: session.id };
  } catch (error) {
    // No checkout URL was delivered. If Stripe did create a session, close it
    // before freeing our token. A failed cleanup deliberately retains the hold.
    if (session) {
      const settled = await settleSession(stripe, session.id);
      if (settled.payment_status === 'paid') {
        await applyFlashEvent({ type: 'checkout.session.completed', data: { object: settled } }, db);
        throw error;
      }
      if (settled.status !== 'expired') throw error;
    }
    await changeFlash(db, flashId, doc => releaseTransition(doc, token, now));
    throw error;
  }
}
function validateSessionId(id) {
  if (typeof id !== 'string' || !/^cs_[A-Za-z0-9_]{1,250}$/.test(id)) throw clientError('A valid sessionId is required.');
  return id;
}
async function cancelClaim({ db, stripe, sessionId, now = Date.now() }) {
  validateSessionId(sessionId);
  let claim = await db.getFlashClaimById(sessionId);
  if (!claim || claim.status === 'paid' || claim.status === 'expired') return;
  if (claim.status === 'pending') {
    const session = await settleSession(stripe, sessionId);
    if (session.payment_status === 'paid') {
      await applyFlashEvent({ type: 'checkout.session.completed', data: { object: session } }, db);
      return;
    }
    if (session.status !== 'expired') return;
    claim = await changeClaim(db, sessionId, doc => doc.status === 'pending' ? { status: 'cancelled', updatedAt: new Date(now).toISOString() } : null);
  }
  if (claim.status === 'cancelled') await changeFlash(db, claim.flashId, doc => releaseTransition(doc, sessionId, now));
}
async function claimSummary(db, id, urls) {
  validateSessionId(id);
  const claim = await db.getFlashClaimById(id);
  if (!claim) return { status: 'unknown', flashTitle: null, thumbnailUrl: null, depositJpy: null };
  const doc = await db.getFlashById(claim.flashId);
  return { status: claim.status, flashTitle: claim.flashTitle, thumbnailUrl: doc ? urls.getThumbnailUrl(doc.thumbnailBlobName) || urls.getImageUrl(doc.blobName) : null, depositJpy: claim.depositJpy };
}
module.exports = { flashDocument, CAPS, validateBooking, effectiveStatus, publicFlash, publicList, holdTransition, releaseTransition, claimFromSession, buildSessionParams, createClaim, cancelClaim, applyFlashEvent, claimSummary, validateSessionId, listFlash };
