import { d as defineEventHandler, g as getQuery, c as createError } from '../../../nitro/nitro.mjs';
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

const team_get = defineEventHandler(async (event) => {
  const id = getQuery(event).id;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id" });
  }
  const team = await prisma.team.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      region: true,
      status: true,
      division: { select: { level: true, region: true, teamSize: true } },
      players: { select: { id: true, name: true, gamerTag: true, platform: true, role: true, isSub: true } }
    }
  });
  if (!team) throw createError({ statusCode: 404, statusMessage: "Not found" });
  return team;
});

export { team_get as default };
//# sourceMappingURL=team.get.mjs.map
