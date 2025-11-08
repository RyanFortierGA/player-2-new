import { prisma } from 'database/src/client';

export default defineEventHandler(async (event) => {
  const teamId = getQuery(event).teamId as string;
  if (!teamId) throw createError({ statusCode: 400, statusMessage: 'Missing teamId' });

  return await prisma.teamPlayer.findMany({
    where: { teamId },
    select: { id: true, teamId: true, name: true, gamerTag: true, platform: true, role: true, isSub: true },
    orderBy: { createdAt: 'asc' },
  });
});


