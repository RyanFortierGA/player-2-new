import { TRPCError } from "@trpc/server";
import { db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const setStatus = protectedProcedure
  .input(z.object({ teamId: z.string(), status: z.enum(["UNASSIGNED","ASSIGNED","WAITLIST","ACTIVE"]) }))
  .mutation(async ({ input: { teamId, status }, ctx: { isAdmin } }) => {
    if (!isAdmin) throw new TRPCError({ code: "UNAUTHORIZED" });
    await db.team.update({ where: { id: teamId }, data: { status } });
    return { ok: true };
  });


