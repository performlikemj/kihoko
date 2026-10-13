const { test } = require('node:test');
const assert = require('node:assert/strict');
const flash = require('../shared/flash');
const { applyStripeEvent } = require('../shared/webhookHandler');
const NOW = Date.parse('2026-10-13T00:00:00Z');
const BODY = { name: ' Kiho ', email: 'kiho@example.jp', placement: 'Arm', agree: true };
const URLS = { getImageUrl: n => `image/${n}`, getThumbnailUrl: n => n ? `thumb/${n}` : null };
const DESIGN = { id: 'art', type: 'flash', title: 'Moon', description: 'A moon', blobName: 'moon.jpg', thumbnailBlobName: 'small.jpg', width: 600, height: 800, depositJpy: 2000, status: 'available', holdSessionId: null, heldUntil: null, claimId: null, order: 1, createdAt: new Date(NOW).toISOString(), updatedAt: new Date(NOW).toISOString(), _etag: '1' };
function mockDb(design = DESIGN) {
  const docs = { art: structuredClone(design) }, claims = {};
  let version = 1;
  return { docs, claims,
    async getFlash() { return structuredClone(Object.values(docs)); },
    async getFlashById(id) { return structuredClone(docs[id] || null); },
    async replaceFlashIfMatch(id, next, etag) {
      if (etag !== docs[id]._etag) throw Object.assign(new Error('etag'), { code: 412 });
      docs[id] = { ...structuredClone(next), _etag: String(++version) }; return structuredClone(docs[id]);
    },
    async createFlashClaim(doc) {
      if (claims[doc.id]) throw Object.assign(new Error('exists'), { code: 409 });
      claims[doc.id] = { ...structuredClone(doc), _etag: String(++version) }; return structuredClone(claims[doc.id]);
    },
    async getFlashClaimById(id) { return structuredClone(claims[id] || null); },
    async updateFlashClaim(id, updates, etag) {
      if (etag !== claims[id]._etag) throw Object.assign(new Error('etag'), { code: 412 });
      claims[id] = { ...claims[id], ...updates, _etag: String(++version) }; return structuredClone(claims[id]);
    }
  };
}
function fakeStripe() {
  const sessions = {}, params = [];
  return { sessions, params, checkout: { sessions: {
    async create(payload) { params.push(payload); const id = `cs_test_${params.length}`; return sessions[id] = { id, url: 'https://pretend.test/checkout', status: 'open', payment_status: 'unpaid', metadata: payload.metadata }; },
    async retrieve(id) { assert.ok(sessions[id]); return structuredClone(sessions[id]); },
    async expire(id) { if (sessions[id].status !== 'open') throw new Error('already expired/complete'); sessions[id].status = 'expired'; return structuredClone(sessions[id]); }
  } } };
}
async function claim(db = mockDb(), stripe = fakeStripe(), extra = {}) {
  const result = await flash.createClaim({ db, stripe, flashId: 'art', body: BODY, origin: 'https://kihoko.com', now: NOW, ...extra });
  return { db, stripe, ...result };
}
function event(type, session) { return { type: `checkout.session.${type}`, data: { object: session } }; }
function paid(stripe, id) { Object.assign(stripe.sessions[id], { status: 'complete', payment_status: 'paid', payment_intent: 'pi_test' }); return stripe.sessions[id]; }

test('happy path: private pending claim and 33 minute hold; card-only 31 minute JPY checkout', async () => {
  const { db, stripe, sessionId } = await claim();
  assert.equal(db.docs.art.holdSessionId, sessionId);
  assert.equal(db.docs.art.heldUntil, new Date(NOW + 33 * 60000).toISOString());
  assert.equal(db.claims[sessionId].booking.name, 'Kiho');
  assert.equal(db.claims[sessionId].status, 'pending');
  const p = stripe.params[0];
  assert.equal(p.expires_at, Math.floor(NOW / 1000) + 31 * 60);
  assert.deepEqual(p.payment_method_types, ['card']);
  assert.equal(p.customer_email, BODY.email);
  assert.equal(p.line_items.length, 1);
  assert.equal(p.line_items[0].price_data.unit_amount, 2000);
  assert.equal(p.line_items[0].price_data.currency, 'jpy');
  assert.equal(p.shipping_address_collection, undefined);
  assert.equal(p.success_url, 'https://kihoko.com/flash/claimed?session_id={CHECKOUT_SESSION_ID}');
  assert.equal(p.cancel_url, 'https://kihoko.com/flash?cancelled={CHECKOUT_SESSION_ID}');
  assert.match(p.custom_text.submit.message, /non-refundable/);
});
test('two concurrent claims: exactly one wins, only one Stripe session', async () => {
  const db = mockDb(), stripe = fakeStripe();
  const results = await Promise.allSettled([claim(db, stripe), claim(db, stripe)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.status, 409);
  assert.equal(stripe.params.length, 1);
});
test('expired provisional hold can be reclaimed', async () => {
  const db = mockDb({ ...DESIGN, status: 'held', holdSessionId: 'pending:old', heldUntil: new Date(NOW - 1).toISOString() });
  assert.equal(flash.effectiveStatus(db.docs.art, NOW), 'available');
  await claim(db); assert.equal(db.docs.art.holdSessionId, 'cs_test_1');
});
test('expired real hold expires Stripe and can be reclaimed', async () => {
  const { db, stripe, sessionId } = await claim();
  const next = await claim(db, stripe, { now: NOW + 33 * 60000 });
  assert.equal(stripe.sessions[sessionId].status, 'expired');
  assert.equal(db.claims[sessionId].status, 'expired');
  assert.equal(db.docs.art.holdSessionId, next.sessionId);
});
test('payment with delayed webhook blocks reclaim of expired hold', async () => {
  const { db, stripe, sessionId } = await claim(); paid(stripe, sessionId);
  await assert.rejects(claim(db, stripe, { now: NOW + 33 * 60000 }), { status: 409 });
  assert.equal(db.docs.art.status, 'taken'); assert.equal(stripe.params.length, 1);
});
test('Stripe failure releases provisional hold', async () => {
  const db = mockDb(), stripe = fakeStripe(); stripe.checkout.sessions.create = async () => { throw new Error('Stripe unavailable'); };
  await assert.rejects(claim(db, stripe), /Stripe unavailable/);
  assert.equal(db.docs.art.status, 'available'); assert.equal(db.docs.art.holdSessionId, null);
});
test('claim write failure expires session and releases only provisional hold', async () => {
  const db = mockDb(), stripe = fakeStripe(); db.createFlashClaim = async () => { throw new Error('db unavailable'); };
  await assert.rejects(claim(db, stripe), /db unavailable/);
  assert.equal(stripe.sessions.cs_test_1.status, 'expired'); assert.equal(db.docs.art.status, 'available');
});
test('uncertain Stripe cleanup retains hold', async () => {
  const db = mockDb(), stripe = fakeStripe(); db.createFlashClaim = async () => { throw new Error('db unavailable'); };
  stripe.checkout.sessions.expire = async () => { throw new Error('Stripe unavailable'); };
  await assert.rejects(claim(db, stripe)); assert.equal(db.docs.art.status, 'held');
});
test('cancel is idempotent and releases matching hold', async () => {
  const c = await claim(); await flash.cancelClaim(c); await flash.cancelClaim(c);
  assert.equal(c.db.docs.art.status, 'available'); assert.equal(c.db.claims[c.sessionId].status, 'cancelled');
});
test('cancel releases only its own hold', async () => {
  const c = await claim(); c.db.docs.art.holdSessionId = 'cs_other'; await flash.cancelClaim(c);
  assert.equal(c.db.docs.art.status, 'held'); assert.equal(c.db.claims[c.sessionId].status, 'cancelled');
});
test('cancel of paid session does not release, even before webhook', async () => {
  const c = await claim(); paid(c.stripe, c.sessionId); await flash.cancelClaim(c);
  assert.equal(c.db.docs.art.status, 'taken'); assert.equal(c.db.claims[c.sessionId].status, 'paid');
});
test('cancel racing completion re-reads after expiry refusal', async () => {
  const c = await claim(); c.stripe.checkout.sessions.expire = async id => { paid(c.stripe, id); throw new Error('already complete'); };
  await flash.cancelClaim(c); assert.equal(c.db.docs.art.status, 'taken');
});
test('webhook paid takes design; redelivery is idempotent', async () => {
  const c = await claim(), e = event('completed', paid(c.stripe, c.sessionId));
  await applyStripeEvent(e, c.db); const paidAt = c.db.claims[c.sessionId].paidAt;
  await applyStripeEvent(e, c.db);
  assert.equal(c.db.docs.art.status, 'taken'); assert.equal(c.db.docs.art.claimId, c.sessionId);
  assert.equal(c.db.docs.art.holdSessionId, null); assert.equal(c.db.claims[c.sessionId].paidAt, paidAt);
  assert.equal(c.db.claims[c.sessionId].stripePaymentIntentId, 'pi_test');
});
test('crash between taken and paid fails safe and redelivery completes', async () => {
  const c = await claim(), e = event('completed', paid(c.stripe, c.sessionId));
  const update = c.db.updateFlashClaim; c.db.updateFlashClaim = async () => { throw new Error('crash'); };
  await assert.rejects(applyStripeEvent(e, c.db)); assert.equal(c.db.docs.art.status, 'taken');
  c.db.updateFlashClaim = update; await applyStripeEvent(e, c.db); assert.equal(c.db.claims[c.sessionId].status, 'paid');
});
test('paid conflict is recorded and logged, original owner retained', async () => {
  const c = await claim(); Object.assign(c.db.docs.art, { status: 'taken', claimId: 'cs_other' });
  const logs = []; await applyStripeEvent(event('completed', paid(c.stripe, c.sessionId)), c.db, msg => logs.push(msg));
  assert.equal(c.db.claims[c.sessionId].status, 'paid'); assert.equal(c.db.claims[c.sessionId].conflict, true);
  assert.equal(c.db.docs.art.claimId, 'cs_other'); assert.match(logs[0], /CRITICAL/);
});
test('webhook expired releases only matching hold, preserves paid status', async () => {
  const c = await claim(), e = event('expired', c.stripe.sessions[c.sessionId]);
  c.db.docs.art.holdSessionId = 'cs_other'; await applyStripeEvent(e, c.db);
  assert.equal(c.db.claims[c.sessionId].status, 'expired'); assert.equal(c.db.docs.art.status, 'held');
  c.db.docs.art.holdSessionId = c.sessionId; await applyStripeEvent(e, c.db); assert.equal(c.db.docs.art.status, 'available');
  await applyStripeEvent(event('completed', paid(c.stripe, c.sessionId)), c.db); await applyStripeEvent(e, c.db);
  assert.equal(c.db.docs.art.status, 'taken'); assert.equal(c.db.claims[c.sessionId].status, 'paid');
});
test('public list and claim summary leak no private fields', async () => {
  const c = await claim();
  const list = flash.publicList([{ ...c.db.docs.art, booking: BODY }, { ...DESIGN, id: 'hide', status: 'hidden' }], URLS, NOW);
  assert.equal(list.length, 1);
  assert.deepEqual(Object.keys(list[0]).sort(), ['id', 'title', 'description', 'imageUrl', 'thumbnailUrl', 'width', 'height', 'depositJpy', 'sizeNote', 'priceNote', 'status'].sort());
  assert.deepEqual(Object.keys(await flash.claimSummary(c.db, c.sessionId, URLS)).sort(), ['status', 'flashTitle', 'thumbnailUrl', 'depositJpy'].sort());
});
test('deposit comes from doc, never body; defaults to 2000', async () => {
  const c = await claim(mockDb({ ...DESIGN, depositJpy: 3000 }), fakeStripe(), { body: { ...BODY, depositJpy: 1 } });
  assert.equal(c.stripe.params[0].line_items[0].price_data.unit_amount, 3000);
  assert.equal(flash.buildSessionParams({ ...DESIGN, depositJpy: undefined }, BODY, 'https://kihoko.com', NOW).line_items[0].price_data.unit_amount, 2000);
});
test('server validation: trims, enforces required fields, caps and rejects controls before trimming', () => {
  assert.equal(flash.validateBooking(BODY).name, 'Kiho');
  for (const [key, cap] of Object.entries(flash.CAPS)) assert.throws(() => flash.validateBooking({ ...BODY, [key]: 'x'.repeat(cap + 1) }));
  for (const key of ['name', 'email', 'placement']) assert.throws(() => flash.validateBooking({ ...BODY, [key]: ' ' }));
  for (const agree of [false, 'true', undefined]) assert.throws(() => flash.validateBooking({ ...BODY, agree }));
  for (const value of ['x\n', '\tName', 'x\u007f', 'x\u0085']) assert.throws(() => flash.validateBooking({ ...BODY, name: value }));
  assert.throws(() => flash.validateBooking({ ...BODY, email: 'bad' }));
  assert.throws(() => flash.validateSessionId('pi_test')); assert.throws(() => flash.validateSessionId('cs_\n'));
});
test('unpaid flash completion never enters store flow', async () => {
  const c = await claim(); assert.equal(await applyStripeEvent(event('completed', c.stripe.sessions[c.sessionId]), c.db), 'ignored');
  assert.equal(c.db.docs.art.status, 'held');
});
test('flash functions register without starting workers', () => {
  const routes = [];
  require.cache[require.resolve('@azure/functions')] = { id: '@azure/functions', filename: require.resolve('@azure/functions'), loaded: true, exports: { app: { http: (name, options) => routes.push(options.route) } } };
  require('../src/functions/flash'); assert.equal(routes.length, 4);
});
test('public expired-hold read reconciles delayed payment before showing availability', async () => {
  const c = await claim(); paid(c.stripe, c.sessionId);
  const list = await flash.listFlash({ db: c.db, urls: URLS, stripeFactory: () => c.stripe, now: NOW + 33 * 60000 });
  assert.equal(list[0].status, 'taken'); assert.equal(c.db.claims[c.sessionId].status, 'paid');
});
test('public expired-hold read settles unpaid session lazily', async () => {
  const c = await claim();
  const list = await flash.listFlash({ db: c.db, urls: URLS, stripeFactory: () => c.stripe, now: NOW + 33 * 60000 });
  assert.equal(list[0].status, 'available'); assert.equal(c.db.claims[c.sessionId].status, 'expired');
});
test('canonical uploader shape is deterministic, defaults deposit and omits system/private additions', () => {
  const doc = flash.flashDocument({ ...DESIGN, depositJpy: undefined, booking: BODY }, NOW);
  assert.equal(doc.type, 'flash'); assert.equal(doc.depositJpy, 2000); assert.equal(doc._etag, undefined); assert.equal(doc.booking, undefined);
  assert.deepEqual(doc, flash.flashDocument({ ...DESIGN, depositJpy: undefined, booking: BODY }, NOW));
  for (const bad of [{ width: 0 }, { height: -1 }, { order: NaN }, { status: 'sold' }, { depositJpy: 1.5 }, { title: '' }]) assert.throws(() => flash.flashDocument({ ...DESIGN, ...bad }, NOW));
});
test('etag retries are bounded at three, with no Stripe call on exhaustion', async () => {
  const db = mockDb(), stripe = fakeStripe(); let attempts = 0;
  db.replaceFlashIfMatch = async () => { attempts++; throw Object.assign(new Error('race'), { code: 412 }); };
  await assert.rejects(claim(db, stripe), { status: 409 });
  assert.equal(attempts, 3); assert.equal(stripe.params.length, 0);
});
test('a fast payment webhook between claim creation and session attachment stays taken', async () => {
  const db = mockDb(), stripe = fakeStripe(), create = db.createFlashClaim;
  db.createFlashClaim = async doc => { const saved = await create(doc); await applyStripeEvent(event('completed', paid(stripe, doc.id)), db); return saved; };
  const result = await claim(db, stripe); assert.equal(result.sessionId, db.docs.art.claimId); assert.equal(db.docs.art.status, 'taken');
});
test('failure cleanup never clears a newer hold', async () => {
  const db = mockDb(), stripe = fakeStripe();
  stripe.checkout.sessions.create = async () => { db.docs.art.holdSessionId = 'pending:new-owner'; throw new Error('Stripe failure'); };
  await assert.rejects(claim(db, stripe)); assert.equal(db.docs.art.holdSessionId, 'pending:new-owner'); assert.equal(db.docs.art.status, 'held');
});
test('public list survives a Stripe outage, logs it, and keeps an unsettled expired hold unavailable', async () => {
  const c = await claim();
  c.db.docs.art.heldUntil = new Date(NOW - 1).toISOString();
  c.db.docs.other = { ...DESIGN, id: 'other', order: 2 };
  const before = structuredClone(c.db.docs.art), logs = [];
  c.stripe.checkout.sessions.retrieve = async () => { throw new Error('Stripe unreachable'); };
  const list = await flash.listFlash({ db: c.db, urls: URLS, stripeFactory: () => c.stripe, log: message => logs.push(message), now: NOW });
  assert.equal(list.length, 2);
  assert.equal(list.find(doc => doc.id === 'art').status, 'held');
  assert.equal(list.find(doc => doc.id === 'other').status, 'available');
  assert.deepEqual(c.db.docs.art, before);
  assert.equal(c.db.claims[c.sessionId].status, 'pending');
  assert.match(logs[0], /art remains held.*Stripe unreachable/);
  assert.equal(list[0].holdSessionId, undefined);
});
test('public list stays readable when Stripe configuration or expiration fails', async () => {
  for (const failure of ['configuration', 'expiration']) {
    const c = await claim();
    c.db.docs.art.heldUntil = new Date(NOW - 1).toISOString();
    c.stripe.checkout.sessions.expire = async () => { throw new Error('Expiry unavailable'); };
    const factory = () => { if (failure === 'configuration') throw new Error('Stripe not configured'); return c.stripe; };
    const logs = [];
    const list = await flash.listFlash({ db: c.db, urls: URLS, stripeFactory: factory, log: message => logs.push(message), now: NOW });
    assert.equal(list[0].status, 'held'); assert.equal(logs.length, 1);
  }
});
test('public list preserves taken state if payment reconciliation partly fails', async () => {
  const c = await claim(); paid(c.stripe, c.sessionId);
  c.db.docs.art.heldUntil = new Date(NOW - 1).toISOString();
  c.db.updateFlashClaim = async () => { throw new Error('Claim write unavailable'); };
  const list = await flash.listFlash({ db: c.db, urls: URLS, stripeFactory: () => c.stripe, now: NOW });
  assert.equal(list[0].status, 'taken');
});
test('place is trimmed, capped at 40 characters, and included in the uploader/public shapes', async () => {
  const doc = flash.flashDocument({ ...DESIGN, place: ' Kyoto ' }, NOW);
  assert.equal(doc.place, 'Kyoto');
  assert.equal(flash.flashDocument({ ...DESIGN, place: 'x'.repeat(40) }, NOW).place.length, 40);
  assert.throws(() => flash.flashDocument({ ...DESIGN, place: 'x'.repeat(41) }, NOW), /40 characters/);
  for (const place of [123, {}, 'NYC\n', 'Kyoto\u007f']) assert.throws(() => flash.flashDocument({ ...DESIGN, place }, NOW), /plain text/);
  const list = await flash.listFlash({ db: mockDb({ ...DESIGN, place: ' Kyoto ' }), urls: URLS, now: NOW });
  assert.equal(list[0].place, 'Kyoto');
  assert.equal(list[0].holdSessionId, undefined);
});
test('blank or missing place is absent from both the canonical document and public list', () => {
  for (const place of [undefined, null, '', '  ']) {
    const doc = flash.flashDocument({ ...DESIGN, place }, NOW);
    assert.equal(Object.hasOwn(doc, 'place'), false);
    const list = flash.publicList([{ ...DESIGN, place }], URLS, NOW);
    assert.equal(Object.hasOwn(list[0], 'place'), false);
  }
});
test('a larger requested tattoo size leaves the document-authoritative deposit unchanged', async () => {
  const c = await claim(mockDb({ ...DESIGN, sizeNote: 'about 8 cm', priceNote: 'from ¥25,000', depositJpy: 2500 }), fakeStripe(), { body: { ...BODY, size: 'about 20 cm', depositJpy: 9999 } });
  assert.equal(c.db.claims[c.sessionId].booking.size, 'about 20 cm');
  assert.equal(c.db.claims[c.sessionId].depositJpy, 2500);
  assert.equal(c.stripe.params[0].line_items[0].price_data.unit_amount, 2500);
});
