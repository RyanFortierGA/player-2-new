import { d as defineEventHandler, g as getQuery } from '../../../nitro/nitro.mjs';
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

const standings_get = defineEventHandler(async (event) => {
  const query = getQuery(event);
  const region = query.region || void 0;
  const level = query.level ? Number(query.level) : void 0;
  const teamSize = query.teamSize ? Number(query.teamSize) : void 0;
  const seasonId = query.seasonId || void 0;
  const where = {};
  if (region) where.region = region;
  if (seasonId) where.seasonId = seasonId;
  if (level) where.division = { level, ...teamSize ? { teamSize } : {} };
  const teams = await prisma.team.findMany({
    where,
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      wins: true,
      losses: true,
      ties: true,
      points: true,
      division: { select: { level: true, region: true, teamSize: true } }
    },
    orderBy: [
      { points: "desc" },
      { wins: "desc" },
      { name: "asc" }
    ]
  });
  return teams;
});

export { standings_get as default };
//# sourceMappingURL=standings.get.mjs.map
