import { TRPCError } from "@trpc/server";
import { db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const updateRoster = protectedProcedure
  .input(
    z.object({
      membershipId: z.string(),
      gamerTag: z.string().optional().nullable(),
      platform: z.string().optional().nullable(),
      isSub: z.boolean().optional(),
    }),
  )
  .mutation(async ({ input: { membershipId, gamerTag, platform, isSub }, ctx: { abilities } }) => {
    const membership = await db.teamMembership.findUnique({ where: { id: membershipId } });
    if (!membership) throw new TRPCError({ code: "NOT_FOUND", message: "Membership not found" });
    if (!abilities.isTeamOwner(membership.teamId)) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Only owner can edit roster" });
    }

    await db.teamMembership.update({
      where: { id: membershipId },
      data: {
        gamerTag: gamerTag ?? undefined,
        platform: platform ?? undefined,
        isSub: typeof isSub === 'boolean' ? isSub : undefined,
      },
    });

    return { ok: true };
  });


