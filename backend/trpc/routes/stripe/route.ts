import { z } from "zod";
import { publicProcedure } from "../../create-context";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

console.log("[Stripe] Initializing Stripe routes");

const TIER_PRICE_IDS = {
  starter: {
    monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
    annual: process.env.STRIPE_STARTER_ANNUAL_PRICE_ID || "",
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "",
    annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID || "",
  },
  enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
    annual: process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID || "",
  },
};

export const createCheckoutSessionProcedure = publicProcedure
  .input(
    z.object({
      tier: z.enum(["starter", "pro", "enterprise"]),
      billingCycle: z.enum(["monthly", "annual"]),
      userId: z.string(),
      userEmail: z.string().email(),
      successUrl: z.string(),
      cancelUrl: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log("[Stripe] Creating checkout session:", input);

      const priceId = TIER_PRICE_IDS[input.tier][input.billingCycle];

      if (!priceId) {
        throw new Error(`Price ID not configured for ${input.tier} ${input.billingCycle}`);
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        customer_email: input.userEmail,
        client_reference_id: input.userId,
        metadata: {
          userId: input.userId,
          tier: input.tier,
          billingCycle: input.billingCycle,
        },
        subscription_data: {
          metadata: {
            userId: input.userId,
            tier: input.tier,
            billingCycle: input.billingCycle,
          },
        },
      });

      console.log("[Stripe] Checkout session created:", session.id);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("[Stripe] Failed to create checkout session:", error);
      throw new Error("Failed to create checkout session");
    }
  });

export const createPortalSessionProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
      returnUrl: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log("[Stripe] Creating portal session for customer:", input.customerId);

      const session = await stripe.billingPortal.sessions.create({
        customer: input.customerId,
        return_url: input.returnUrl,
      });

      console.log("[Stripe] Portal session created:", session.id);

      return {
        url: session.url,
      };
    } catch (error) {
      console.error("[Stripe] Failed to create portal session:", error);
      throw new Error("Failed to create portal session");
    }
  });

export const getSubscriptionProcedure = publicProcedure
  .input(
    z.object({
      subscriptionId: z.string(),
    })
  )
  .query(async ({ input }) => {
    try {
      console.log("[Stripe] Fetching subscription:", input.subscriptionId);

      const subscription = await stripe.subscriptions.retrieve(input.subscriptionId);

      const currentPeriodEnd = (subscription as any).current_period_end || 0;
      const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end || false;
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : (subscription.customer as any)?.id || '';

      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        customerId,
      };
    } catch (error) {
      console.error("[Stripe] Failed to fetch subscription:", error);
      throw new Error("Failed to fetch subscription");
    }
  });

export const cancelSubscriptionProcedure = publicProcedure
  .input(
    z.object({
      subscriptionId: z.string(),
      immediate: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      console.log("[Stripe] Canceling subscription:", input.subscriptionId);

      let subscription;
      if (input.immediate) {
        subscription = await stripe.subscriptions.cancel(input.subscriptionId);
      } else {
        subscription = await stripe.subscriptions.update(input.subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      console.log("[Stripe] Subscription canceled:", subscription.id);

      return {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error("[Stripe] Failed to cancel subscription:", error);
      throw new Error("Failed to cancel subscription");
    }
  });

export const handleWebhookProcedure = publicProcedure
  .input(
    z.object({
      body: z.string(),
      signature: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

      if (!webhookSecret) {
        throw new Error("Webhook secret not configured");
      }

      const event = stripe.webhooks.constructEvent(
        input.body,
        input.signature,
        webhookSecret
      );

      console.log("[Stripe] Webhook event received:", event.type);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log("[Stripe] Checkout completed for user:", session.metadata?.userId);
          break;
        }

        case "customer.subscription.created": {
          const subscription = event.data.object as Stripe.Subscription;
          console.log("[Stripe] Subscription created:", subscription.id);
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as Stripe.Subscription;
          console.log("[Stripe] Subscription updated:", subscription.id);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          console.log("[Stripe] Subscription deleted:", subscription.id);
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          console.log("[Stripe] Invoice paid:", invoice.id);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          console.log("[Stripe] Payment failed:", invoice.id);
          break;
        }

        default:
          console.log("[Stripe] Unhandled event type:", event.type);
      }

      return { received: true };
    } catch (error) {
      console.error("[Stripe] Webhook error:", error);
      throw new Error("Webhook processing failed");
    }
  });

export const stripeRouter = {
  createCheckoutSession: createCheckoutSessionProcedure,
  createPortalSession: createPortalSessionProcedure,
  getSubscription: getSubscriptionProcedure,
  cancelSubscription: cancelSubscriptionProcedure,
  handleWebhook: handleWebhookProcedure,
};
