import { TRPCError } from "@trpc/server";
import { db } from "database";
import { z } from "zod";
import { protectedProcedure } from "../../trpc";

export const players = protectedProcedure
  .input(z.object({ teamId: z.string() }))
  .query(async ({ input: { teamId }, ctx: { abilities } }) => {
    if (!abilities.isTeamMember(teamId)) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return await db.teamPlayer.findMany({ where: { teamId }, orderBy: { createdAt: 'asc' } });
  });

export const addPlayer = protectedProcedure
  .input(z.object({ teamId: z.string(), name: z.string().min(1), gamerTag: z.string().optional(), platform: z.string().optional(), role: z.string().optional(), isSub: z.boolean().optional() }))
  .mutation(async ({ input: { teamId, name, gamerTag, platform, role, isSub }, ctx: { abilities } }) => {
    if (!abilities.isTeamOwner(teamId)) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return await db.teamPlayer.create({ data: { teamId, name, gamerTag, platform, role, isSub: !!isSub } });
  });

export const updatePlayer = protectedProcedure
  .input(z.object({ id: z.string(), name: z.string().optional(), gamerTag: z.string().optional().nullable(), platform: z.string().optional().nullable(), role: z.string().optional().nullable(), isSub: z.boolean().optional() }))
  .mutation(async ({ input: { id, ...data }, ctx: { abilities } }) => {
    const player = await db.teamPlayer.findUnique({ where: { id } });
    if (!player) throw new TRPCError({ code: 'NOT_FOUND' });
    if (!abilities.isTeamOwner(player.teamId)) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return await db.teamPlayer.update({ where: { id }, data: { ...data } });
  });

export const removePlayer = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input: { id }, ctx: { abilities } }) => {
    const player = await db.teamPlayer.findUnique({ where: { id } });
    if (!player) throw new TRPCError({ code: 'NOT_FOUND' });
    if (!abilities.isTeamOwner(player.teamId)) throw new TRPCError({ code: 'UNAUTHORIZED' });
    await db.teamPlayer.delete({ where: { id } });
    return { ok: true };
  });


