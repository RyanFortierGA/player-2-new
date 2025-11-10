import { d as defineEventHandler, h as readRawBody, f as getHeader, r as readBody, c as createError, e as setResponseStatus } from '../../../nitro/nitro.mjs';
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
  var _a, _b, _c, _d, _e, _f, _g;
  try {
    const text = await readRawBody(event);
    const hmac = createHmac(
      "sha256",
      process.env.STRIPE_WEBHOOK_SECRET
    );
    const signatureHeader = getHeader(event, "stripe-signature");
    if (!signatureHeader) {
      throw new Error("Missing stripe-signature header");
    }
    const signatureParts = signatureHeader.split(",").map((part) => part.split("="));
    const signatureKey = (_b = (_a = signatureParts.find((part) => part[0] === "v1")) == null ? void 0 : _a[1]) != null ? _b : "";
    const signatureTimestamp = (_d = (_c = signatureParts.find((part) => part[0] === "t")) == null ? void 0 : _c[1]) != null ? _d : "";
    const digest = Buffer.from(
      hmac.update(`${signatureTimestamp}.${text}`).digest("hex"),
      "utf8"
    );
    const signature = Buffer.from(signatureKey, "utf8");
    if (!timingSafeEqual(digest, signature))
      throw new Error("Invalid signature.");
    const payload = await readBody(event);
    const type = payload == null ? void 0 : payload.type;
    if (![
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted"
    ].includes(type)) {
      throw new Error("Invalid event type.");
    }
    const statusMap = {
      active: "ACTIVE",
      past_due: "PAST_DUE",
      unpaid: "UNPAID",
      canceled: "CANCELED",
      incomplete: "INCOMPLETE",
      incomplete_expired: "EXPIRED",
      trialing: "TRIALING",
      paused: "PAUSED"
    };
    const apiCaller = await createAdminApiCaller();
    const data = payload == null ? void 0 : payload.data.object;
    if (!data) {
      throw new Error("Invalid payload.");
    }
    await apiCaller.billing.syncSubscription({
      id: String(data.id),
      teamId: (_e = data.metadata) == null ? void 0 : _e.team_id,
      customerId: String(data.customer),
      planId: String(data.plan.product),
      variantId: String(data.plan.id),
      status: statusMap[data.status],
      nextPaymentDate: new Date(
        ((_g = (_f = data.trial_end) != null ? _f : data.current_period_end) != null ? _g : 0) * 1e3
      )
    });
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
//# sourceMappingURL=index.post4.mjs.map
