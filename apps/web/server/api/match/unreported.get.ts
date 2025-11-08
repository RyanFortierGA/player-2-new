import { prisma } from "database/src/client";

export default defineEventHandler(async (event) => {
  const teamId = getQuery(event).teamId as string;
  if (!teamId) throw createError({ statusCode: 400, statusMessage: 'Missing teamId' });

  const match = await prisma.match.findFirst({
    where: {
      OR: [ { homeTeamId: teamId }, { awayTeamId: teamId } ],
      homeScore: null,
      awayScore: null,
    },
    select: {
      id: true,
      weekNumber: true,
      scheduledAt: true,
      status: true,
      division: { select: { teamSize: true } },
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
      notes: true,
    },
    orderBy: [{ weekNumber: 'asc' }, { scheduledAt: 'asc' }],
  });

  return match || null;
});


