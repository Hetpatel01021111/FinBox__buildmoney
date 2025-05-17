// This file provides a way to conditionally use Prisma based on the environment
import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global;

// Create a mock client for build time
const mockPrismaClient = {
  user: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
  },
  account: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
  },
  transaction: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
  },
  budget: {
    findUnique: () => Promise.resolve(null),
    findMany: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
  },
  $connect: () => Promise.resolve(),
  $disconnect: () => Promise.resolve(),
};

// Use a real or mock client based on the environment
export const prisma = globalForPrisma.prisma || 
  (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ? 
    mockPrismaClient : 
    new PrismaClient());

// Only save the client instance in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
