const test = require('node:test');
const assert = require('node:assert/strict');
const { listCollabs } = require('../shared/collabs');

const DOC = {
  id: 'studio-x', type: 'collab', title: 'Collab with Studio X', note: '', link: '', status: 'visible', order: 0,
  images: [{ id: 'photo-1', blobName: 'images/collabs/one.jpg', thumbnailBlobName: 'thumbnails/collabs/one.jpg', width: 1600, height: 1200 }],
  createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-10-01T00:00:00.000Z'
};
const URLS = { getImageUrl: name => `https://media.test/${name}`, getThumbnailUrl: name => `https://media.test/${name}` };
const list = (docs, urls = URLS) => listCollabs({ db: { getCollabs: async () => structuredClone(docs) }, urls });

test('collabs sort by order ascending, then newer creation first; photo order is preserved', async () => {
  const docs = [
    { ...DOC, id: 'last', order: 1 },
    { ...DOC, id: 'older', order: 0 },
    { ...DOC, id: 'newer', order: 0, createdAt: '2026-10-02T00:00:00.000Z', images: [...DOC.images, { ...DOC.images[0], id: 'photo-2', blobName: 'images/collabs/two.jpg' }] }
  ];
  const result = await list(docs);
  assert.deepEqual(result.map(doc => doc.id), ['newer', 'older', 'last']);
  assert.deepEqual(result[0].images.map(image => image.url), ['https://media.test/images/collabs/one.jpg', 'https://media.test/images/collabs/two.jpg']);
  assert.deepEqual(Object.keys(result[0].images[0]), ['url', 'thumbnailUrl', 'width', 'height']);
  assert.equal(result[0].type, undefined);
});

test('hidden collabs and unknown statuses never appear even if returned by the DB', async () => {
  assert.deepEqual((await list([{ ...DOC, status: 'hidden' }, { ...DOC, status: 'draft' }, DOC])).map(doc => doc.id), [DOC.id]);
});

test('invalid links are dropped while valid absolute http(s) links are retained', async () => {
  for (const link of ['javascript:alert(1)', 'data:text/html,test', '//example.com', '/relative', 'https://', {}, 'https://' + 'x'.repeat(500)]) {
    assert.equal((await list([{ ...DOC, link }]))[0].link, '');
  }
  for (const link of ['', 'https://instagram.com/studiox', 'http://example.com/']) {
    assert.equal((await list([{ ...DOC, link }]))[0].link, link);
  }
});

test('empty collabs list', async () => { assert.deepEqual(await list([]), []); });

test('thumbnail falls back to original for absent/empty path or unavailable thumbnail URL', async () => {
  for (const thumbnailBlobName of [undefined, null, '']) {
    const [doc] = await list([{ ...DOC, images: [{ ...DOC.images[0], thumbnailBlobName }] }]);
    assert.equal(doc.images[0].thumbnailUrl, doc.images[0].url);
  }
  const [doc] = await list([DOC], { ...URLS, getThumbnailUrl: () => null });
  assert.equal(doc.images[0].thumbnailUrl, doc.images[0].url);
});

test('malformed documents are skipped without losing valid siblings', async () => {
  const bad = [null, [], {}, { ...DOC, type: 'product' }, ...[
    { id: '' }, { title: ' ' }, { title: 'x'.repeat(121) }, { note: null }, { note: 'x'.repeat(301) },
    { order: '0' }, { order: Infinity }, { createdAt: 'not a date' }, { updatedAt: null }, { images: {} },
    { images: [null] }, { images: [{ ...DOC.images[0], width: 0 }] }, { images: [{ ...DOC.images[0], height: 1.5 }] },
    { images: [{ ...DOC.images[0], blobName: '' }] }, { images: [{ ...DOC.images[0], thumbnailBlobName: {} }] }
  ].map(patch => ({ ...DOC, ...patch }))];
  assert.deepEqual((await list([...bad, DOC])).map(doc => doc.id), [DOC.id]);
});

test('anonymous GET adapter returns the envelope and public 60-second cache; DB failure returns an error', async () => {
  let endpoint;
  const db = require('../shared/database');
  const urls = require('../shared/blobStorage');
  const azurePath = require.resolve('@azure/functions');
  const originalAzure = require.cache[azurePath];
  const originalGet = db.getCollabs;
  const originalImage = urls.getImageUrl, originalThumbnail = urls.getThumbnailUrl;
  try {
    require.cache[azurePath] = { id: azurePath, filename: azurePath, loaded: true, exports: { app: { http: (name, options) => { endpoint = options; } } } };
    require('../src/functions/collabs');
    assert.deepEqual(endpoint.methods, ['GET']);
    assert.equal(endpoint.authLevel, 'anonymous');
    assert.equal(endpoint.route, 'collabs');
    db.getCollabs = async () => [DOC];
    Object.assign(urls, URLS);
    const response = await endpoint.handler({}, { error() {} });
    assert.equal(response.status, 200);
    assert.equal(response.headers['Cache-Control'], 'public, max-age=60');
    assert.deepEqual(JSON.parse(response.body), { success: true, data: await list([DOC]) });
    db.getCollabs = async () => { throw new Error('offline'); };
    const failure = await endpoint.handler({}, { error() {} });
    assert.equal(failure.status, 500);
    assert.equal(JSON.parse(failure.body).success, false);
  } finally {
    db.getCollabs = originalGet;
    urls.getImageUrl = originalImage; urls.getThumbnailUrl = originalThumbnail;
    if (originalAzure) require.cache[azurePath] = originalAzure; else delete require.cache[azurePath];
  }
});

test('database helper uses the literal collab partition without needing a composite index', async () => {
  const db = require('../shared/database');
  const original = { initialized: db.initialized, container: db.container };
  try {
    db.initialized = true;
    db.container = { items: { query(query, options) {
      assert.deepEqual(options, { partitionKey: 'collab' });
      assert.deepEqual(query.parameters, [{ name: '@type', value: 'collab' }, { name: '@status', value: 'visible' }]);
      return { fetchAll: async () => ({ resources: [DOC] }) };
    } } };
    assert.deepEqual(await db.getCollabs(), [DOC]);
  } finally { Object.assign(db, original); }
});
