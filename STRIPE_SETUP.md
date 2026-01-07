# Stripe Subscription Setup Guide

This guide will help you set up Stripe subscriptions for your SaaS product.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Firebase Admin SDK service account key
3. Database migration completed

## Step 1: Create Stripe Products and Prices

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. **Make sure you're in Test mode** (toggle in top right corner)
3. Go to **Products** → **Add Product**
4. Create a product (e.g., "Premium Subscription")
5. Set up a recurring price:
   - Choose **Recurring** billing
   - Set your price (e.g., $9.99/month)
   - Set billing period (Monthly or Yearly)
   - Save the **Price ID** (starts with `price_...`)
6. **Important:** Create separate products/prices for Test mode and Live mode

## Step 2: Get Stripe API Keys

1. In Stripe Dashboard, make sure you're in **Test mode** (toggle in top right)
2. Go to **Developers** → **API keys**
3. Copy your **Secret key** (starts with `sk_test_...` for test mode)
4. **Important:** Make sure you're using Test mode keys for development
5. For production, switch to **Live mode** and use `sk_live_...` keys

## Step 3: Set Up Webhook Endpoint

**For Local Development (Recommended):**
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret shown (starts with `whsec_...`)
5. Use this secret in your `.env.local` as `STRIPE_WEBHOOK_SECRET`

**For Production/Testing:**
1. In Stripe Dashboard, make sure you're in **Test mode**
2. Go to **Developers** → **Webhooks**
3. Click **Add endpoint**
4. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
5. Select these events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Copy the **Signing secret** (starts with `whsec_...`)
7. **Important:** Use Test mode webhook secret for development, Live mode for production

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PRICE_ID=price_... # The Price ID from Step 1
STRIPE_WEBHOOK_SECRET=whsec_... # The webhook signing secret from Step 3

# Firebase Admin SDK (for server-side token verification)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...",...}'
# Get this from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
```

## Step 5: Run Database Migration

```bash
npx prisma migrate dev
```

This will create the `User` table with subscription tracking fields.

## Step 6: Test Locally with Stripe CLI (Optional)

For local development, use Stripe CLI to forward webhooks:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
4. Copy the webhook signing secret shown in the terminal
5. Use that secret in your `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 7: Test the Flow

1. Start your development server: `npm run dev`
2. Sign up or log in to your app
3. You should be redirected to `/subscription` page
4. Click "Subscribe Now"
5. Complete the Stripe Checkout using one of the test cards below
6. After successful payment, you should be redirected to the dashboard
7. Check your Stripe Dashboard to see the subscription

### Test Credit Cards (Test Mode Only)

When using **Test mode** keys (`sk_test_...`), Stripe automatically accepts these test cards. **No real money is charged!**

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

**Other Test Cards:**
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`
- **Insufficient Funds:** `4000 0000 0000 9995`

**3D Secure Test Cards:**
- Card: `4000 0027 6000 3184`
- Will prompt for authentication (click "Complete authentication")

**Full list:** https://stripe.com/docs/testing#cards

## How It Works

1. **User Registration/Login**: Users are created in Firebase Auth
2. **Subscription Check**: On login, the app checks if user has an active subscription
3. **Redirect Logic**: 
   - If no subscription → redirect to `/subscription`
   - If active subscription → redirect to `/dashboard`
4. **Checkout Flow**:
   - User clicks "Subscribe Now" on subscription page
   - API creates Stripe Checkout session
   - User completes payment on Stripe
   - Stripe sends webhook to update subscription status
5. **Webhook Processing**: 
   - Webhooks update user subscription status in database
   - Handles subscription creation, updates, cancellations, and renewals
6. **Auto-Renewal**: Stripe automatically renews subscriptions at the end of each billing period

## Subscription Status Tracking

The system tracks:
- `subscriptionStatus`: Current status (active, canceled, past_due, etc.)
- `subscriptionEndsAt`: When the current period ends
- `stripeCustomerId`: Stripe customer ID
- `stripeSubscriptionId`: Stripe subscription ID

## Troubleshooting

### Webhook not working?
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify webhook endpoint URL in Stripe Dashboard
- Check server logs for webhook errors
- Use Stripe CLI for local testing

### Users not being redirected?
- Check that Firebase Admin SDK is configured
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set
- Check browser console for errors

### Subscription not updating?
- Check webhook events in Stripe Dashboard
- Verify database connection
- Check that webhook secret matches

## Production Deployment

1. Use **Live mode** Stripe keys
2. Update webhook endpoint URL to your production domain
3. Set all environment variables in your hosting platform
4. Test with real payment methods (use small amounts first!)

## Security Notes

- Never commit `.env.local` or environment variables to git
- Use environment variables for all secrets
- Webhook signature verification prevents unauthorized requests
- Firebase token verification ensures only authenticated users can create checkout sessions
