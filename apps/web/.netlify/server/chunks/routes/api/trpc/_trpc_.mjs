import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { U as eventHandler, a as getRequestURL, V as getRequestWebStream } from '../../../nitro/nitro.mjs';
import { c as createContext, b as apiRouter, l as logger } from '../../../_/context.mjs';
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

//#region src/shared.ts
const defaultEndpoint = "/api/trpc";

//#region src/server/toWebRequest.ts
function toWebRequest(event) {
	if ("request" in event) return event.request;
	return toWebRequestOriginal(event);
}
function toWebRequestOriginal(event) {
	return event.web?.request || new Request(getRequestURL(event), {
		duplex: "half",
		method: event.method,
		headers: event.headers,
		body: getRequestWebStream(event)
	});
}

//#endregion
//#region src/server/createTRPCNuxtHandler.ts
function createTRPCNuxtHandler(opts) {
	return eventHandler(async (event) => {
		const createContext = async (fetchCreateContextOptions) => {
			return await opts.createContext?.(event, fetchCreateContextOptions);
		};
		const httpResponse = await fetchRequestHandler({
			...opts,
			endpoint: opts.endpoint || defaultEndpoint,
			router: opts.router,
			req: toWebRequest(event),
			createContext
		});
		if (event.handled) return;
		return httpResponse;
	});
}

const _trpc_ = createTRPCNuxtHandler({
  router: apiRouter,
  createContext,
  onError: ({ error }) => {
    logger.error(error);
  }
});

export { _trpc_ as default };
//# sourceMappingURL=_trpc_.mjs.map
