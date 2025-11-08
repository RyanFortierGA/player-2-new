import { prisma } from "database/src/client";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const region = (query.region as string) || undefined;
  const level = query.level ? Number(query.level) : undefined;
  const teamSize = query.teamSize ? Number(query.teamSize) : undefined;
  const seasonId = (query.seasonId as string) || undefined;

  const where: any = {};
  if (region) where.region = region as any;
  if (seasonId) where.seasonId = seasonId;
  if (level) where.division = { level, ...(teamSize ? { teamSize } : {}) };

  const teams = await prisma.team.findMany({
    where,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      wins: true,
      losses: true,
      ties: true,
      points: true,
      division: { select: { level: true, region: true, teamSize: true } },
    },
    orderBy: [
      { points: "desc" },
      { wins: "desc" },
      { name: "asc" },
    ],
  });

  return teams;
});


