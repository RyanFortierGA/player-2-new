import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import 'lru-cache';
import '@unocss/core';
import '@unocss/preset-wind3';
import 'devalue';
import 'consola';
import '@vue-email/compiler';
import 'unhead';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'vue';
import '@unhead/schema-org/vue';
import 'unified';
import 'mdast-util-to-string';
import 'micromark';
import 'unist-util-stringify-position';
import 'micromark-util-character';
import 'micromark-util-chunked';
import 'micromark-util-resolve-all';
import 'micromark-util-sanitize-uri';
import 'slugify';
import 'remark-parse';
import 'remark-rehype';
import 'remark-mdc';
import 'remark-gfm';
import 'rehype-external-links';
import 'rehype-sort-attribute-values';
import 'rehype-sort-attributes';
import 'rehype-raw';
import 'detab';
import 'hast-util-to-string';
import 'github-slugger';
import 'unhead/server';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-bundle-renderer/runtime';
import 'vue/server-renderer';
import 'node:url';
import 'ipx';
import '@prisma/client';

function parseNotes(json) {
  if (!json) return {};
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}
function validateScorePair(a, b) {
  const valid = a === 3 && [0, 1, 2].includes(b) || b === 3 && [0, 1, 2].includes(a);
  if (!valid) throw createError({ statusCode: 400, statusMessage: "Invalid score. Use 3-0, 3-1, 3-2, 0-3, 1-3, or 2-3." });
}
const report_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { matchId, teamId, myScore, theirScore, notes: submitNotes } = body || {};
  if (!matchId || !teamId) throw createError({ statusCode: 400, statusMessage: "matchId and teamId are required" });
  validateScorePair(myScore, theirScore);
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      homeTeamId: true,
      awayTeamId: true,
      homeScore: true,
      awayScore: true,
      status: true,
      notes: true
    }
  });
  if (!match) throw createError({ statusCode: 404, statusMessage: "Match not found" });
  if (match.homeScore !== null || match.awayScore !== null) {
    return { state: "already_confirmed" };
  }
  const isHome = match.homeTeamId === teamId;
  const isAway = match.awayTeamId === teamId;
  if (!isHome && !isAway) throw createError({ statusCode: 403, statusMessage: "Team not in match" });
  const notes = parseNotes(match.notes);
  const nowIso = (/* @__PURE__ */ new Date()).toISOString();
  if (isHome) {
    notes.homeSubmit = { teamId, scoreFor: myScore, scoreAgainst: theirScore, at: nowIso, notes: submitNotes || null };
  } else {
    notes.awaySubmit = { teamId, scoreFor: myScore, scoreAgainst: theirScore, at: nowIso, notes: submitNotes || null };
  }
  const haveBoth = notes.homeSubmit && notes.awaySubmit;
  const homeS = notes.homeSubmit;
  const awayS = notes.awaySubmit;
  const homeClaimsWin = haveBoth && homeS.scoreFor > homeS.scoreAgainst;
  const awayClaimsWin = haveBoth && awayS.scoreFor > awayS.scoreAgainst;
  const winnerConflict = haveBoth && (homeClaimsWin && awayClaimsWin || !homeClaimsWin && !awayClaimsWin);
  haveBoth && (homeS.scoreFor === awayS.scoreAgainst && homeS.scoreAgainst === awayS.scoreFor);
  if (!haveBoth) {
    await prisma.match.update({ where: { id: matchId }, data: { notes: JSON.stringify(notes) } });
    return { state: "pending_other_team" };
  }
  if (winnerConflict) {
    await prisma.match.update({ where: { id: matchId }, data: { status: "NEEDS_RESOLUTION", notes: JSON.stringify(notes) } });
    return { state: "needs_resolution" };
  }
  let finalHome;
  let finalAway;
  if (homeClaimsWin) {
    finalHome = 3;
    finalAway = Math.max(homeS.scoreAgainst, awayS.scoreFor);
  } else {
    finalAway = 3;
    finalHome = Math.max(homeS.scoreFor, awayS.scoreAgainst);
  }
  await prisma.$transaction(async (tx) => {
    await tx.match.update({ where: { id: matchId }, data: { homeScore: finalHome, awayScore: finalAway, status: "COMPLETED", notes: JSON.stringify(notes) } });
    const homeWin = finalHome > finalAway;
    const awayWin = finalAway > finalHome;
    if (homeWin) {
      await tx.team.update({ where: { id: match.homeTeamId }, data: { wins: { increment: 1 }, points: { increment: 3 } } });
      await tx.team.update({ where: { id: match.awayTeamId }, data: { losses: { increment: 1 } } });
    } else if (awayWin) {
      await tx.team.update({ where: { id: match.awayTeamId }, data: { wins: { increment: 1 }, points: { increment: 3 } } });
      await tx.team.update({ where: { id: match.homeTeamId }, data: { losses: { increment: 1 } } });
    } else {
      await tx.team.update({ where: { id: match.homeTeamId }, data: { ties: { increment: 1 }, points: { increment: 1 } } });
      await tx.team.update({ where: { id: match.awayTeamId }, data: { ties: { increment: 1 }, points: { increment: 1 } } });
    }
  });
  return { state: "confirmed", homeScore: finalHome, awayScore: finalAway };
});

export { report_post as default };
//# sourceMappingURL=report.post.mjs.map
