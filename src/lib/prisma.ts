import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
// Reason for above - NextJS hot reload in dev environment.
// Otherwise, everytime a hot reload happens a new PrismaClient gets initalized - that causes problems and warning is given in terminal.
// "global" is not affected by hot reload.

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
