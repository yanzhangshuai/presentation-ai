import process from 'node:process'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

if (!connectionString)
  throw new Error('DATABASE_URL is not defined!')

// 创建 Prisma Client
function createPrismaClient() {
  return new PrismaClient({
    log    : import.meta.dev ? ['warn', 'error'] : ['error'],
    adapter: new PrismaPg({ connectionString }),
  })
}

// 避免热重载重复创建
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
export const db = globalForPrisma.prisma ?? createPrismaClient()
if (import.meta.dev)
  globalForPrisma.prisma = db

console.log('Prisma client initialized')
