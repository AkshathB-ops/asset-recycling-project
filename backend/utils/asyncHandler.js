// Express 4 doesn't forward rejected promises to error middleware automatically.
// Wrap async route handlers with this so thrown/rejected errors reach the error handler.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
