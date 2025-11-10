import { PrismaClient } from '@prisma/client';

let prisma;
{
  prisma = new PrismaClient();
}

export { prisma as p };
//# sourceMappingURL=client.mjs.map
