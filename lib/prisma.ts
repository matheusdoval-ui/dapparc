import { PrismaClient } from '@prisma/client'

let raw = process.env.DATABASE_URL ?? ''
raw = raw.trim()
if (raw.length >= 2 && ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"')))) {
  raw = raw.slice(1, -1).trim()
}
if (raw.toLowerCase().startsWith('psql')) {
  throw new Error('DATABASE_URL invalid: use only the Postgres URL, not "psql" command')
}
if (!raw || !raw.startsWith('postgresql://')) {
  throw new Error('DATABASE_URL missing or invalid (must start with postgresql://)')
}
const url = raw

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

// Singleton global: evita múltiplas instâncias em serverless (Vercel)
globalForPrisma.prisma = prisma
