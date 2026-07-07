/**
 * Shared HTTP helpers for Azure Functions responses.
 */

function jsonResponse(status, payload, extraHeaders = {}) {
  return {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(payload)
  };
}

/**
 * Heuristic for "the database is unavailable" errors, used by read endpoints
 * to degrade gracefully (empty results) instead of hard-failing.
 */
function isDatabaseError(error) {
  return error.message?.includes('cosmos') ||
         error.message?.includes('database') ||
         error.message?.includes('composite index') ||
         error.code === 'ECONNREFUSED';
}

module.exports = { jsonResponse, isDatabaseError };
