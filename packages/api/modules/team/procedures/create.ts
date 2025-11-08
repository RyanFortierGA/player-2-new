import { TeamSchema, TeamMemberRoleSchema, db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const create = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      region: z
        .enum([
          "US_EAST",
          "US_WEST",
          "EUROPE",
          "ASIA",
          "AU_NZ",
          "SOUTH_AMERICA",
          "AFRICA",
        ])
        .optional(),
      teamSize: z.enum(["2", "4"]).transform((v) => Number(v)).optional(),
      averagePeakRank: z.string().optional(),
    }),
  )
  .output(
    TeamSchema.extend({
      memberships: z.array(
        z.object({
          id: z.string(),
          role: TeamMemberRoleSchema,
          isCreator: z.boolean(),
        }),
      ),
    }),
  )
  .mutation(async ({ input: { name, region, teamSize, averagePeakRank }, ctx: { user } }) => {
    const team = await db.team.create({
      data: {
        name,
        region: region as any,
        status: "UNASSIGNED",
        // store preference for later assignment
        // @ts-expect-error column may not exist locally yet until DDL applied
        preferredTeamSize: teamSize,
        averagePeakRank,
        memberships: {
          create: {
            userId: user.id,
            role: TeamMemberRoleSchema.Values.OWNER,
            isCreator: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        memberships: {
          select: {
            id: true,
            role: true,
            isCreator: true,
          },
        },
      },
    });

    return team;
  });
