

require("dotenv").config();

const express = require("express");
const morgan  = require("morgan");

const connectDB      = require("./config/db");
const { generalLimiter, createLimiter } = require("./middlewares/rateLimiter");
const validateUrl    = require("./middlewares/validateUrl");
const errorHandler   = require("./middlewares/errorHandler");
const { createShortUrl, redirectUrl, updateUrl } = require("./controllers/urlController");


const app  = express();
const PORT = process.env.PORT || 3000;


connectDB();

app.use(express.json());
app.use(morgan("dev"));
app.use(generalLimiter);


app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the URL Shortener API 🚀",
    docs: "/health to check status, POST /shortURL to create a link"
  });
});


app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "URL Shortener Service is running 🚀",
    timestamp: new Date().toISOString(),
  });
});


app.post("/shortURL", createLimiter, validateUrl, createShortUrl);


app.get("/:shortID", redirectUrl);


app.patch("/:shortID", (req, res, next) => {

  if (req.body.longUrl !== undefined) {
    return validateUrl(req, res, next);
  }
  next();
}, updateUrl);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`\n🚀 URL Shortener running at http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`   Base URL    : ${process.env.BASE_URL}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});
