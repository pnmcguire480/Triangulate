import { stripe } from "~/lib/stripe";
import { requireUser } from "~/lib/auth";

// Price IDs from Stripe — set these in environment variables
// Create products in Stripe Dashboard first, then set:
//   STRIPE_PREMIUM_PRICE_ID=price_xxx
//   STRIPE_JOURNALIST_PRICE_ID=price_xxx

export async function action({ request }: { request: Request }) {
  const user = await requireUser(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  const tier = body.tier as string;

  if (!["PREMIUM", "JOURNALIST"].includes(tier)) {
    return Response.json({ error: "Invalid tier" }, { status: 400 });
  }

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
        tier,
      },
    });
    customerId = customer.id;

    // Store customer ID (will be updated by webhook too)
    const { prisma } = await import("~/lib/prisma");
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Map tier to Stripe price ID
  const priceId = tier === "PREMIUM"
    ? process.env.STRIPE_PREMIUM_PRICE_ID
    : process.env.STRIPE_JOURNALIST_PRICE_ID;

  if (!priceId) {
    return Response.json(
      { error: "Stripe not configured. Set STRIPE_PREMIUM_PRICE_ID and STRIPE_JOURNALIST_PRICE_ID." },
      { status: 500 }
    );
  }

  const baseUrl = process.env.MAGIC_LINK_BASE_URL || "http://localhost:5173";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/pricing?success=true`,
    cancel_url: `${baseUrl}/pricing?canceled=true`,
    metadata: {
      userId: user.id,
      tier,
    },
  });

  return Response.json({ url: session.url });
}
