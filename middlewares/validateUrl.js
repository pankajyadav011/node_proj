/**
 * middlewares/validateUrl.js
 * Middleware helper that validates whether a given string
 * is a properly formatted HTTP or HTTPS URL.
 * Uses the `valid-url` package for RFC-3986 compliance.
 */

const validUrl = require("valid-url");

/**
 * validateUrl
 * Express middleware that checks req.body.longUrl.
 * If invalid, it short-circuits the request with a 400 response.
 * If valid, it calls next() to continue to the controller.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const validateUrl = (req, res, next) => {
  const { longUrl } = req.body;

  // Ensure the field was actually sent in the request body
  if (!longUrl) {
    return res.status(400).json({
      success: false,
      message: "longUrl is required in the request body.",
    });
  }

  // valid-url.isWebUri returns the URI string if valid, undefined if not
  if (!validUrl.isWebUri(longUrl)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid URL format. Please provide a valid HTTP or HTTPS URL (e.g. https://example.com).",
    });
  }

  // URL is valid – pass control to the next handler
  next();
};

module.exports = validateUrl;
