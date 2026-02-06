import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

const prismaa = new PrismaClient({
  log: ['error', 'warn'] // remove 'query'
});


const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;