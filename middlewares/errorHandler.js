/**
 * middlewares/errorHandler.js
 * Centralised error-handling middleware for Express.
 *
 * Express identifies error-handling middleware by its four-argument signature:
 *   (err, req, res, next)
 *
 * Any route/controller that calls next(err) or throws inside an async handler
 * (when wrapped with asyncHandler) will end up here.
 *
 * Response format:
 * {
 *   "success": false,
 *   "message": "<human readable message>",
 *   "stack": "<stack trace – only in development>"
 * }
 */

/**
 * errorHandler
 * Must be the LAST middleware registered in app.js.
 *
 * @param {Error}  err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next  – required even if unused (Express signature)
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if the error object doesn't carry a status code
  const statusCode = err.statusCode || res.statusCode !== 200 ? res.statusCode : 500;

  console.error(`[ERROR] ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    // Expose stack trace only during development for easier debugging
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
