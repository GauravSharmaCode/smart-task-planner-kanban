"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logServiceShutdown = exports.logServiceStart = exports.authLogger = exports.errorLogger = exports.requestLogger = void 0;
const neat_logger_1 = require("@gauravsharmacode/neat-logger");
/**
 * Request logging middleware using neat-logger
 * Creates a child logger for each request with request context
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    req.startTime = startTime;
    // Create a child logger with request context
    const requestId = generateRequestId();
    req.logger = neat_logger_1.logger.child({
        requestId,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
    });
    // Log incoming request
    req.logger.info("Incoming request", {
        method: req.method,
        url: req.url,
        query: req.query,
        headers: sanitizeHeaders(req.headers),
        timestamp: new Date().toISOString(),
    });
    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (body) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        // Log response completion
        req.logger.info("Request completed", {
            method: req.method,
            url: req.url,
            statusCode,
            duration: `${duration}ms`,
            contentLength: res.get("Content-Length")
                ? `${res.get("Content-Length")}bytes`
                : "unknown",
        });
        // Log response body for debugging (only in development and for certain status codes)
        if (process.env.NODE_ENV === "development" || req.query.debug === "true") {
            if (statusCode >= 400 || req.url.includes("/health")) {
                req.logger.debug("Response body", {
                    method: req.method,
                    url: req.url,
                    statusCode,
                    body: body,
                });
            }
        }
        // Log errors with more detail
        if (statusCode >= 400) {
            const logLevel = statusCode >= 500 ? "error" : "warn";
            req.logger[logLevel]("Request failed", {
                method: req.method,
                url: req.url,
                statusCode,
                duration: `${duration}ms`,
                errorBody: body,
            });
        }
        return originalJson.call(this, body);
    };
    // Override res.send to capture non-JSON responses
    const originalSend = res.send;
    res.send = function (body) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        if (!res.headersSent) {
            req.logger.info("Request completed (non-JSON)", {
                method: req.method,
                url: req.url,
                statusCode,
                duration: `${duration}ms`,
                contentType: res.get("Content-Type"),
            });
        }
        return originalSend.call(this, body);
    };
    next();
};
exports.requestLogger = requestLogger;
/**
 * Error logging middleware
 * Logs uncaught errors with full context
 */
const errorLogger = (err, req, res, next) => {
    const requestLogger = req.logger ||
        neat_logger_1.logger.child({
            method: req.method,
            url: req.url,
            ip: req.ip,
        });
    // Log the error with full context
    requestLogger.error("Unhandled request error", {
        error: {
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: err.code || "UNKNOWN_ERROR",
        },
        request: {
            method: req.method,
            url: req.url,
            query: req.query,
            body: sanitizeRequestBody(req.body),
            headers: sanitizeHeaders(req.headers),
        },
        timestamp: new Date().toISOString(),
    });
    next(err);
};
exports.errorLogger = errorLogger;
/**
 * Authentication logging middleware
 * Adds user context to logger when user is authenticated
 */
const authLogger = (req, res, next) => {
    if (req.user && req.logger) {
        // Create a new child logger with user context
        req.logger = req.logger.child({
            userId: req.user.userId,
            userEmail: req.user.email || 'unknown',
            userRole: req.user.role || 'unknown',
        });
        req.logger.debug("Authenticated request", {
            userId: req.user.userId,
            userRole: req.user.role || 'unknown',
        });
    }
    next();
};
exports.authLogger = authLogger;
/**
 * Generate a unique request ID
 */
function generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Sanitize headers for logging (remove sensitive information)
 */
function sanitizeHeaders(headers) {
    const sanitized = { ...headers };
    const sensitiveHeaders = [
        "authorization",
        "cookie",
        "x-api-key",
        "x-auth-token",
    ];
    sensitiveHeaders.forEach((header) => {
        if (sanitized[header]) {
            sanitized[header] = "[REDACTED]";
        }
    });
    return sanitized;
}
/**
 * Sanitize request body for logging (remove sensitive information)
 */
function sanitizeRequestBody(body) {
    if (!body || typeof body !== "object") {
        return body;
    }
    const sanitized = { ...body };
    const sensitiveFields = [
        "password",
        "currentPassword",
        "newPassword",
        "token",
        "refreshToken",
    ];
    sensitiveFields.forEach((field) => {
        if (sanitized[field]) {
            sanitized[field] = "[REDACTED]";
        }
    });
    return sanitized;
}
/**
 * Service startup logger
 */
const logServiceStart = (config) => {
    neat_logger_1.logger.info("User API service starting", {
        service: "user-api",
        version: process.env.npm_package_version || "1.0.0",
        environment: config.server.env,
        port: config.server.port,
        host: config.server.host,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
    });
    // Log configuration (with sensitive data redacted)
    const sanitizedConfig = {
        ...config,
        security: {
            ...config.security,
            jwtSecret: "[REDACTED]",
        },
    };
    neat_logger_1.logger.debug("Service configuration", sanitizedConfig);
};
exports.logServiceStart = logServiceStart;
/**
 * Service shutdown logger
 */
const logServiceShutdown = (signal) => {
    neat_logger_1.logger.info("User API service shutting down", {
        service: "user-api",
        signal,
        timestamp: new Date().toISOString(),
    });
};
exports.logServiceShutdown = logServiceShutdown;
