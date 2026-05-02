/**
 * models/Url.js
 * Mongoose schema and model for URL documents.
 *
 * Fields:
 *  - shortID      : Unique identifier for the shortened URL
 *  - longUrl      : The original (destination) URL
 *  - accessCount  : Number of times the short URL has been visited
 *  - createdAt    : Timestamp of document creation (auto-managed by timestamps option)
 *  - updatedAt    : Timestamp of last update (auto-managed by timestamps option)
 */

const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    /**
     * shortID – unique slug used in the short URL path.
     * e.g. http://localhost:3000/abc123  →  shortID = "abc123"
     */
    shortID: {
      type: String,
      required: [true, "shortID is required"],
      unique: true,
      trim: true,
    },

    /**
     * longUrl – the full original URL the user wants to shorten.
     */
    longUrl: {
      type: String,
      required: [true, "longUrl is required"],
      trim: true,
    },

    /**
     * accessCount – incremented every time the short URL is visited (redirected).
     * Defaults to 0 on document creation.
     */
    accessCount: {
      type: Number,
      default: 0,
    },
  },
  {
    /**
     * timestamps: true automatically adds:
     *   createdAt – set once when the document is first saved
     *   updatedAt – updated every time the document is modified
     */
    timestamps: true,
  }
);

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
