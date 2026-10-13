#!/usr/bin/env node
/** Local-only reviewer preview. Nothing in web/ imports this file. No dependencies. */
const http = require('node:http');
const { randomUUID } = require('node:crypto');
const flash = require('../api/shared/flash');
const port = Number(process.env.FLASH_MOCK_PORT || 7071);
const base = `http://localhost:${port}`;
const names = ['Moon garden', 'Wandering koi', 'Little chrysanthemum', 'Night moth', 'Wild stem', 'Sun & sea', 'Quiet serpent', 'Osaka bloom', 'Two swallows', 'Lucky beetle', 'Dancing leaves', 'Evening star', 'Soft peony', 'Floating cloud', 'Paper crane', 'Bamboo whisper', 'Small universe', 'Spring branch'];
const places = ['NYC', 'Kyoto', 'Lisbon'];
const stamp = new Date().toISOString();
const docs = Object.fromEntries(names.map((title, i) => {
  const wide = i % 3 === 1;
  return [`flash-${i + 1}`, { id: `flash-${i + 1}`, type: 'flash', title, description: 'A small, one-off drawing from Kiho’s sketchbook. This is local placeholder art for previewing the flash book.', blobName: `art/${i + 1}.svg`, thumbnailBlobName: `art/${i + 1}.svg`, width: wide ? 600 : 400, height: wide ? 400 : 600, depositJpy: 2000, place: i % 3 === 0 ? places[Math.floor(i / 3) % places.length] : '', sizeNote: i % 2 ? 'about 8 cm' : 'about 12 cm', priceNote: 'from ¥25,000', status: i === 1 || i === 7 ? 'taken' : i === 4 ? 'held' : 'available', holdSessionId: i === 4 ? 'pending:preview' : null, heldUntil: i === 4 ? new Date(Date.now() + 33 * 60000).toISOString() : null, claimId: i === 1 || i === 7 ? `cs_preview_taken_${i}` : null, order: i, createdAt: stamp, updatedAt: stamp, _etag: '1' }];
}));
const claims = {}, sessions = {};
let version = 1;
const copy = value => structuredClone(value);
const db = {
  async getFlash() { return copy(Object.values(docs)); },
  async getFlashById(id) { return copy(docs[id] || null); },
  async replaceFlashIfMatch(id, next, etag) {
    if (docs[id]?._etag !== etag) throw Object.assign(new Error('concurrent write'), { code: 412 });
    return copy(docs[id] = { ...copy(next), _etag: String(++version) });
  },
  async createFlashClaim(doc) {
    if (claims[doc.id]) throw Object.assign(new Error('exists'), { code: 409 });
    return copy(claims[doc.id] = { ...copy(doc), _etag: String(++version) });
  },
  async getFlashClaimById(id) { return copy(claims[id] || null); },
  async updateFlashClaim(id, updates, etag) {
    if (claims[id]?._etag !== etag) throw Object.assign(new Error('concurrent write'), { code: 412 });
    return copy(claims[id] = { ...claims[id], ...copy(updates), _etag: String(++version) });
  }
};
const urls = { getImageUrl: name => name ? `${base}/${name}` : null, getThumbnailUrl: name => name ? `${base}/${name}` : null };
const stripe = { checkout: { sessions: {
  async create(params) {
    const id = `cs_mock_${randomUUID().replaceAll('-', '')}`;
    return copy(sessions[id] = { id, url: `${base}/pretend-stripe/${id}`, status: 'open', payment_status: 'unpaid', metadata: params.metadata, success_url: params.success_url, cancel_url: params.cancel_url, expires_at: params.expires_at });
  },
  async retrieve(id) {
    const session = sessions[id];
    if (!session) throw new Error('Checkout not found');
    if (session.status === 'open' && Date.now() / 1000 >= session.expires_at) session.status = 'expired';
    return copy(session);
  },
  async expire(id) {
    const session = await this.retrieve(id);
    if (session.status !== 'open') throw new Error('already expired/complete');
    sessions[id].status = 'expired'; return copy(sessions[id]);
  }
} } };
function svg(i) {
  const wide = (i - 1) % 3 === 1;
  // Opaque scans: available portrait flash-1, available landscape flash-11, taken flash-2.
  const background = [1, 11, 2].includes(i) ? `<rect x="${wide ? -100 : 0}" y="${wide ? 80 : 0}" width="${wide ? 600 : 400}" height="${wide ? 400 : 600}" fill="#fff"/>` : '';
  const motifs = [
    '<path d="M235 110a90 90 0 1 0 0 180 95 95 0 0 1 0-180Z"/><path d="M180 330q-35 70 20 125m-7-56q-75 0-72-65 57 6 72 65m0 20q55-70 89-45-7 60-89 45"/>',
    '<path d="M90 285q130-170 230-50-85 5-90 80-30 45-82 15l-52 26 19-46Z"/><path d="M143 268q80-58 124-24m-110 50q63-49 94-33m-54 58q-20-48-59-50"/><circle cx="290" cy="240" r="4" fill="currentColor"/><path d="M70 210q60-20 95 0m75 155q45-20 90 0"/>',
    '<g transform="translate(200 240)">' + Array.from({ length: 12 }, (_, n) => `<ellipse cx="0" cy="-60" rx="19" ry="68" transform="rotate(${n * 30})"/>`).join('') + '<circle r="25"/></g><path d="M200 370v100m0-45q-70 0-65-60 55 0 65 60m0-5q55-65 65-55-5 70-65 55"/>',
    '<path d="M200 170v210m-8-155q-130-115-140 10 15 72 136 44m22-52q130-115 138 10-15 72-133 44m-26 7q-93-10-89 80 50 30 90-41m18-37q93-10 89 80-50 30-90-41M194 170l-20-33m30 33 24-33"/><circle cx="108" cy="240" r="19"/><circle cx="294" cy="240" r="19"/>',
    '<path d="M205 480q-28-170 3-345m-4 230q-110-20-105-90 92 8 105 90m-5-96q88-65 112-40-13 66-112 40m8-58q-60-15-62-65 52 0 62 65m-7 195q82-90 112-59-27 74-112 59"/>',
    '<circle cx="200" cy="225" r="72"/><path d="M80 355q60-40 120 0t120 0M80 385q60-40 120 0t120 0M80 415q60-40 120 0t120 0"/>' + Array.from({ length: 12 }, (_, n) => `<path d="M200 128v-15" transform="rotate(${n * 30} 200 225)"/>`).join('')
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${wide ? 600 : 400}" height="${wide ? 400 : 600}" viewBox="${wide ? '-100 80 600 400' : '0 0 400 600'}">${background}<g fill="none" stroke="#36372e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" color="#36372e">${motifs[(i - 1) % motifs.length]}<path d="M60 110h12m-6-6v12M315 450h12m-6-6v12" stroke-width="2"/></g></svg>`;
}
function send(res, status, data) { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); }
async function body(req) {
  let text = '';
  for await (const chunk of req) { text += chunk; if (text.length > 16000) throw Object.assign(new Error('Request too long'), { status: 400 }); }
  try { return JSON.parse(text || '{}'); } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}
function redirect(res, destination, id) { res.writeHead(303, { Location: destination.replace('{CHECKOUT_SESSION_ID}', id) }); res.end(); }
function localOrigin(value) { const url = new URL(value); return ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) && url.protocol === 'http:'; }
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || 'http://localhost:3000';
  if (!localOrigin(origin)) { send(res, 403, { error: 'Local preview only' }); return; }
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  try {
    const url = new URL(req.url, base), path = url.pathname;
    const art = path.match(/^\/art\/(\d+)\.svg$/);
    if (art) { res.writeHead(200, { 'Content-Type': 'image/svg+xml' }); res.end(svg(Number(art[1]))); return; }
    if (path === '/api/flash' && req.method === 'GET') { send(res, 200, { success: true, data: await flash.listFlash({ db, urls, stripeFactory: () => stripe, log: console.warn }) }); return; }
    const claimRoute = path.match(/^\/api\/flash\/([^/]+)\/claim$/);
    if (claimRoute && req.method === 'POST') {
      const data = await flash.createClaim({ db, stripe, flashId: decodeURIComponent(claimRoute[1]), body: await body(req), origin });
      send(res, 200, { success: true, data }); return;
    }
    if (path === '/api/flash/claim/cancel' && req.method === 'POST') {
      const data = await body(req); await flash.cancelClaim({ db, stripe, sessionId: data.sessionId });
      send(res, 200, { success: true, data: { cancelled: true } }); return;
    }
    if (path === '/api/flash/claim' && req.method === 'GET') {
      send(res, 200, { success: true, data: await flash.claimSummary(db, url.searchParams.get('session_id'), urls) }); return;
    }
    const checkout = path.match(/^\/pretend-stripe\/(cs_mock_[a-z0-9]+)(?:\/(pay|cancel))?$/);
    if (checkout) {
      const [, id, action] = checkout;
      const session = await stripe.checkout.sessions.retrieve(id);
      if (req.method === 'POST' && action) {
        if (action === 'pay') {
          if (session.status === 'expired') throw Object.assign(new Error('This checkout has expired. Return to the book.'), { status: 409 });
          Object.assign(sessions[id], { status: 'complete', payment_status: 'paid', payment_intent: `pi_mock_${id.slice(8)}` });
          await flash.applyFlashEvent({ type: 'checkout.session.completed', data: { object: sessions[id] } }, db, console.log);
          redirect(res, session.success_url, id);
        } else redirect(res, session.cancel_url, id);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pretend Stripe — local preview</title><style>body{font:16px Arial;background:#f5f1e8;color:#333;margin:0;display:grid;min-height:100vh;place-items:center}main{padding:24px;max-width:440px}h1{font-weight:400}button{font:inherit;min-height:48px;border:1px solid #333;border-radius:24px;padding:12px 24px;background:#333;color:white;cursor:pointer}form{display:inline-block;margin:12px 8px 0 0}</style><main><small>LOCAL PREVIEW / NO REAL PAYMENT</small><h1>Pretend Stripe</h1><p>¥2,000 non-refundable deposit, deducted from your final tattoo price.</p><p>Pay confirms the fixture. Cancel returns you to the book and releases its hold.</p><form method="post" action="/pretend-stripe/${id}/pay"><button>Pay ¥2,000 (pretend)</button></form><form method="post" action="/pretend-stripe/${id}/cancel"><button>Cancel</button></form></main></html>`); return;
    }
    send(res, 404, { success: false, error: 'Not found in local flash preview' });
  } catch (error) { send(res, error.status || 500, { success: false, error: error.isClientError ? error.message : error.status ? error.message : 'Local preview request failed' }); }
});
server.listen(port, '127.0.0.1', () => console.log(`Flash mock: ${base}/api/flash\nStart web with REACT_APP_API_URL=${base}/api npm start\nOpen http://localhost:3000/flash (18 designs; no external services)`));
