/**
 * Configuration interface for the User API service
 * This allows the service to be configured externally while providing sensible defaults
 */
export interface ApiConfig {
  // Server configuration
  server: {
    port: number;
    host: string;
    env: "development" | "staging" | "production" | "test";
  };

  // Security configuration
  security: {
    corsOrigins: string[];
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    rateLimiting: {
      windowMs: number;
      maxRequests: number;
      authMaxRequests: number;
    };
  };

  // Database/Core service configuration
  services: {
    userCoreConfig?: any; // Allow passing configuration to user-core
  };

  // Logging configuration
  logging: {
    level: "error" | "warn" | "info" | "debug";
    format: "json" | "simple";
  };

  // Optional external integrations
  integrations: {
    metrics: {
      enabled: boolean;
      endpoint?: string;
    };
    tracing: {
      enabled: boolean;
      serviceName: string;
    };
  };
}

/**
 * Default configuration for local development
 * This can be overridden by external configuration providers
 */
export const defaultConfig: ApiConfig = {
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
export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: ApiConfig;

  private constructor(externalConfig?: Partial<ApiConfig>) {
    this.config = this.mergeConfigs(defaultConfig, externalConfig);
  }

  public static getInstance(externalConfig?: Partial<ApiConfig>): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader(externalConfig);
    }
    return ConfigLoader.instance;
  }

  public static reset(): void {
    ConfigLoader.instance = null as any;
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<ApiConfig>): void {
    this.config = this.mergeConfigs(this.config, updates);
  }

  private mergeConfigs(
    base: ApiConfig,
    override?: Partial<ApiConfig>
  ): ApiConfig {
    if (!override) {
      return this.loadFromEnvironment(base);
    }

    const merged: ApiConfig = {
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
          enabled:
            override.integrations?.metrics?.enabled ??
            base.integrations.metrics.enabled,
          ...(override.integrations?.metrics?.endpoint && {
            endpoint: override.integrations.metrics.endpoint,
          }),
        },
        tracing: {
          enabled:
            override.integrations?.tracing?.enabled ??
            base.integrations.tracing.enabled,
          serviceName:
            override.integrations?.tracing?.serviceName ??
            base.integrations.tracing.serviceName,
        },
      },
    };

    return this.loadFromEnvironment(merged);
  }

  private loadFromEnvironment(config: ApiConfig): ApiConfig {
    return {
      server: {
        port: parseInt(process.env.API_PORT || String(config.server.port)),
        host: process.env.API_HOST || config.server.host || "0.0.0.0",
        env:
          (process.env.NODE_ENV as ApiConfig["server"]["env"]) ||
          config.server.env,
      },
      security: {
        corsOrigins: process.env.CORS_ORIGINS
          ? process.env.CORS_ORIGINS.split(",")
          : config.security.corsOrigins,
        jwtSecret: process.env.JWT_SECRET || config.security.jwtSecret,
        jwtExpiresIn:
          process.env.JWT_EXPIRES_IN || config.security.jwtExpiresIn,
        jwtRefreshExpiresIn:
          process.env.JWT_REFRESH_EXPIRES_IN ||
          config.security.jwtRefreshExpiresIn,
        rateLimiting: {
          windowMs: parseInt(
            process.env.RATE_LIMIT_WINDOW_MS ||
              String(config.security.rateLimiting.windowMs)
          ),
          maxRequests: parseInt(
            process.env.RATE_LIMIT_MAX ||
              String(config.security.rateLimiting.maxRequests)
          ),
          authMaxRequests: parseInt(
            process.env.AUTH_RATE_LIMIT_MAX ||
              String(config.security.rateLimiting.authMaxRequests)
          ),
        },
      },
      services: config.services,
      logging: {
        level:
          (process.env.LOG_LEVEL as ApiConfig["logging"]["level"]) ||
          config.logging.level,
        format:
          (process.env.LOG_FORMAT as ApiConfig["logging"]["format"]) ||
          config.logging.format,
      },
      integrations: config.integrations,
    };
  }
}

/**
 * Utility function to get current configuration
 */
export const getConfig = (): ApiConfig => {
  return ConfigLoader.getInstance().getConfig();
};

/**
 * Utility function to initialize configuration
 * This should be called once at service startup
 */
export const initializeConfig = (
  externalConfig?: Partial<ApiConfig>
): ApiConfig => {
  ConfigLoader.reset();
  return ConfigLoader.getInstance(externalConfig).getConfig();
};
