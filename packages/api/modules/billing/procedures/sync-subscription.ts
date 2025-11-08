import { TRPCError } from "@trpc/server";
import { SubscriptionSchema, db, type Subscription } from "database";
import { publicProcedure } from "../../trpc";

export const syncSubscription = publicProcedure
  .input(SubscriptionSchema)
  .mutation(async ({ input: subscription, ctx: { isAdmin } }) => {
    // this procedure can only be called by the admin caller from a webhook
    if (!isAdmin)
      throw new TRPCError({
        code: "FORBIDDEN",
      });

    let existingSubscription: Subscription | null = null;

    if (subscription?.teamId) {
      existingSubscription = await db.subscription.findUnique({
        where: {
          teamId: subscription.teamId,
        },
      });
    }

    try {
      if (!existingSubscription)
        await db.subscription.create({
          data: subscription,
        });
      else
        await db.subscription.update({
          where: {
            teamId: existingSubscription.teamId,
          },
          data: subscription,
        });

      // Update team status based on subscription
      if (subscription.teamId) {
        if (subscription.status === "ACTIVE") {
          await db.team.update({ where: { id: subscription.teamId }, data: { status: "ACTIVE" } });
        } else if (["PAUSED","PAST_DUE","UNPAID","CANCELED","INCOMPLETE","EXPIRED"].includes(subscription.status)) {
          // keep assignment but mark not active
          await db.team.update({ where: { id: subscription.teamId }, data: { status: "ASSIGNED" } });
        }
      }
    } catch (e) {
      console.error(e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  });
