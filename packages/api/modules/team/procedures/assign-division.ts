import { TRPCError } from "@trpc/server";
import { db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const assignDivision = protectedProcedure
  .input(z.object({ teamId: z.string(), divisionId: z.string() }))
  .mutation(async ({ input: { teamId, divisionId }, ctx: { isAdmin } }) => {
    if (!isAdmin) throw new TRPCError({ code: "UNAUTHORIZED" });
    const division = await db.division.findUnique({ where: { id: divisionId } });
    if (!division) throw new TRPCError({ code: "NOT_FOUND", message: "Division not found" });
    await db.team.update({
      where: { id: teamId },
      data: { divisionId, seasonId: division.seasonId, region: division.region as any, status: "ASSIGNED" },
    });
    return { ok: true };
  });


