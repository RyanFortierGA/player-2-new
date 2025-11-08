import { prisma } from 'database/src/client';

export default defineEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' });
  }
  const team = await prisma.team.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      region: true,
      status: true,
      division: { select: { level: true, region: true, teamSize: true } },
      players: { select: { id: true, name: true, gamerTag: true, platform: true, role: true, isSub: true } },
    },
  });
  if (!team) throw createError({ statusCode: 404, statusMessage: 'Not found' });
  return team;
});


