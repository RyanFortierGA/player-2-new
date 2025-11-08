import { TRPCError } from "@trpc/server";
import { db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const joinLadder = protectedProcedure
  .input(
    z.object({
      teamId: z.string(),
      region: z.enum([
        "US_EAST",
        "US_WEST",
        "EUROPE",
        "ASIA",
        "AU_NZ",
        "SOUTH_AMERICA",
        "AFRICA",
      ]),
      teamSize: z.enum(["2", "4"]).transform((v) => Number(v)),
      level: z.number().int().min(1).default(1),
    }),
  )
  .mutation(async ({ input: { teamId, region, teamSize, level }, ctx: { abilities } }) => {
    if (!abilities.isTeamOwner(teamId)) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Only owners can join a ladder" });
    }

    const team = await db.team.findUnique({ where: { id: teamId } });
    if (!team) throw new TRPCError({ code: "NOT_FOUND", message: "Team not found" });

    const season = await db.season.findFirst({ orderBy: { createdAt: "desc" } });
    if (!season) throw new TRPCError({ code: "NOT_FOUND", message: "Season not found" });

    const division = await db.division.findFirst({
      where: { seasonId: season.id, region: region as any, level, teamSize },
      orderBy: { id: "asc" },
    });
    if (!division) throw new TRPCError({ code: "NOT_FOUND", message: "No division for selection" });

    await db.team.update({
      where: { id: teamId },
      data: { region: region as any, divisionId: division.id, seasonId: season.id },
    });

    return { ok: true, divisionId: division.id };
  });


