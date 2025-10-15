import { PrismaClient } from '@prisma/client';

describe('Prisma Connection', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to database successfully', async () => {
    await expect(prisma.$connect()).resolves.not.toThrow();
  });

  it('should execute a simple query', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it('should disconnect cleanly', async () => {
    await expect(prisma.$disconnect()).resolves.not.toThrow();
  });
});