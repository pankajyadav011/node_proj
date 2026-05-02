/**
 * controllers/urlController.js
 * Business logic for all URL-related endpoints.
 *
 * Exports:
 *  - createShortUrl  →  POST /shortURL
 *  - redirectUrl     →  GET  /:shortID
 *  - updateUrl       →  PATCH /:shortID
 */

const { nanoid } = require("nanoid");
const Url = require("../models/Url");

/* ─────────────────────────────────────────────────────────────
   POST /shortURL
   Creates a new shortened URL or returns the existing one
   if the same longUrl has already been shortened before.
───────────────────────────────────────────────────────────── */

/**
 * createShortUrl
 * 1. Check whether the longUrl already exists in the DB (duplicate prevention).
 * 2. If yes  → return the existing short URL (idempotent behaviour).
 * 3. If no   → generate a unique shortID with nanoid, save, and return.
 *
 * @route  POST /shortURL
 * @access Public
 */
const createShortUrl = async (req, res, next) => {
  try {
    const { longUrl } = req.body;

    // ── Duplicate check ───────────────────────────────────────
    // If this longUrl has been shortened before, return the existing record
    const existingUrl = await Url.findOne({ longUrl });
    if (existingUrl) {
      return res.status(200).json({
        success: true,
        message: "Short URL already exists for this long URL.",
        shortUrl: `${process.env.BASE_URL}/${existingUrl.shortID}`,
        data: existingUrl,
      });
    }

    // ── Generate unique shortID ───────────────────────────────
    // nanoid(8) generates a URL-safe, 8-character unique ID
    const shortID = nanoid(8);

    // ── Persist to database ───────────────────────────────────
    const newUrl = await Url.create({
      shortID,
      longUrl,
    });

    // ── Respond ───────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      message: "Short URL created successfully.",
      shortUrl: `${process.env.BASE_URL}/${newUrl.shortID}`,
      data: newUrl,
    });
  } catch (error) {
    // Forward to the centralised error handler in middlewares/errorHandler.js
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /:shortID
   Resolves the shortID and redirects to the original URL.
   Also increments the accessCount for analytics.
───────────────────────────────────────────────────────────── */

/**
 * redirectUrl
 * 1. Look up the document by shortID.
 * 2. If not found → 404.
 * 3. Increment accessCount atomically using findOneAndUpdate.
 * 4. Redirect (302) to longUrl.
 *
 * @route  GET /:shortID
 * @access Public
 */
const redirectUrl = async (req, res, next) => {
  try {
    const { shortID } = req.params;

    // ── Lookup & atomic increment ─────────────────────────────
    // Use findOneAndUpdate so the read + write is a single DB round-trip
    const urlDoc = await Url.findOneAndUpdate(
      { shortID },
      { $inc: { accessCount: 1 } }, // atomically increment by 1
      { new: true }                  // return the updated document
    );

    // ── Not found ─────────────────────────────────────────────
    if (!urlDoc) {
      return res.status(404).json({
        success: false,
        message: `No URL found for shortID: "${shortID}".`,
      });
    }

    // ── Redirect ──────────────────────────────────────────────
    // 302 Found – temporary redirect (default for res.redirect)
    return res.redirect(urlDoc.longUrl);
  } catch (error) {
    next(error);
  }
};

/* ─────────────────────────────────────────────────────────────
   PATCH /:shortID
   Partially updates a URL document.
   Allows updating longUrl and/or accessCount.
───────────────────────────────────────────────────────────── */

/**
 * updateUrl
 * 1. Build an update object from only the fields provided in req.body.
 * 2. If longUrl is being changed, validate it (done by validateUrl middleware
 *    when longUrl is present in the body – see routes).
 * 3. Return the updated document.
 *
 * @route  PATCH /:shortID
 * @access Public
 */
const updateUrl = async (req, res, next) => {
  try {
    const { shortID } = req.params;
    const { longUrl, accessCount } = req.body;

    // ── Build partial update payload ──────────────────────────
    // Only include fields that were explicitly sent in the request body
    const updateFields = {};
    if (longUrl !== undefined)      updateFields.longUrl = longUrl;
    if (accessCount !== undefined)  updateFields.accessCount = accessCount;

    // ── Guard: at least one field required ────────────────────
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update: longUrl or accessCount.",
      });
    }

    // ── Perform update ────────────────────────────────────────
    const updatedUrl = await Url.findOneAndUpdate(
      { shortID },
      { $set: updateFields },
      {
        new: true,          // return the updated document
        runValidators: true // run schema validators on the updated fields
      }
    );

    // ── Not found ─────────────────────────────────────────────
    if (!updatedUrl) {
      return res.status(404).json({
        success: false,
        message: `No URL found for shortID: "${shortID}".`,
      });
    }

    // ── Respond ───────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "URL updated successfully.",
      data: updatedUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createShortUrl, redirectUrl, updateUrl };
