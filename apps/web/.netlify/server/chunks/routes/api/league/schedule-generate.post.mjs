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

const scheduleGenerate_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { seasonId, region, level } = body;
  const weeks = (_a = body.weeks) != null ? _a : 8;
  const startAt = body.startAtIso ? new Date(body.startAtIso) : /* @__PURE__ */ new Date();
  if (!seasonId || !region || !level) {
    throw createError({ statusCode: 400, statusMessage: "seasonId, region, level are required" });
  }
  const division = await prisma.division.findFirst({ where: { seasonId, region, level } });
  if (!division) throw createError({ statusCode: 404, statusMessage: "Division not found" });
  const teams = await prisma.team.findMany({ where: { seasonId, divisionId: division.id }, orderBy: { name: "asc" }, select: { id: true } });
  if (teams.length < 2) return { created: 0 };
  const teamIds = teams.map((t) => t.id);
  if (teamIds.length % 2 === 1) teamIds.push("BYE");
  const n = teamIds.length;
  const rounds = Math.min(weeks, n - 1);
  const half = n / 2;
  const pairings = [];
  let arr = [...teamIds];
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i];
      const b = arr[n - 1 - i];
      if (a !== "BYE" && b !== "BYE") {
        const home = r % 2 === 0 ? a : b;
        const away = r % 2 === 0 ? b : a;
        pairings.push({ week: r + 1, home, away });
      }
    }
    const fixed = arr[0];
    const rest = arr.slice(1);
    rest.unshift(rest.pop());
    arr = [fixed, ...rest];
  }
  const created = await prisma.match.createMany({
    data: pairings.map((p) => ({
      seasonId,
      divisionId: division.id,
      region,
      weekNumber: p.week,
      scheduledAt: new Date(startAt.getTime() + (p.week - 1) * 7 * 24 * 3600 * 1e3),
      homeTeamId: p.home,
      awayTeamId: p.away,
      status: "SCHEDULED"
    })),
    skipDuplicates: true
  });
  return { created: created.count };
});

export { scheduleGenerate_post as default };
//# sourceMappingURL=schedule-generate.post.mjs.map
