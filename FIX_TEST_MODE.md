# Fix: Test Mode Customer Error

## Problem

You're seeing this error:
```
No such customer: 'cus_TkVkltc1XJBQST'; a similar object exists in live mode, but a test mode key was used to make this request.
```

This happens when:
- A Stripe customer was created in **Live mode**
- The customer ID is stored in your database
- You're now using **Test mode** keys
- Stripe can't find the customer because it's in a different mode

## ✅ Solution

I've updated the code to automatically handle this. The checkout route now:
1. Checks if the stored customer exists in the current mode (test/live)
2. If not found, automatically creates a new customer
3. Updates the database with the new customer ID

## Quick Fix (If Still Having Issues)

If you want to manually clear your test data:

### Option 1: Clear via Database (Recommended)

You can clear the customer ID for your user in the database:

```sql
-- Connect to your database and run:
UPDATE "User" 
SET "stripeCustomerId" = NULL, 
    "stripeSubscriptionId" = NULL,
    "subscriptionStatus" = NULL,
    "subscriptionEndsAt" = NULL
WHERE id = 'your-firebase-uid';
```

### Option 2: Use Prisma Studio

1. Run: `npx prisma studio`
2. Open the `User` table
3. Find your user
4. Clear the `stripeCustomerId` field
5. Save

### Option 3: Create a New Test User

Simply sign up with a different email address in test mode - it will create a fresh customer.

## How to Prevent This

1. **Always use Test mode keys for development:**
   - Keys starting with `sk_test_...`
   - Create products/prices in Test mode
   - Use test webhook secrets

2. **Use Live mode keys only in production:**
   - Keys starting with `sk_live_...`
   - Create products/prices in Live mode
   - Use live webhook secrets

3. **Keep test and live data separate:**
   - Test mode and Live mode are completely separate in Stripe
   - Customer IDs from one mode won't work in the other

## Testing Now

After the code update:
1. Try subscribing again
2. The system should automatically create a new test customer
3. The error should be resolved

If you still see the error, clear your customer ID using one of the options above.
