import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/config';
import {
  getUserByStripeCustomerId,
  getUserByStripeSubscriptionId,
  updateSubscription,
  getOrCreateUser,
} from '@/lib/storage/subscription';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const firebaseUid = session.metadata?.firebaseUid;

        if (subscriptionId) {
          // Get subscription details
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as Stripe.Subscription;

          if (firebaseUid) {
            // Ensure user exists
            await getOrCreateUser(firebaseUid, session.customer_email || '');
            await updateSubscription(firebaseUid, {
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: subscription.status,
              subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
            });
          } else if (customerId) {
            // Try to find user by customer ID
            const user = await getUserByStripeCustomerId(customerId);
            if (user) {
              await updateSubscription(user.id, {
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: subscription.status,
                subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
              });
            }
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const firebaseUid = subscription.metadata?.firebaseUid;

        if (firebaseUid) {
          await updateSubscription(firebaseUid, {
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: subscription.status,
            subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
          });
        } else {
          // Try to find user by customer ID
          const user = await getUserByStripeCustomerId(customerId);
          if (user) {
            await updateSubscription(user.id, {
              stripeSubscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const firebaseUid = subscription.metadata?.firebaseUid;

        if (firebaseUid) {
          await updateSubscription(firebaseUid, {
            subscriptionStatus: 'canceled',
            subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
          });
        } else {
          const user = await getUserByStripeSubscriptionId(subscription.id);
          if (user) {
            await updateSubscription(user.id, {
              subscriptionStatus: 'canceled',
              subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
            });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as Stripe.Subscription;
          const firebaseUid = subscription.metadata?.firebaseUid;

          if (firebaseUid) {
            await updateSubscription(firebaseUid, {
              subscriptionStatus: subscription.status,
              subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
            });
          } else {
            const user = await getUserByStripeSubscriptionId(subscriptionId);
            if (user) {
              await updateSubscription(user.id, {
                subscriptionStatus: subscription.status,
                subscriptionEndsAt: new Date((subscription as any).current_period_end * 1000),
              });
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as Stripe.Subscription;
          const firebaseUid = subscription.metadata?.firebaseUid;

          if (firebaseUid) {
            await updateSubscription(firebaseUid, {
              subscriptionStatus: subscription.status,
            });
          } else {
            const user = await getUserByStripeSubscriptionId(subscriptionId);
            if (user) {
              await updateSubscription(user.id, {
                subscriptionStatus: subscription.status,
              });
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook route (Stripe needs raw body)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
