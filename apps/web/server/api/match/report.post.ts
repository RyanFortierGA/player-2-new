import { prisma } from "database/src/client";

type Body = {
  matchId: string;
  teamId: string;
  myScore: number; // maps won by submitting team
  theirScore: number; // maps won by opponent
  notes?: string; // optional explanation
};

function parseNotes(json: string | null): any {
  if (!json) return {};
  try { return JSON.parse(json); } catch { return {}; }
}

function validateScorePair(a: number, b: number) {
  const valid = (
    (a === 3 && [0,1,2].includes(b)) ||
    (b === 3 && [0,1,2].includes(a))
  );
  if (!valid) throw createError({ statusCode: 400, statusMessage: "Invalid score. Use 3-0, 3-1, 3-2, 0-3, 1-3, or 2-3." });
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event);
  const { matchId, teamId, myScore, theirScore, notes: submitNotes } = body || {} as Body;
  if (!matchId || !teamId) throw createError({ statusCode: 400, statusMessage: 'matchId and teamId are required' });
  validateScorePair(myScore, theirScore);

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true, homeTeamId: true, awayTeamId: true, homeScore: true, awayScore: true, status: true, notes: true,
    },
  });
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Match not found' });
  if (match.homeScore !== null || match.awayScore !== null) {
    return { state: 'already_confirmed' };
  }
  const isHome = match.homeTeamId === teamId;
  const isAway = match.awayTeamId === teamId;
  if (!isHome && !isAway) throw createError({ statusCode: 403, statusMessage: 'Team not in match' });

  const notes = parseNotes(match.notes);
  const nowIso = new Date().toISOString();
  if (isHome) {
    notes.homeSubmit = { teamId, scoreFor: myScore, scoreAgainst: theirScore, at: nowIso, notes: submitNotes || null };
  } else {
    notes.awaySubmit = { teamId, scoreFor: myScore, scoreAgainst: theirScore, at: nowIso, notes: submitNotes || null };
  }

  const haveBoth = notes.homeSubmit && notes.awaySubmit;
  const homeS = notes.homeSubmit as any;
  const awayS = notes.awaySubmit as any;
  const homeClaimsWin = haveBoth && homeS.scoreFor > homeS.scoreAgainst;
  const awayClaimsWin = haveBoth && awayS.scoreFor > awayS.scoreAgainst;
  const winnerConflict = haveBoth && ((homeClaimsWin && awayClaimsWin) || (!homeClaimsWin && !awayClaimsWin));
  const exactScoresAgree = haveBoth && (
    homeS.scoreFor === awayS.scoreAgainst &&
    homeS.scoreAgainst === awayS.scoreFor
  );

  if (!haveBoth) {
    await prisma.match.update({ where: { id: matchId }, data: { notes: JSON.stringify(notes) } });
    return { state: 'pending_other_team' };
  }

  if (winnerConflict) {
    await prisma.match.update({ where: { id: matchId }, data: { status: 'NEEDS_RESOLUTION' as any, notes: JSON.stringify(notes) } });
    return { state: 'needs_resolution' };
  }

  // Winners agree. If exact maps differ, accept winner and normalize maps.
  // Normalize: set winner maps to 3; loser maps to the max of both reported loser counts (0..2)
  let finalHome: number;
  let finalAway: number;
  if (homeClaimsWin) {
    finalHome = 3;
    finalAway = Math.max(homeS.scoreAgainst, awayS.scoreFor);
  } else {
    finalAway = 3;
    finalHome = Math.max(homeS.scoreFor, awayS.scoreAgainst);
  }

  // Confirm results and update standings transactionally
  await prisma.$transaction(async (tx) => {
    await tx.match.update({ where: { id: matchId }, data: { homeScore: finalHome, awayScore: finalAway, status: 'COMPLETED' as any, notes: JSON.stringify(notes) } });

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

  return { state: 'confirmed', homeScore: finalHome, awayScore: finalAway };
});


