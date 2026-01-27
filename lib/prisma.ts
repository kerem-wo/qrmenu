import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Connection pool configuration for Vercel serverless
// Prisma Accelerate is automatically used if PRISMA_DATABASE_URL is set
// Otherwise, DATABASE_URL from schema.prisma is used
const prismaClientOptions = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Gracefully disconnect on process termination (serverless-friendly)
if (typeof process !== 'undefined') {
  const disconnect = async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.error('Error disconnecting Prisma:', error)
    }
  }
  
  // Handle different termination signals
  process.once('beforeExit', disconnect)
  process.once('SIGINT', disconnect)
  process.once('SIGTERM', disconnect)
}
