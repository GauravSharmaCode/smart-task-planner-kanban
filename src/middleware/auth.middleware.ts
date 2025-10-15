import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Extend Express Request interface to include user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next(new Error('Unauthorized'));
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      ) as { userId: string };
      
      req.user = {
        userId: decoded.userId,
      };
      next();
    } catch (jwtError) {
      next(new Error('Unauthorized'));
      return;
    }
  } catch (error) {
    next(error);
  }
};