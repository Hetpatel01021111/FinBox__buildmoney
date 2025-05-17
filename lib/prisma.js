import { PrismaClient } from "@prisma/client";

// Add better logging for connection issues
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    errorFormat: 'pretty',
  });
};

// Use type for global variable
const globalForPrisma = globalThis;

// Create or reuse Prisma client
export const db = globalForPrisma.prisma ?? prismaClientSingleton();

// In development, save the client to avoid multiple connections
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Export the client
export default db;