const { app } = require('@azure/functions');

app.http('uploadImage', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'images/upload',
  handler: async (request, context) => {
    return {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: false,
        error: 'Public uploads are disabled for security. Use the local upload script.'
      })
    };
  }
});
