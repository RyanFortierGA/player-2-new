import { d as defineEventHandler, r as readBody, c as createError, e as setResponseStatus } from '../../../nitro/nitro.mjs';
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

const index_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d;
  try {
    const payload = await readBody(event);
    const type = (_a = payload == null ? void 0 : payload.event_type) != null ? _a : null;
    if (!type || ![
      "subscription_created",
      "subscription_cancelled",
      "subscription_changed"
    ].includes(type)) {
      return new Response("Invalid event type.", {
        status: 400
      });
    }
    const statusMap = {
      active: "ACTIVE",
      past_due: "PAST_DUE",
      unpaid: "UNPAID",
      cancelled: "CANCELED",
      in_trial: "TRIALING",
      paused: "PAUSED"
    };
    const apiCaller = await createAdminApiCaller();
    const plans = await apiCaller.billing.plans();
    const data = payload == null ? void 0 : payload.content;
    if (!(data == null ? void 0 : data.subscription.cf_team_id)) {
      throw new Error("Invalid payload.");
    }
    const selectedVariantId = data.subscription.subscription_items[0].item_price_id;
    let selectedPlanId;
    for (const plan of plans) {
      for (const variant of plan.variants) {
        if (variant.id === selectedVariantId) {
          selectedPlanId = plan.id;
        }
      }
    }
    await apiCaller.billing.syncSubscription({
      id: String(data.subscription.id),
      teamId: (_b = data.subscription) == null ? void 0 : _b.cf_team_id,
      customerId: String(data.customer.id),
      // biome-ignore lint/style/noNonNullAssertion: This is a valid assertion
      planId: String(selectedPlanId),
      variantId: String(selectedVariantId),
      status: statusMap[data.subscription.status],
      nextPaymentDate: new Date(
        ((_d = (_c = data.subscription.trial_end) != null ? _c : data.subscription.current_term_end) != null ? _d : 0) * 1e3
      )
    });
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook error: ${error instanceof Error ? error.message : ""}`
    });
  }
  setResponseStatus(event, 204);
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
