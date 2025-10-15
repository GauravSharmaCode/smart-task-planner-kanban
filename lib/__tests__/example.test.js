"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_helper_1 = require("../test/db-helper");
describe('Jest Environment Setup', () => {
    it('should connect to in-memory PostgreSQL', () => {
        const db = (0, db_helper_1.setupTestDb)();
        expect(db).toBeDefined();
        // Test database query
        const result = db.public.one('SELECT 1 as test');
        expect(result.test).toBe(1);
    });
    it('should have Redis connection string available', () => {
        expect(process.env.REDIS_URL).toBeDefined();
        expect(process.env.REDIS_URL).toContain('redis://');
    });
});
