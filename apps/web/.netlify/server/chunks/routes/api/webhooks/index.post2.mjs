import { d as defineEventHandler, f as getHeader, c as createError, h as readRawBody, i as sendError, e as setResponseStatus } from '../../../nitro/nitro.mjs';
import { createHmac } from 'node:crypto';
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
import 'node:buffer';
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
    const signature = getHeader(event, "creem-signature");
    if (!signature) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing signature."
      });
    }
    const secret = process.env.CREEM_WEBHOOK_SECRET;
    if (!secret) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing webhook secret."
      });
    }
    const bodyText = await readRawBody(event, "utf8");
    if (!bodyText) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing request body."
      });
    }
    const computedSignature = createHmac("sha256", secret).update(bodyText).digest("hex");
    if (computedSignature !== signature) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid signature."
      });
    }
    const payload = JSON.parse(bodyText);
    const type = (_a = payload == null ? void 0 : payload.eventType) != null ? _a : null;
    if (!type || ![
      "subscription.active",
      "subscription.canceled",
      "subscription.update"
    ].includes(type)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid event type."
      });
    }
    const statusMap = {
      active: "ACTIVE",
      unpaid: "UNPAID",
      canceled: "CANCELED",
      trialing: "TRIALING",
      paused: "PAUSED"
    };
    const apiCaller = await createAdminApiCaller();
    const subscription = payload == null ? void 0 : payload.object;
    if (!(subscription == null ? void 0 : subscription.metadata.teamId)) {
      throw new Error("Invalid payload.");
    }
    const selectedPlanId = subscription.product.id;
    await apiCaller.billing.syncSubscription({
      id: subscription.id,
      teamId: subscription.metadata.teamId,
      customerId: subscription.customer.id,
      planId: String(selectedPlanId),
      variantId: String(selectedPlanId),
      status: statusMap[subscription.status],
      nextPaymentDate: new Date(subscription.current_period_end_date)
    });
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: `Webhook error: ${error instanceof Error ? error.message : ""}`
      })
    );
  }
  setResponseStatus(event, 204);
  return null;
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
