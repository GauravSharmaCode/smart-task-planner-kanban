"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
describe('Prisma Connection', () => {
    let prisma;
    beforeAll(() => {
        prisma = new client_1.PrismaClient();
    });
    afterAll(async () => {
        await prisma.$disconnect();
    });
    it('should connect to database successfully', async () => {
        await expect(prisma.$connect()).resolves.not.toThrow();
    });
    it('should execute a simple query', async () => {
        const result = await prisma.$queryRaw `SELECT 1 as test`;
        expect(result).toBeDefined();
    });
    it('should disconnect cleanly', async () => {
        await expect(prisma.$disconnect()).resolves.not.toThrow();
    });
});
