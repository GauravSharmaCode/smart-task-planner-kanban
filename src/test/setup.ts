import { newDb } from 'pg-mem';
import { RedisMemoryServer } from 'redis-memory-server';

// Global test setup
let redisServer: RedisMemoryServer;

beforeAll(async () => {
  // Setup in-memory Redis
  redisServer = new RedisMemoryServer();
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
  const db = newDb();
  global.testDb = db;
});

afterEach(() => {
  // Reset test database
  global.testDb = undefined;
});