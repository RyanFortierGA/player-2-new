import { prisma } from "database/src/client";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const region = (query.region as string) || undefined;
  const level = query.level ? Number(query.level) : undefined;
  const teamSize = query.teamSize ? Number(query.teamSize) : undefined;
  const seasonId = (query.seasonId as string) || undefined;
  const week = query.week ? Number(query.week) : undefined;

  const where: any = {};
  if (region) where.region = region as any;
  if (seasonId) where.seasonId = seasonId;
  if (level) where.division = { level, ...(teamSize ? { teamSize } : {}) };
  if (week) where.weekNumber = week;

  const matches = await prisma.match.findMany({
    where,
    select: {
      id: true,
      weekNumber: true,
      scheduledAt: true,
      status: true,
      region: true,
      division: { select: { level: true } },
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true} },
      homeScore: true,
      awayScore: true,
      notes: true,
    },
    orderBy: [ { weekNumber: "asc" }, { scheduledAt: "asc" } ],
  });

  return matches;
});


