import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware.js";
import {
  requestLogger,
  errorLogger,
  authLogger,
} from "./middleware/logging.middleware.js";
import { authenticate } from "./middleware/auth.middleware.js";

import { getConfig, type ApiConfig } from "./config/index.js";
import { authRoutes } from "./modules/auth/auth.routes.js";

const createApp = (config?: ApiConfig) => {
  const appConfig = config || getConfig();
  const app = express();

  // Request logging (should be first to capture all requests)
  app.use(requestLogger);

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: appConfig.security.corsOrigins,
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: appConfig.security.rateLimiting.windowMs,
    max: appConfig.security.rateLimiting.maxRequests,
    message: {
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests from this IP, please try again later.",
      },
    },
  });
  app.use("/api/", limiter);

  // Auth rate limiting (stricter)
  const authLimiter = rateLimit({
    windowMs: appConfig.security.rateLimiting.windowMs,
    max: appConfig.security.rateLimiting.authMaxRequests,
    message: {
      success: false,
      error: {
        code: "AUTH_RATE_LIMIT_EXCEEDED",
        message: "Too many authentication attempts, please try again later.",
      },
    },
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // Compression and parsing middleware
  app.use(compression());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Authentication logging (adds user context to logger after auth)
  app.use("/api/auth/*", authLogger);
  app.use("/api/users/*", authenticate, authLogger);

  // API Routes
  app.use('/api/auth', authRoutes);
  
  // Protected routes example
  app.get('/api/tasks', authenticate, (req, res) => {
    res.json({ success: true, data: [], message: 'Tasks endpoint working' });
  });

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "user-api",
        version: process.env.npm_package_version || "1.0.0",
        environment: appConfig.server.env,
      },
    });
  });

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "ENDPOINT_NOT_FOUND",
        message: `Cannot ${req.method} ${req.originalUrl}`,
      },
    });
  });

  // Error logging middleware (before error handler)
  app.use(errorLogger);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

// Default app instance for backwards compatibility
const app = createApp();

export default app;
export { createApp };
