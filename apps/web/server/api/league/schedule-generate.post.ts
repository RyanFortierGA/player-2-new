import { prisma } from "database/src/client";

type Body = {
  seasonId: string;
  region: "US_EAST"|"US_WEST"|"EUROPE"|"ASIA"|"AU_NZ"|"SOUTH_AMERICA"|"AFRICA";
  level: number; // division level
  weeks?: number; // default 8
  startAtIso?: string; // optional start date
};

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event);
  const { seasonId, region, level } = body;
  const weeks = body.weeks ?? 8;
  const startAt = body.startAtIso ? new Date(body.startAtIso) : new Date();

  if (!seasonId || !region || !level) {
    throw createError({ statusCode: 400, statusMessage: "seasonId, region, level are required" });
  }

  const division = await prisma.division.findFirst({ where: { seasonId, region: region as any, level } });
  if (!division) throw createError({ statusCode: 404, statusMessage: "Division not found" });

  const teams = await prisma.team.findMany({ where: { seasonId, divisionId: division.id }, orderBy: { name: "asc" }, select: { id: true } });
  if (teams.length < 2) return { created: 0 };

  // Round-robin pairing (circle method)
  const teamIds = teams.map(t => t.id);
  if (teamIds.length % 2 === 1) teamIds.push("BYE");
  const n = teamIds.length;
  const rounds = Math.min(weeks, n - 1);
  const half = n / 2;

  const pairings: { week: number; home: string; away: string }[] = [];
  let arr = [...teamIds];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== "BYE" && b !== "BYE") {
        // Alternate home/away by round
        const home = r % 2 === 0 ? a : b;
        const away = r % 2 === 0 ? b : a;
        pairings.push({ week: r + 1, home, away });
      }
    }
    // rotate
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop() as string);
    arr = [fixed, ...rest];
  }

  const created = await prisma.match.createMany({
    data: pairings.map(p => ({
      seasonId,
      divisionId: division.id,
      region: region as any,
      weekNumber: p.week,
      scheduledAt: new Date(startAt.getTime() + (p.week - 1) * 7 * 24 * 3600 * 1000),
      homeTeamId: p.home,
      awayTeamId: p.away,
      status: "SCHEDULED" as any,
    })),
    skipDuplicates: true,
  });

  return { created: created.count };
});


