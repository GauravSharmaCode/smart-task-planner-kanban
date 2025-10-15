import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Utility functions for JWT token management
 */
export class JwtUtils {
  private static readonly ACCESS_TOKEN_EXPIRY = "15m";
  private static readonly REFRESH_TOKEN_EXPIRY = "7d";

  /**
   * Generate access and refresh token pair
   */
  static generateTokenPair(payload: Omit<JwtPayload, "sessionId">): TokenPair {
    const sessionId = nanoid();
    const jwtPayload: JwtPayload = { ...payload, sessionId };

    const accessToken = jwt.sign(jwtPayload, this.getAccessTokenSecret(), {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = jwt.sign(
      { sessionId, userId: payload.userId },
      this.getRefreshTokenSecret(),
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.getAccessTokenSecret()) as JwtPayload;
  }

  /**
   * Verify and decode refresh token
   */
  static verifyRefreshToken(token: string): {
    sessionId: string;
    userId: string;
  } {
    return jwt.verify(token, this.getRefreshTokenSecret()) as {
      sessionId: string;
      userId: string;
    };
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Generate a secure random token for password reset, email verification, etc.
   */
  static generateSecureToken(): string {
    return nanoid(32);
  }

  private static getAccessTokenSecret(): string {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET environment variable is required");
    }
    return secret;
  }

  private static getRefreshTokenSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET environment variable is required");
    }
    return secret;
  }
}
