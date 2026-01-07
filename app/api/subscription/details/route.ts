import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth/verify';
import { prisma } from '@/lib/storage/prisma';
import { stripe } from '@/lib/stripe/config';

export async function GET(request: NextRequest) {
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userInfo.uid },
      select: {
        subscriptionStatus: true,
        subscriptionEndsAt: true,
        stripeSubscriptionId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionStatus: null,
        subscriptionStartDate: null,
        nextBillingDate: null,
      });
    }

    let subscriptionStartDate: Date | null = null;
    let nextBillingDate: Date | null = null;
    let currentPeriodStart: Date | null = null;

    // If we have a Stripe subscription ID, fetch details from Stripe
    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        );

        // Get subscription start date (when subscription was created)
        subscriptionStartDate = new Date(subscription.created * 1000);
        
        // Get current period start (when current billing period started)
        currentPeriodStart = new Date(subscription.current_period_start * 1000);
        
        // Get next billing date (when current period ends)
        nextBillingDate = new Date(subscription.current_period_end * 1000);
      } catch (error) {
        console.error('Error fetching subscription from Stripe:', error);
        // Fall back to database values
        nextBillingDate = user.subscriptionEndsAt;
      }
    } else {
      // Fall back to database values if no Stripe subscription ID
      nextBillingDate = user.subscriptionEndsAt;
    }

    return NextResponse.json({
      hasSubscription: !!user.subscriptionStatus,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionStartDate,
      currentPeriodStart,
      nextBillingDate,
    });
  } catch (error: any) {
    console.error('Error fetching subscription details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    );
  }
}
