"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_mem_1 = require("pg-mem");
const redis_memory_server_1 = require("redis-memory-server");
// Global test setup
let redisServer;
beforeAll(async () => {
    // Setup in-memory Redis
    redisServer = new redis_memory_server_1.RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();
    process.env.REDIS_URL = `redis://${host}:${port}`;
});
afterAll(async () => {
    // Cleanup Redis
    if (redisServer) {
        await redisServer.stop();
    }
});
beforeEach(() => {
    // Setup in-memory PostgreSQL for each test
    const db = (0, pg_mem_1.newDb)();
    global.testDb = db;
});
afterEach(() => {
    // Reset test database
    global.testDb = undefined;
});
