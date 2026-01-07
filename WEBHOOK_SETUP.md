# Webhook Setup Guide (Without Stripe CLI)

If you don't want to install Stripe CLI, here are alternative ways to test webhooks:

## Option 1: Install Stripe CLI (Recommended)

### macOS (Homebrew)
```bash
brew install stripe/stripe-cli/stripe
```

### macOS (Manual)
1. Download from: https://github.com/stripe/stripe-cli/releases/latest
2. Download `stripe_X.X.X_macOS_arm64.tar.gz` (or `amd64` for Intel Macs)
3. Extract and move to `/usr/local/bin`:
   ```bash
   tar -xzf stripe_X.X.X_macOS_arm64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

### Verify Installation
```bash
stripe --version
```

### Login and Forward Webhooks
```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will show you a webhook secret like `whsec_...` - use that in your `.env.local`

---

## Option 2: Use ngrok (Alternative for Local Testing)

1. **Install ngrok:**
   ```bash
   brew install ngrok
   # Or download from: https://ngrok.com/download
   ```

2. **Start your Next.js server:**
   ```bash
   npm run dev
   ```

3. **Expose your local server:**
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Set up webhook in Stripe Dashboard:**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test) (Test mode)
   - **Developers** → **Webhooks** → **Add endpoint**
   - Endpoint URL: `https://abc123.ngrok.io/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the **Signing secret** (`whsec_...`)

6. **Add to `.env.local`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## Option 3: Deploy to Vercel and Test There

1. **Deploy your app to Vercel:**
   ```bash
   vercel
   ```

2. **Set up webhook in Stripe Dashboard:**
   - Endpoint URL: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select the same events as above
   - Copy the webhook secret

3. **Add webhook secret to Vercel environment variables**

---

## Option 4: Test Without Webhooks (Limited)

You can test the checkout flow without webhooks, but subscriptions won't automatically activate. You'd need to manually update the database or use Stripe Dashboard to verify payments.

**For full testing, webhooks are recommended.**

---

## Quick Test Setup (Recommended)

1. **Install Stripe CLI:**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login:**
   ```bash
   stripe login
   ```

3. **In one terminal, start webhook forwarding:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   Copy the `whsec_...` secret shown

4. **In another terminal, start your app:**
   ```bash
   npm run dev
   ```

5. **Add to `.env.local`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_... # From step 3
   ```

6. **Test the flow:**
   - Sign up/login
   - Go to subscription page
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
   - Webhook will automatically update subscription status!

---

## Troubleshooting

**"command not found: stripe"**
- Make sure installation completed
- Try: `brew install stripe/stripe-cli/stripe` again
- Or use manual installation method above

**Webhook not receiving events**
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Check that webhook secret matches
- Verify your server is running on port 3000

**ngrok URL changes**
- Free ngrok URLs change each time
- Update webhook endpoint in Stripe Dashboard when URL changes
- Or use ngrok's paid plan for static URLs
