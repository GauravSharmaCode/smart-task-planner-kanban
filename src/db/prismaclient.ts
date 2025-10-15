import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client instance
 * This ensures we don't create multiple connections to the database
 */
class Database {
  private static instance: PrismaClient | null = null;

  /**
   * Get the Prisma client instance
   */
  static getInstance(): PrismaClient {
    if (!this.instance) {
      try {
        this.instance = new PrismaClient({
          log:
            process.env.NODE_ENV === "development"
              ? ["query", "info", "warn", "error"]
              : ["error"],
        });
      } catch (error) {
        console.error("Failed to initialize Prisma client:", error);
        throw new Error(
          "Prisma client initialization failed. Please ensure the database is properly configured and Prisma client is generated."
        );
      }
    }
    return this.instance;
  }

  /**
   * Disconnect from the database
   */
  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect();
      this.instance = null;
    }
  }

  /**
   * Connect to the database and run migrations if needed
   */
  static async connect(): Promise<void> {
    const client = this.getInstance();
    try {
      await client.$connect();
      console.log("✅ Connected to database");
    } catch (error) {
      console.error("❌ Failed to connect to database:", error);
      throw error;
    }
  }

  /**
   * Check database connection health
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const client = this.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("Database health check failed:", error);
      return false;
    }
  }
}

// Export a function to get the database instance (lazy initialization)
export const getDatabase = () => Database.getInstance();

// Export the Database class for manual connection management
export { Database };
