import { TRPCError } from "@trpc/server";
import { db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const inviteMember = protectedProcedure
  .input(
    z.object({
      teamId: z.string(),
      email: z.string(),
      role: z.enum(["MEMBER", "OWNER"]),
    }),
  )
  .mutation(async ({ input: { teamId, email, role }, ctx: { abilities } }) => {
    if (!abilities.isTeamOwner(teamId)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No permission to add a member to this team.",
      });
    }

    try {
      // enforce roster cap (default 6 if no division)
      const team = await db.team.findUnique({ where: { id: teamId }, select: { divisionId: true, /* @ts-expect-error */ preferredTeamSize: true } as any });
      const membershipCount = await db.teamMembership.count({ where: { teamId } });
      let maxRoster = 6;
      if (team?.divisionId) {
        const division = await db.division.findUnique({ where: { id: team.divisionId }, select: { maxRoster: true } });
        if (division?.maxRoster) maxRoster = division.maxRoster;
      } else if ((team as any)?.preferredTeamSize === 2) {
        maxRoster = 3;
      }
      if (membershipCount >= maxRoster) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Roster is full" });
      }

      // Find existing user by email
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User not found. Ask the player to sign up first." });
      }

      await db.teamMembership.create({
        data: { teamId, userId: user.id, role },
      });
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could not invite member.",
      });
    }
  });
