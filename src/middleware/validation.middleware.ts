import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validation middleware for Express routes
 */

export interface ValidationError {
  success: false;
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    errors: Array<{
      field: string;
      message: string;
    }>;
  };
}

/**
 * Middleware to validate request body against a Zod schema
 */
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            errors: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          }
        };
        res.status(400).json(validationError);
        return;
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate query parameters against a Zod schema
 */
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            errors: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          }
        };
        res.status(400).json(validationError);
        return;
      }
      next(error);
    }
  };
};

/**
 * Middleware to validate route parameters against a Zod schema
 */
export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData as any;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            errors: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          }
        };
        res.status(400).json(validationError);
        return;
      }
      next(error);
    }
  };
};

/**
 * Combined validation middleware for body, query, and params
 */
export const validate = <TBody = any, TQuery = any, TParams = any>(options: {
  body?: z.ZodSchema<TBody>;
  query?: z.ZodSchema<TQuery>;
  params?: z.ZodSchema<TParams>;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate body if schema provided
      if (options.body) {
        const validatedBody = options.body.parse(req.body);
        req.body = validatedBody;
      }

      // Validate query if schema provided
      if (options.query) {
        const validatedQuery = options.query.parse(req.query);
        req.query = validatedQuery as any;
      }

      // Validate params if schema provided
      if (options.params) {
        const validatedParams = options.params.parse(req.params);
        req.params = validatedParams as any;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError: ValidationError = {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            errors: error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            }))
          }
        };
        res.status(400).json(validationError);
        return;
      }
      next(error);
    }
  };
};