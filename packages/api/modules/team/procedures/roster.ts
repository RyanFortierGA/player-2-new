import { TRPCError } from "@trpc/server";
import { db, UserSchema } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const roster = protectedProcedure
  .input(z.object({ teamId: z.string() }))
  .output(
    z.array(
      z.object({
        id: z.string(),
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(["MEMBER","OWNER"]),
        isCreator: z.boolean(),
        gamerTag: z.string().nullable().optional(),
        platform: z.string().nullable().optional(),
        isSub: z.boolean().optional(),
        user: UserSchema.optional(),
      })
    )
  )
  .query(async ({ input: { teamId }, ctx: { abilities } }) => {
    if (!abilities.isTeamMember(teamId)) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "No permission" });
    }

    const list = await db.teamMembership.findMany({ where: { teamId } });
    const users = await db.user.findMany({ where: { id: { in: list.map(m => m.userId) } } });
    return list.map(m => ({ ...m, user: users.find(u => u.id === m.userId) }));
  });


