

const validUrl = require("valid-url");


const validateUrl = (req, res, next) => {
  const { longUrl } = req.body;


  if (!longUrl) {
    return res.status(400).json({
      success: false,
      message: "longUrl is required in the request body.",
    });
  }


  if (!validUrl.isWebUri(longUrl)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid URL format. Please provide a valid HTTP or HTTPS URL (e.g. https://example.com).",
    });
  }


  next();
};

module.exports = validateUrl;
