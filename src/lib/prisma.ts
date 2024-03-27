import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

// This new singleton client code below does't make vs code auto import the client.
// declare global {
//   var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
// }
// const prisma = globalThis.prisma ?? prismaClientSingleton();
// export default prisma;
// if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// Using the old code instead
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
