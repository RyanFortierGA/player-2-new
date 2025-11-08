import { prisma } from 'database/src/client';

export default defineEventHandler(async (event) => {
  const teamId = getQuery(event).teamId as string;
  if (!teamId) throw createError({ statusCode: 400, statusMessage: 'Missing teamId' });

  const matches = await prisma.match.findMany({
    where: { OR: [ { homeTeamId: teamId }, { awayTeamId: teamId } ] },
    select: {
      id: true, weekNumber: true, scheduledAt: true, status: true,
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      homeScore: true, awayScore: true,
    },
    orderBy: [{ weekNumber: 'asc' }, { scheduledAt: 'asc' }],
  });

  return matches;
});


