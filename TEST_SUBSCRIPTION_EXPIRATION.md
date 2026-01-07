# Testing Subscription Expiration

Here are several ways to test what happens when a subscription expires:

## Method 1: Using Test API Endpoints (Easiest)

I've created test endpoints that only work in development mode:

### Expire Subscription

```bash
# Get your Firebase token first, then:
curl -X POST http://localhost:3000/api/test/expire-subscription \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Or create a simple test button in your profile page (see below).

### Restore Subscription

```bash
curl -X POST http://localhost:3000/api/test/restore-subscription \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

This will restore your subscription status from Stripe.

---

## Method 2: Using Stripe Dashboard

1. Go to [Stripe Dashboard (Test Mode)](https://dashboard.stripe.com/test)
2. Navigate to **Customers** → Find your customer
3. Click on the subscription
4. Click **Cancel subscription** or **Update subscription**
5. Set it to cancel at period end
6. The webhook will automatically update your database

---

## Method 3: Using Stripe CLI to Trigger Events

You can manually trigger webhook events:

```bash
# Cancel a subscription
stripe trigger customer.subscription.deleted

# Or update subscription status
stripe trigger customer.subscription.updated
```

Note: You'll need to provide the subscription ID in the event data.

---

## Method 4: Direct Database Update

Using Prisma Studio:

```bash
npx prisma studio
```

1. Open the `User` table
2. Find your user
3. Update:
   - `subscriptionStatus` → `"canceled"` or `"past_due"`
   - `subscriptionEndsAt` → Set to a past date (e.g., yesterday)

Or using SQL:

```sql
UPDATE "User" 
SET "subscriptionStatus" = 'canceled',
    "subscriptionEndsAt" = NOW() - INTERVAL '1 day'
WHERE id = 'your-firebase-uid';
```

---

## Method 5: Add Test Buttons to Profile Page

Add these buttons to your profile page for easy testing (development only):

```tsx
{process.env.NODE_ENV === 'development' && (
  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-sm font-medium text-yellow-800 mb-2">Test Tools (Dev Only)</p>
    <div className="flex gap-2">
      <button onClick={handleExpireSubscription}>
        Simulate Expiration
      </button>
      <button onClick={handleRestoreSubscription}>
        Restore Subscription
      </button>
    </div>
  </div>
)}
```

---

## What to Test

After expiring a subscription, verify:

1. ✅ **Redirect to Subscription Page**
   - Try accessing `/dashboard`
   - Should redirect to `/subscription`

2. ✅ **Profile Page Shows Expired Status**
   - Go to `/profile`
   - Should show "Canceled" or "No Subscription"

3. ✅ **Subscription Status Check**
   - API `/api/subscription/status` should return `hasActiveSubscription: false`

4. ✅ **Can Resubscribe**
   - Go to `/subscription`
   - Click "Subscribe Now"
   - Should be able to create a new subscription

---

## Restoring After Testing

After testing, restore your subscription using:

1. **Test API endpoint** (Method 1)
2. **Stripe Dashboard** - Reactivate the subscription
3. **Database** - Update status back to "active" and set future `subscriptionEndsAt`

---

## Expected Behavior

When subscription expires:

- ❌ Cannot access dashboard (redirects to `/subscription`)
- ✅ Profile shows expired/canceled status
- ✅ Can resubscribe from subscription page
- ✅ Webhook updates database automatically (if using Stripe)
