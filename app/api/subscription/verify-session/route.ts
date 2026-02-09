import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth/verify';
import { stripe } from '@/lib/stripe/config';
import {
  getOrCreateUser,
  updateSubscription,
} from '@/lib/storage/subscription';
import Stripe from 'stripe';

// Helper function to safely extract subscription end date
function getSubscriptionEndDate(subscription: Stripe.Subscription): Date | null {
  const currentPeriodEnd = (subscription as any).current_period_end;
  if (currentPeriodEnd && typeof currentPeriodEnd === 'number') {
    return new Date(currentPeriodEnd * 1000);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase authentication
    const authHeader = request.headers.get('authorization');
    const userInfo = await verifyFirebaseToken(authHeader);

    if (!userInfo) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    // Verify this session belongs to the current user
    const firebaseUid = session.metadata?.firebaseUid;
    if (firebaseUid && firebaseUid !== userInfo.uid) {
      return NextResponse.json(
        { error: 'Session does not belong to this user' },
        { status: 403 }
      );
    }

    // Get subscription ID from session
    const subscriptionId = session.subscription as string;

    if (!subscriptionId) {
      return NextResponse.json({
        hasActiveSubscription: false,
        message: 'No subscription found in session',
      });
    }

    // Retrieve subscription details from Stripe
    const subscription = (await stripe.subscriptions.retrieve(
      subscriptionId
    )) as Stripe.Subscription;

    // Ensure user exists in database
    await getOrCreateUser(
      userInfo.uid,
      session.customer_email || userInfo.email || ''
    );

    // Update subscription in database
    const subscriptionEndsAt = getSubscriptionEndDate(subscription);
    await updateSubscription(userInfo.uid, {
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      subscriptionEndsAt,
    });

    // Check if subscription is active
    const isActive =
      subscription.status === 'active' || subscription.status === 'trialing';

    return NextResponse.json({
      hasActiveSubscription: isActive,
      subscriptionStatus: subscription.status,
      subscriptionEndsAt,
    });
  } catch (error: any) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to verify session',
        hasActiveSubscription: false,
      },
      { status: 500 }
    );
  }
}
