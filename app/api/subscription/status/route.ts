import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseToken } from '@/lib/auth/verify';
import { hasActiveSubscription } from '@/lib/storage/subscription';
import { prisma } from '@/lib/storage/prisma';

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

    try {
      // First check database
      const subscriptionStatus = await hasActiveSubscription(userInfo.uid);
      
      // If we have an active subscription in DB, return it
      if (subscriptionStatus.hasActiveSubscription) {
        return NextResponse.json(subscriptionStatus);
      }

      // If not active in DB, check Stripe directly as fallback
      // This helps in test mode when webhooks might not have fired yet
      const user = await prisma.user.findUnique({
        where: { id: userInfo.uid },
        select: {
          stripeCustomerId: true,
          stripeSubscriptionId: true,
        },
      });

      if (user?.stripeCustomerId) {
        try {
          // Lazy-load Stripe so route works when STRIPE_SECRET_KEY is unset (avoids 500)
          const { stripe } = await import('@/lib/stripe/config');
          const subscriptions = await stripe.subscriptions.list({
            customer: user.stripeCustomerId,
            status: 'all',
            limit: 1,
          });

          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0];
            const isActive = subscription.status === 'active' || subscription.status === 'trialing';
            
            if (isActive) {
              // Update database with Stripe data
              const currentPeriodEnd = (subscription as any).current_period_end;
              const subscriptionEndsAt = currentPeriodEnd 
                ? new Date(currentPeriodEnd * 1000) 
                : null;

              await prisma.user.update({
                where: { id: userInfo.uid },
                data: {
                  stripeSubscriptionId: subscription.id,
                  subscriptionStatus: subscription.status,
                  subscriptionEndsAt,
                },
              });

              return NextResponse.json({
                hasActiveSubscription: true,
                subscriptionStatus: subscription.status,
                subscriptionEndsAt,
              });
            }
          }
        } catch (stripeError: any) {
          console.error('Error checking Stripe directly:', stripeError);
          // Fall through to return DB status
        }
      }

      // Return database status (which may be inactive)
      return NextResponse.json(subscriptionStatus);
    } catch (dbError: any) {
      console.error('Database error checking subscription status:', {
        error: dbError,
        message: dbError?.message,
        stack: dbError?.stack,
        uid: userInfo.uid,
      });
      
      // Return a safe default response instead of 500
      // This prevents infinite redirect loops
      return NextResponse.json({
        hasActiveSubscription: false,
        subscriptionStatus: null,
        subscriptionEndsAt: null,
      });
    }
  } catch (error: any) {
    console.error('Error checking subscription status:', {
      error,
      message: error?.message,
      stack: error?.stack,
    });
    
    // Return a safe default response instead of 500
    // This prevents infinite redirect loops
    return NextResponse.json({
      hasActiveSubscription: false,
      subscriptionStatus: null,
      subscriptionEndsAt: null,
    });
  }
}
