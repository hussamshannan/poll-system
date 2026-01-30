const rateLimit = require("express-rate-limit");

// Rate limiter for voting endpoint
const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 votes per windowMs
  message: {
    success: false,
    message:
      "Too many voting attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin endpoints rate limiter
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

module.exports = { voteLimiter, adminLimiter };
