import { prisma } from 'database/src/client';

export default defineEventHandler(async (event) => {
  const teamId = getQuery(event).teamId as string;
  if (!teamId) throw createError({ statusCode: 400, statusMessage: 'Missing teamId' });
  const roster = await prisma.teamMembership.findMany({
    where: { teamId },
    select: {
      id: true, teamId: true, userId: true, role: true, isCreator: true,
      gamerTag: true, platform: true, isSub: true,
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { role: 'desc' },
  });
  return roster;
});


