"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
/**
 * Middleware to validate request body against a Zod schema
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationError = {
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
exports.validateBody = validateBody;
/**
 * Middleware to validate query parameters against a Zod schema
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.query);
            req.query = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationError = {
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
exports.validateQuery = validateQuery;
/**
 * Middleware to validate route parameters against a Zod schema
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.params);
            req.params = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationError = {
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
exports.validateParams = validateParams;
/**
 * Combined validation middleware for body, query, and params
 */
const validate = (options) => {
    return (req, res, next) => {
        try {
            // Validate body if schema provided
            if (options.body) {
                const validatedBody = options.body.parse(req.body);
                req.body = validatedBody;
            }
            // Validate query if schema provided
            if (options.query) {
                const validatedQuery = options.query.parse(req.query);
                req.query = validatedQuery;
            }
            // Validate params if schema provided
            if (options.params) {
                const validatedParams = options.params.parse(req.params);
                req.params = validatedParams;
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const validationError = {
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
exports.validate = validate;
