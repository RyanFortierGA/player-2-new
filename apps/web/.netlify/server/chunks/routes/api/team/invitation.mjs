import { d as defineEventHandler, a as getRequestURL, w as withLeadingSlash } from '../../../nitro/nitro.mjs';
import { c as createApiCaller } from '../../../_/caller.mjs';
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
import '../../../_/context.mjs';
import '@trpc/server';
import 'zod';
import 'superjson';
import '../../../_/client.mjs';
import '@prisma/client';
import '../../../_/sessions.mjs';
import 'cookie';
import '@oslojs/crypto/sha2';
import '@oslojs/encoding';
import '@oslojs/crypto/random';
import '../../../_/base-url.mjs';
import 'openai';
import '@node-rs/argon2';
import 'stripe';
import '@aws-sdk/client-s3';
import '@aws-sdk/s3-request-presigner';

const createResponse = (redirectPath) => {
  return {
    redirectPath: withLeadingSlash(redirectPath)
  };
};
const invitation = defineEventHandler(async (event) => {
  const requestUrl = getRequestURL(event);
  const code = requestUrl.searchParams.get("code") || null;
  try {
    if (!code) {
      throw new Error("No invitation code query param provided");
    }
    const apiCaller = await createApiCaller(event);
    const invitation = await apiCaller.team.invitationById({
      id: code
    });
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    const user = await apiCaller.auth.user();
    if (!user) {
      return createResponse(
        `/auth/login?invitationCode=${invitation.id}&email=${invitation.email}`
      );
    }
    const team = await apiCaller.team.acceptInvitation({
      id: code
    });
    if (!team) {
      throw new Error("Team not found");
    }
    return createResponse("/app/dashboard");
  } catch (e) {
    console.error(e);
    return createResponse("/");
  }
});

export { invitation as default };
//# sourceMappingURL=invitation.mjs.map
