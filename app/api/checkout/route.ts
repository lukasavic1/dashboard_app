import { NextRequest, NextResponse } from 'next/server';
import { stripe, SUBSCRIPTION_PRICE_ID } from '@/lib/stripe/config';
import { verifyFirebaseToken } from '@/lib/auth/verify';
import {
  getOrCreateUser,
  updateStripeCustomerId,
  getUserByStripeCustomerId,
} from '@/lib/storage/subscription';

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

    const { uid, email } = userInfo;

    // Get or create user in database
    let user = await getOrCreateUser(uid, email || '');

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    let needsNewCustomer = !customerId;

    // If customer exists, verify it's valid in current mode (test/live)
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        // Customer exists and is valid in current mode
      } catch (error: any) {
        // Customer doesn't exist in current mode (likely created in different mode)
        // Clear it and create a new one
        console.log(`Customer ${customerId} not found in current mode, creating new customer`);
        customerId = null;
        needsNewCustomer = true;
      }
    }

    if (needsNewCustomer) {
      const customer = await stripe.customers.create({
        email: email || undefined,
        metadata: {
          firebaseUid: uid,
        },
      });

      customerId = customer.id;
      await updateStripeCustomerId(uid, customerId);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId ?? undefined,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: SUBSCRIPTION_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${request.nextUrl.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/subscription?canceled=true`,
      metadata: {
        firebaseUid: uid,
      },
      subscription_data: {
        metadata: {
          firebaseUid: uid,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
