const rateLimit = require("express-rate-limit");

/**
 * Security middleware for input sanitization and validation
 */

/**
 * Sanitize MongoDB queries to prevent NoSQL injection
 * Removes $ and . from object keys recursively
 */
const sanitizeQuery = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeQuery(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Remove $ and . from keys to prevent NoSQL injection
      const sanitizedKey = key.replace(/[\$\.]/g, "");
      sanitized[sanitizedKey] = sanitizeQuery(obj[key]);
    }
  }
  return sanitized;
};

/**
 * Middleware to sanitize request body, query, and params
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeQuery(req.body);
  }
  if (req.query) {
    req.query = sanitizeQuery(req.query);
  }
  if (req.params) {
    req.params = sanitizeQuery(req.params);
  }
  next();
};

/**
 * Validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  // Security: Limit maximum page size to prevent DoS
  const MAX_LIMIT = 100;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: "Page must be greater than 0",
    });
  }

  if (limit < 1 || limit > MAX_LIMIT) {
    return res.status(400).json({
      success: false,
      message: `Limit must be between 1 and ${MAX_LIMIT}`,
    });
  }

  req.query.page = page;
  req.query.limit = limit;

  next();
};

/**
 * Validate search query length
 */
const validateSearch = (req, res, next) => {
  if (req.query.search && typeof req.query.search === "string") {
    // Security: Limit search query length to prevent DoS
    const MAX_SEARCH_LENGTH = 100;

    if (req.query.search.length > MAX_SEARCH_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Search query must not exceed ${MAX_SEARCH_LENGTH} characters`,
      });
    }

    // Remove potentially harmful regex characters
    req.query.search = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  next();
};

/**
 * Rate limiter for voting endpoint
 */
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

/**
 * Rate limiter for admin/read endpoints
 */
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for PDF export
 */
const pdfLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 PDFs per hour
  message: {
    success: false,
    message: "Too many PDF export requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: "Too many requests, please slow down",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  sanitizeInput,
  validatePagination,
  validateSearch,
  voteLimiter,
  adminLimiter,
  pdfLimiter,
  apiLimiter,
};
