import { stripe } from "~/lib/stripe";
import { prisma } from "~/lib/prisma";
import type { UserTier } from "@prisma/client";

export async function action({ request }: { request: Request }) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "No signature" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return Response.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const tier = session.metadata?.tier;
      const customerId = session.customer as string;

      if (userId) {
        // Tier mapping: user-facing "Premium" ($7.99) = DB STANDARD, "Journalist Pro" ($14.99) = DB PREMIUM
        let derivedTier: UserTier = "STANDARD";
        let priceLocked: number | undefined;

        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price?.id;
          const priceAmount = subscription.items.data[0]?.price?.unit_amount;

          if (priceId === process.env.STRIPE_JOURNALIST_PRICE_ID) {
            derivedTier = "PREMIUM";
          } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
            derivedTier = "STANDARD";
          }

          if (priceAmount) {
            priceLocked = priceAmount / 100;
          }
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId,
            tier: derivedTier,
            subscriptionActive: true,
            ...(priceLocked && { priceLocked }),
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        const isActive = subscription.status === "active" || subscription.status === "trialing";
        const priceId = subscription.items.data[0]?.price?.id;

        // Tier mapping: user-facing "Premium" ($7.99) = DB STANDARD, "Journalist Pro" ($14.99) = DB PREMIUM
        let tier: UserTier | undefined;
        if (priceId === process.env.STRIPE_JOURNALIST_PRICE_ID) tier = "PREMIUM";
        else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) tier = "STANDARD";

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionActive: isActive,
            ...(tier && { tier }),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        // Downgrade to FREE, but preserve founder status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionActive: false,
            tier: user.isFounder ? "STANDARD" : "FREE",
          },
        });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (user) {
        // NOTE: Don't immediately downgrade — give 7-day grace
        // The subscription.deleted event handles actual cancellation
        console.log(`Payment failed for user ${user.email}`);
      }
      break;
    }

    case "charge.dispute.created": {
      const dispute = event.data.object;
      console.error(`[stripe] DISPUTE CREATED: ${dispute.id}, amount: ${(dispute as any).amount}, reason: ${(dispute as any).reason}`);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      console.log(`[stripe] Refund processed for customer ${(charge as any).customer}, amount: ${(charge as any).amount_refunded}`);
      break;
    }

    default:
      // Unhandled event type
      break;
  }

  return Response.json({ received: true });
}
