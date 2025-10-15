"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTestDb = setupTestDb;
function setupTestDb() {
    const db = global.testDb;
    // Create test tables
    db.public.none(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'basic'
    );
    
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'todo',
      user_id INTEGER REFERENCES users(id)
    );
  `);
    return db;
}
