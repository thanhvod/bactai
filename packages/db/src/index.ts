import { PrismaClient } from "@prisma/client";

// Singleton PrismaClient dùng chung; tránh tạo nhiều connection khi hot-reload dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export * from "@prisma/client";
