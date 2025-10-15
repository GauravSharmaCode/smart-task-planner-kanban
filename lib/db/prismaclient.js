"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = exports.getDatabase = void 0;
const client_1 = require("@prisma/client");
/**
 * Singleton Prisma client instance
 * This ensures we don't create multiple connections to the database
 */
class Database {
    /**
     * Get the Prisma client instance
     */
    static getInstance() {
        if (!this.instance) {
            try {
                this.instance = new client_1.PrismaClient({
                    log: process.env.NODE_ENV === "development"
                        ? ["query", "info", "warn", "error"]
                        : ["error"],
                });
            }
            catch (error) {
                console.error("Failed to initialize Prisma client:", error);
                throw new Error("Prisma client initialization failed. Please ensure the database is properly configured and Prisma client is generated.");
            }
        }
        return this.instance;
    }
    /**
     * Disconnect from the database
     */
    static async disconnect() {
        if (this.instance) {
            await this.instance.$disconnect();
            this.instance = null;
        }
    }
    /**
     * Connect to the database and run migrations if needed
     */
    static async connect() {
        const client = this.getInstance();
        try {
            await client.$connect();
            console.log("✅ Connected to database");
        }
        catch (error) {
            console.error("❌ Failed to connect to database:", error);
            throw error;
        }
    }
    /**
     * Check database connection health
     */
    static async healthCheck() {
        try {
            const client = this.getInstance();
            await client.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error("Database health check failed:", error);
            return false;
        }
    }
}
exports.Database = Database;
Database.instance = null;
// Export a function to get the database instance (lazy initialization)
const getDatabase = () => Database.getInstance();
exports.getDatabase = getDatabase;
