/**
 * app.js
 * Main entry point for the URL Shortening Service.
 *
 * Responsibilities:
 *  - Load environment variables
 *  - Connect to MongoDB
 *  - Configure Express middleware (JSON parsing, logging, rate limiting)
 *  - Mount routes
 *  - Register the centralised error handler
 *  - Start the HTTP server
 */

require("dotenv").config();

const express = require("express");
const morgan  = require("morgan");

const connectDB      = require("./config/db");
const { generalLimiter, createLimiter } = require("./middlewares/rateLimiter");
const validateUrl    = require("./middlewares/validateUrl");
const errorHandler   = require("./middlewares/errorHandler");
const { createShortUrl, redirectUrl, updateUrl } = require("./controllers/urlController");

// ── Initialise Express ────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(express.json());                       // Parse JSON request bodies
app.use(morgan("dev"));                        // HTTP request logger
app.use(generalLimiter);                       // Apply global rate limiting

// ── Health Check ──────────────────────────────────────────────────────────────
/**
 * GET /health
 * Simple liveness probe – useful for monitoring / load balancers.
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "URL Shortener Service is running 🚀",
    timestamp: new Date().toISOString(),
  });
});

// ── URL Routes ────────────────────────────────────────────────────────────────

/**
 * POST /shortURL
 * Create a new short URL.
 * Middlewares: createLimiter (tighter rate-limit) → validateUrl → createShortUrl
 */
app.post("/shortURL", createLimiter, validateUrl, createShortUrl);

/**
 * GET /:shortID
 * Resolve a short ID and redirect to the original URL.
 */
app.get("/:shortID", redirectUrl);

/**
 * PATCH /:shortID
 * Update the longUrl or accessCount of an existing short URL.
 * Middlewares: validateUrl is applied conditionally (only when longUrl is present in body)
 */
app.patch("/:shortID", (req, res, next) => {
  // If the client is updating longUrl, run the validator first
  if (req.body.longUrl !== undefined) {
    return validateUrl(req, res, next);
  }
  next();
}, updateUrl);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Centralised Error Handler ─────────────────────────────────────────────────
// Must be registered AFTER all routes
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 URL Shortener running at http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`   Base URL    : ${process.env.BASE_URL}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
