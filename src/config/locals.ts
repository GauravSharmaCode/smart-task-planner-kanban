import type { ApiConfig } from "./index.js";

/**
 * Local development configuration
 * This file is used only for local development and testing
 * In production, configuration should be provided externally
 */
export const localDevConfig: Partial<ApiConfig> = {
  server: {
    port: 3001,
    host: "localhost",
    env: "development",
  },

  security: {
    corsOrigins: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    jwtSecret: "local-development-secret-do-not-use-in-production",
    jwtExpiresIn: "30m", // Longer for development convenience
    jwtRefreshExpiresIn: "30d",
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000, // More lenient for development
      authMaxRequests: 50,
    },
  },

  logging: {
    level: "debug",
    format: "simple",
  },

  integrations: {
    metrics: {
      enabled: false, // Disable metrics collection for local dev
    },
    tracing: {
      enabled: false, // Disable tracing for local dev
      serviceName: "user-api-local",
    },
  },
};

/**
 * Test configuration
 * Used during testing
 */
export const testConfig: Partial<ApiConfig> = {
  server: {
    port: 0, // Let OS assign port for testing
    host: "localhost",
    env: "test",
  },

  security: {
    corsOrigins: ["http://localhost"],
    jwtSecret: "test-secret",
    jwtExpiresIn: "1h",
    jwtRefreshExpiresIn: "1d",
    rateLimiting: {
      windowMs: 60 * 1000, // 1 minute for faster tests
      maxRequests: 1000,
      authMaxRequests: 100,
    },
  },

  logging: {
    level: "error", // Minimal logging during tests
    format: "json",
  },

  integrations: {
    metrics: {
      enabled: false,
    },
    tracing: {
      enabled: false,
      serviceName: "user-api-test",
    },
  },
};

/**
 * Load configuration based on NODE_ENV
 */
export const getEnvironmentConfig = (): Partial<ApiConfig> => {
  switch (process.env.NODE_ENV) {
    case "test":
      return testConfig;
    case "development":
    default:
      return localDevConfig;
  }
};
