"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeConfig = exports.getConfig = exports.ConfigLoader = exports.defaultConfig = void 0;
/**
 * Default configuration for local development
 * This can be overridden by external configuration providers
 */
exports.defaultConfig = {
    server: {
        port: 3001,
        host: "0.0.0.0",
        env: "development",
    },
    security: {
        corsOrigins: ["http://localhost:3000", "http://localhost:3001"],
        jwtSecret: "dev-jwt-secret-change-in-production",
        jwtExpiresIn: "15m",
        jwtRefreshExpiresIn: "7d",
        rateLimiting: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            maxRequests: 100,
            authMaxRequests: 5,
        },
    },
    services: {
        userCoreConfig: {
        // Pass any configuration needed by user-core
        },
    },
    logging: {
        level: "info",
        format: "simple",
    },
    integrations: {
        metrics: {
            enabled: false,
        },
        tracing: {
            enabled: false,
            serviceName: "user-api",
        },
    },
};
/**
 * Environment-based configuration loader
 * This reads from environment variables as a fallback
 * but allows external configuration to override everything
 */
class ConfigLoader {
    constructor(externalConfig) {
        this.config = this.mergeConfigs(exports.defaultConfig, externalConfig);
    }
    static getInstance(externalConfig) {
        if (!ConfigLoader.instance) {
            ConfigLoader.instance = new ConfigLoader(externalConfig);
        }
        return ConfigLoader.instance;
    }
    static reset() {
        ConfigLoader.instance = null;
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(updates) {
        this.config = this.mergeConfigs(this.config, updates);
    }
    mergeConfigs(base, override) {
        if (!override) {
            return this.loadFromEnvironment(base);
        }
        const merged = {
            server: { ...base.server, ...override.server },
            security: {
                ...base.security,
                ...override.security,
                rateLimiting: {
                    ...base.security.rateLimiting,
                    ...override.security?.rateLimiting,
                },
            },
            services: { ...base.services, ...override.services },
            logging: { ...base.logging, ...override.logging },
            integrations: {
                metrics: {
                    enabled: override.integrations?.metrics?.enabled ??
                        base.integrations.metrics.enabled,
                    ...(override.integrations?.metrics?.endpoint && {
                        endpoint: override.integrations.metrics.endpoint,
                    }),
                },
                tracing: {
                    enabled: override.integrations?.tracing?.enabled ??
                        base.integrations.tracing.enabled,
                    serviceName: override.integrations?.tracing?.serviceName ??
                        base.integrations.tracing.serviceName,
                },
            },
        };
        return this.loadFromEnvironment(merged);
    }
    loadFromEnvironment(config) {
        return {
            server: {
                port: parseInt(process.env.API_PORT || String(config.server.port)),
                host: process.env.API_HOST || config.server.host || "0.0.0.0",
                env: process.env.NODE_ENV ||
                    config.server.env,
            },
            security: {
                corsOrigins: process.env.CORS_ORIGINS
                    ? process.env.CORS_ORIGINS.split(",")
                    : config.security.corsOrigins,
                jwtSecret: process.env.JWT_SECRET || config.security.jwtSecret,
                jwtExpiresIn: process.env.JWT_EXPIRES_IN || config.security.jwtExpiresIn,
                jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ||
                    config.security.jwtRefreshExpiresIn,
                rateLimiting: {
                    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ||
                        String(config.security.rateLimiting.windowMs)),
                    maxRequests: parseInt(process.env.RATE_LIMIT_MAX ||
                        String(config.security.rateLimiting.maxRequests)),
                    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX ||
                        String(config.security.rateLimiting.authMaxRequests)),
                },
            },
            services: config.services,
            logging: {
                level: process.env.LOG_LEVEL ||
                    config.logging.level,
                format: process.env.LOG_FORMAT ||
                    config.logging.format,
            },
            integrations: config.integrations,
        };
    }
}
exports.ConfigLoader = ConfigLoader;
/**
 * Utility function to get current configuration
 */
const getConfig = () => {
    return ConfigLoader.getInstance().getConfig();
};
exports.getConfig = getConfig;
/**
 * Utility function to initialize configuration
 * This should be called once at service startup
 */
const initializeConfig = (externalConfig) => {
    ConfigLoader.reset();
    return ConfigLoader.getInstance(externalConfig).getConfig();
};
exports.initializeConfig = initializeConfig;
