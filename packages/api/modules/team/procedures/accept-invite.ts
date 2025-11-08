import { TRPCError } from "@trpc/server";
import { TeamSchema, db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const acceptInvitation = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .output(TeamSchema.pick({ name: true }))
  .mutation(async ({ input: { id }, ctx: { user } }) => {
    const invitation = await db.teamInvitation.findUnique({
      where: {
        id,
      },
    });

    if (!invitation)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invitation not found.",
      });

    if (invitation.expiresAt < new Date())
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invitation expired.",
      });

    // enforce roster cap before creating membership
    const membershipCount = await db.teamMembership.count({ where: { teamId: invitation.teamId } });
    let maxRoster = 6;
    const teamForDivision = await db.team.findUnique({ where: { id: invitation.teamId }, select: { divisionId: true, /* @ts-expect-error */ preferredTeamSize: true } as any });
    if (teamForDivision?.divisionId) {
      const division = await db.division.findUnique({ where: { id: teamForDivision.divisionId }, select: { maxRoster: true } });
      if (division?.maxRoster) maxRoster = division.maxRoster;
    } else if ((teamForDivision as any)?.preferredTeamSize === 2) {
      maxRoster = 3;
    }
    if (membershipCount >= maxRoster) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Roster is full" });
    }

    // create membership for user
    const { team } = await db.teamMembership.create({
      data: {
        teamId: invitation.teamId,
        userId: user.id,
        role: invitation.role,
      },
      include: {
        team: {
          select: {
            name: true,
          },
        },
      },
    });

    // delete invitation
    await db.teamInvitation.delete({
      where: {
        id,
      },
    });

    return team;
  });
