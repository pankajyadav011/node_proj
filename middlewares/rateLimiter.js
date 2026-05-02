/**
 * middlewares/rateLimiter.js
 * Rate-limiting middleware powered by `express-rate-limit`.
 *
 * Two separate limiters are exported:
 *
 *  1. generalLimiter  – applied globally; allows generous traffic for redirect GETs.
 *  2. createLimiter   – applied only on POST /shortURL; tighter limit to prevent abuse.
 *
 * Limits can be tuned via environment variables for flexibility between environments.
 */

const rateLimit = require("express-rate-limit");

/**
 * generalLimiter
 * Allows up to 100 requests per 15-minute window per IP.
 * Applied to all routes in app.js as a global guard.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100,                  // maximum requests per window per IP
  standardHeaders: true,     // include RateLimit-* headers in responses
  legacyHeaders: false,      // disable deprecated X-RateLimit-* headers
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

/**
 * createLimiter
 * Stricter limiter for the URL creation endpoint (POST /shortURL).
 * Allows up to 20 creation requests per 15-minute window per IP.
 */
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // tighter limit for write operations
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many URL creation requests from this IP. Please try again after 15 minutes.",
  },
});

module.exports = { generalLimiter, createLimiter };
