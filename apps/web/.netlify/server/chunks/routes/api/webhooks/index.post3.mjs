import { d as defineEventHandler, r as readBody, f as getHeader, c as createError, e as setResponseStatus } from '../../../nitro/nitro.mjs';
import { Buffer } from 'node:buffer';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { a as createAdminApiCaller } from '../../../_/caller.mjs';
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
import 'node:fs';
import 'node:path';
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

const index_post = defineEventHandler(async (event) => {
  var _a;
  try {
    const text = await readBody(event);
    const hmac = createHmac(
      "sha256",
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET
    );
    const digest = Buffer.from(hmac.update(`${text}`).digest("hex"), "utf8");
    const signatureHeader = getHeader(event, "x-signature");
    if (!signatureHeader) {
      throw new Error("Missing x-signature header");
    }
    const signature = Buffer.from(signatureHeader, "utf8");
    if (!timingSafeEqual(digest, signature)) {
      throw new Error("Invalid signature.");
    }
    const payload = await readBody(event);
    const {
      meta: { event_name: eventName, custom_data: customData },
      data
    } = payload;
    const statusMap = {
      active: "ACTIVE",
      past_due: "PAST_DUE",
      unpaid: "UNPAID",
      cancelled: "CANCELED",
      expired: "EXPIRED",
      on_trial: "TRIALING",
      paused: "PAUSED"
    };
    const apiCaller = await createAdminApiCaller();
    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
      case "subscription_cancelled":
      case "subscription_expired":
      case "subscription_resumed":
        await apiCaller.billing.syncSubscription({
          id: String(data.id),
          teamId: customData == null ? void 0 : customData.team_id,
          customerId: String(data.attributes.customer_id),
          planId: String(data.attributes.product_id),
          variantId: String(data.attributes.variant_id),
          status: statusMap[data.attributes.status],
          nextPaymentDate: new Date(
            (_a = data.attributes.trial_ends_at) != null ? _a : data.attributes.renews_at
          )
        });
        break;
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook error: ${error instanceof Error ? error.message : ""}`
    });
  }
  setResponseStatus(event, 204);
  return null;
});

export { index_post as default };
//# sourceMappingURL=index.post3.mjs.map
