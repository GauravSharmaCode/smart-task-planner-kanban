"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nanoid_1 = require("nanoid");
/**
 * Utility functions for JWT token management
 */
class JwtUtils {
    /**
     * Generate access and refresh token pair
     */
    static generateTokenPair(payload) {
        const sessionId = (0, nanoid_1.nanoid)();
        const jwtPayload = { ...payload, sessionId };
        const accessToken = jsonwebtoken_1.default.sign(jwtPayload, this.getAccessTokenSecret(), {
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ sessionId, userId: payload.userId }, this.getRefreshTokenSecret(), { expiresIn: this.REFRESH_TOKEN_EXPIRY });
        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60, // 15 minutes in seconds
        };
    }
    /**
     * Verify and decode access token
     */
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, this.getAccessTokenSecret());
    }
    /**
     * Verify and decode refresh token
     */
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.getRefreshTokenSecret());
    }
    /**
     * Extract token from Authorization header
     */
    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.substring(7);
    }
    /**
     * Generate a secure random token for password reset, email verification, etc.
     */
    static generateSecureToken() {
        return (0, nanoid_1.nanoid)(32);
    }
    static getAccessTokenSecret() {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new Error("JWT_ACCESS_SECRET environment variable is required");
        }
        return secret;
    }
    static getRefreshTokenSecret() {
        const secret = process.env.JWT_REFRESH_SECRET;
        if (!secret) {
            throw new Error("JWT_REFRESH_SECRET environment variable is required");
        }
        return secret;
    }
}
exports.JwtUtils = JwtUtils;
JwtUtils.ACCESS_TOKEN_EXPIRY = "15m";
JwtUtils.REFRESH_TOKEN_EXPIRY = "7d";
