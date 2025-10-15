"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const logging_middleware_js_1 = require("./middleware/logging.middleware.js");
const auth_middleware_js_1 = require("./middleware/auth.middleware.js");
const index_js_1 = require("./config/index.js");
const auth_routes_js_1 = require("./modules/auth/auth.routes.js");
const createApp = (config) => {
    const appConfig = config || (0, index_js_1.getConfig)();
    const app = (0, express_1.default)();
    // Request logging (should be first to capture all requests)
    app.use(logging_middleware_js_1.requestLogger);
    // Security middleware
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: appConfig.security.corsOrigins,
        credentials: true,
    }));
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
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
    const authLimiter = (0, express_rate_limit_1.default)({
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
    app.use((0, compression_1.default)());
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    // Authentication logging (adds user context to logger after auth)
    app.use("/api/auth/*", logging_middleware_js_1.authLogger);
    app.use("/api/users/*", auth_middleware_js_1.authenticate, logging_middleware_js_1.authLogger);
    // API Routes
    app.use('/api/auth', auth_routes_js_1.authRoutes);
    // Protected routes example
    app.get('/api/tasks', auth_middleware_js_1.authenticate, (req, res) => {
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
    app.use(logging_middleware_js_1.errorLogger);
    // Global error handler (must be last)
    app.use(error_middleware_js_1.errorHandler);
    return app;
};
exports.createApp = createApp;
// Default app instance for backwards compatibility
const app = createApp();
exports.default = app;
