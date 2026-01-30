const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const voteRoutes = require("./routes/votes");
const { sanitizeInput, apiLimiter } = require("./middleware/security");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security: Trust proxy for rate limiting behind reverse proxies (Vercel, etc.)
app.set("trust proxy", 1);

// Helper function to normalize URLs (remove trailing slashes)
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.replace(/\/$/, ""); // Remove trailing slash
};

// Get allowed origins from environment
const getAllowedOrigins = () => {
  const origins = [
    normalizeOrigin(process.env.FRONTEND_URL),
    "http://localhost:3000",
    "http://localhost:5173",
    "https://cbosra-poll.vercel.app", // Production frontend
  ].filter(Boolean); // Remove null/undefined values

  return origins;
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();

    // Security: Only allow requests with no origin in development
    if (!origin && process.env.NODE_ENV === "development") {
      return callback(null, true);
    }

    // Normalize the origin
    const normalizedOrigin = normalizeOrigin(origin);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // Cache preflight requests for 24 hours
};

// Apply CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Security: Limit request body size to prevent DoS
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Security: Add security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Prevent referrer leakage
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
  );

  // Remove server header
  res.removeHeader("X-Powered-By");

  next();
});

// Security: Sanitize all inputs
app.use(sanitizeInput);

// Security: Apply general rate limiting to all API routes
app.use("/api", apiLimiter);

// Basic route for health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    cors: "enabled",
    allowed_origins: [
      "https://nh66r0df-5173.inc1.devtunnels.ms",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
  });
});

// API routes
app.use("/api", voteRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Allowed CORS origins:`);
  console.log(`- https://nh66r0df-5173.inc1.devtunnels.ms`);
  console.log(`- http://localhost:3000`);
  console.log(`- http://localhost:5173`);
});
