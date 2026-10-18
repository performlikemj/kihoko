const { app } = require('@azure/functions');
const db = require('../../shared/database');
const urls = require('../../shared/blobStorage');
const { listCollabs } = require('../../shared/collabs');
const { jsonResponse } = require('../../shared/http');

app.http('collabsList', {
  methods: ['GET'],
  route: 'collabs',
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      return jsonResponse(200, { success: true, data: await listCollabs({ db, urls }) }, { 'Cache-Control': 'public, max-age=60' });
    } catch (error) {
      context.error('Collaborations list failed', error);
      return jsonResponse(500, { success: false, error: 'Collaborations could not load. Please try again in a moment.' });
    }
  }
});
