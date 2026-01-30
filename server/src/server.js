const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const voteRoutes = require("./routes/votes");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Helper function to normalize URLs (remove trailing slashes)
const normalizeOrigin = (origin) => {
  if (!origin) return origin;
  return origin.replace(/\/$/, ""); // Remove trailing slash
};

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Normalize the origin
    const normalizedOrigin = normalizeOrigin(origin);
    const allowedOrigins = [
      normalizeOrigin(process.env.FRONTEND_URL) || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:5173",
      "https://nh66r0df-5173.inc1.devtunnels.ms",
    ];

    // Check if origin is in allowed list
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.log(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Enable pre-flight for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers manually as fallback
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://nh66r0df-5173.inc1.devtunnels.ms",
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

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
