import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
  };
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("API Error:", error);

  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  // Zod validation errors
  if (error instanceof z.ZodError) {
    const apiError: ApiError = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })),
        timestamp,
        path,
      },
    };
    res.status(400).json(apiError);
    return;
  }

  // Auth errors
  if (error.message.includes('User already exists')) {
    const apiError: ApiError = {
      success: false,
      error: {
        code: "USER_EXISTS",
        message: "User already exists with this email",
        timestamp,
        path,
      },
    };
    res.status(409).json(apiError);
    return;
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    const apiError: ApiError = {
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid authentication token",
        timestamp,
        path,
      },
    };
    res.status(401).json(apiError);
    return;
  }

  if (error.name === "TokenExpiredError") {
    const apiError: ApiError = {
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Authentication token has expired",
        timestamp,
        path,
      },
    };
    res.status(401).json(apiError);
    return;
  }

  // Database errors (Prisma)
  if (error.constructor.name === "PrismaClientKnownRequestError") {
    const prismaError = error as any;

    if (prismaError.code === "P2002") {
      const apiError: ApiError = {
        success: false,
        error: {
          code: "DUPLICATE_RESOURCE",
          message: "Resource already exists",
          details: prismaError.meta,
          timestamp,
          path,
        },
      };
      res.status(409).json(apiError);
      return;
    }

    if (prismaError.code === "P2025") {
      const apiError: ApiError = {
        success: false,
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "Resource not found",
          timestamp,
          path,
        },
      };
      res.status(404).json(apiError);
      return;
    }
  }

  // Business logic errors (from services)
  if (error.message.includes("User not found")) {
    const apiError: ApiError = {
      success: false,
      error: {
        code: "USER_NOT_FOUND",
        message: "User not found",
        timestamp,
        path,
      },
    };
    res.status(404).json(apiError);
    return;
  }

  if (error.message.includes("Invalid credentials")) {
    const apiError: ApiError = {
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
        timestamp,
        path,
      },
    };
    res.status(401).json(apiError);
    return;
  }

  // Unauthorized access
  if (error.message.includes('Unauthorized')) {
    const apiError: ApiError = {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Access denied. Please login.",
        timestamp,
        path,
      },
    };
    res.status(401).json(apiError);
    return;
  }

  // Default server error
  const apiError: ApiError = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An internal server error occurred"
          : error.message,
      details: process.env.NODE_ENV === "production" ? undefined : error.stack,
      timestamp,
      path,
    },
  };

  res.status(500).json(apiError);
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const apiError: ApiError = {
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  };

  res.status(404).json(apiError);
};
