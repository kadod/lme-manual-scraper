# Stripe Setup Guide

Complete guide for integrating Stripe payment processing with L Message SaaS.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Getting API Keys](#getting-api-keys)
4. [Webhook Configuration](#webhook-configuration)
5. [Environment Variables](#environment-variables)
6. [Local Testing](#local-testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Stripe account (business account recommended for production)
- Supabase project with Edge Functions enabled
- Node.js installed for Stripe CLI
- Access to environment variable configuration

---

## Stripe Account Setup

### 1. Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign up" and create an account
3. Complete business verification (required for production)
4. Enable test mode for development

### 2. Create Products and Prices

#### Free Plan (No Stripe setup needed)
- No payment required
- Tracked in database only

#### Pro Plan
1. Navigate to **Products** in Stripe Dashboard
2. Click **Add product**
3. Fill in product details:
   - Name: `L Message Pro Plan`
   - Description: `Professional plan with 10,000 friends and 50,000 messages/month`
   - Pricing model: `Recurring`
   - Price: `9800 JPY` per month
   - Billing period: `Monthly`
4. Click **Save product**
5. Copy the **Price ID** (e.g., `price_xxxxxxxxxxxxx`)

#### Enterprise Plan
1. Create another product:
   - Name: `L Message Enterprise Plan`
   - Description: `Enterprise plan with unlimited resources`
   - Pricing model: `Recurring`
   - Price: Custom (or fixed amount)
   - Billing period: `Monthly`
2. Click **Save product**
3. Copy the **Price ID**

---

## Getting API Keys

### 1. Test Mode Keys (Development)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Enable **Test mode** toggle (top right)
3. Navigate to **Developers > API keys**
4. Copy the following keys:
   - **Publishable key**: `pk_test_xxxxxxxxxxxxx`
   - **Secret key**: `sk_test_xxxxxxxxxxxxx`

### 2. Live Mode Keys (Production)

1. Complete business verification
2. Disable **Test mode**
3. Navigate to **Developers > API keys**
4. Copy the following keys:
   - **Publishable key**: `pk_live_xxxxxxxxxxxxx`
   - **Secret key**: `sk_live_xxxxxxxxxxxxx`

**WARNING**: Never commit secret keys to version control!

---

## Webhook Configuration

### 1. Create Webhook Endpoint

1. Navigate to **Developers > Webhooks**
2. Click **Add endpoint**
3. Enter webhook URL:
   - Development: `https://[project-ref].supabase.co/functions/v1/process-stripe-webhook`
   - Production: `https://[project-ref].supabase.co/functions/v1/process-stripe-webhook`
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_method.attached`
   - `payment_method.detached`
5. Click **Add endpoint**
6. Copy the **Signing secret**: `whsec_xxxxxxxxxxxxx`

### 2. Webhook Event Descriptions

| Event | Description | Action |
|-------|-------------|--------|
| `customer.subscription.created` | New subscription created | Create/update subscription record |
| `customer.subscription.updated` | Subscription changed | Update subscription status and period |
| `customer.subscription.deleted` | Subscription cancelled | Mark subscription as cancelled |
| `invoice.paid` | Invoice payment successful | Record invoice and update payment status |
| `invoice.payment_failed` | Invoice payment failed | Mark subscription as past_due |
| `payment_method.attached` | Payment method added | Save payment method details |
| `payment_method.detached` | Payment method removed | Delete payment method record |

---

## Environment Variables

### 1. Supabase Environment Variables

Add the following to your Supabase project settings:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # Use sk_live_xxx for production
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx  # Use pk_live_xxx for production

# Stripe Price IDs
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**How to set environment variables:**
1. Go to Supabase Dashboard
2. Navigate to **Settings > Edge Functions**
3. Add each environment variable
4. Redeploy Edge Functions

### 2. Next.js Environment Variables

Add to `.env.local`:

```bash
# Public (client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Private (server-side)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## Local Testing

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/vX.X.X/stripe_X.X.X_linux_x86_64.tar.gz
tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin

# Windows
scoop install stripe

# Or use npm
npm install -g stripe-cli
```

### 2. Login to Stripe CLI

```bash
stripe login
```

This will open a browser window to authorize the CLI.

### 3. Forward Webhooks to Local Development

```bash
# Forward webhooks to local Supabase Edge Function
stripe listen --forward-to http://localhost:54321/functions/v1/process-stripe-webhook
```

The CLI will output a webhook signing secret:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Use this secret for local testing.

### 4. Test Webhook Events

In another terminal, trigger test events:

```bash
# Test subscription created
stripe trigger customer.subscription.created

# Test invoice paid
stripe trigger invoice.paid

# Test payment failed
stripe trigger invoice.payment_failed
```

### 5. Monitor Webhook Logs

Check Supabase logs:
```bash
supabase functions logs process-stripe-webhook
```

---

## Production Deployment

### 1. Deploy Edge Functions

```bash
# Deploy Stripe webhook handler
supabase functions deploy process-stripe-webhook

# Deploy cron jobs
supabase functions deploy cleanup-expired-invitations
supabase functions deploy reset-daily-usage
```

### 2. Set Production Environment Variables

```bash
# Set via Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
supabase secrets set STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
supabase secrets set STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx

# Or via Supabase Dashboard
# Settings > Edge Functions > Environment Variables
```

### 3. Update Webhook Endpoint

1. Go to Stripe Dashboard
2. Navigate to **Developers > Webhooks**
3. Update endpoint URL to production:
   ```
   https://[project-ref].supabase.co/functions/v1/process-stripe-webhook
   ```
4. Copy new signing secret and update environment variable

### 4. Test Production Webhooks

1. Create a test subscription in Stripe Dashboard
2. Check webhook delivery status in Stripe
3. Verify database updates in Supabase
4. Check Edge Function logs

---

## Troubleshooting

### Common Issues

#### 1. Webhook Signature Verification Failed

**Error**: `Webhook Error: No signatures found matching the expected signature`

**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe Dashboard
- Check that webhook URL is correct
- Ensure Edge Function is deployed and running
- Verify no proxy is modifying headers

#### 2. Organization Not Found

**Error**: `Organization not found for customer: cus_xxxxx`

**Solution**:
- Verify subscription record exists with correct `stripe_customer_id`
- Check RLS policies allow service role access
- Ensure customer was created during subscription creation

#### 3. Webhook Timeout

**Error**: `Webhook delivery timeout`

**Solution**:
- Optimize database queries (add indexes)
- Return response quickly (within 5 seconds)
- Process heavy tasks asynchronously
- Check Edge Function logs for slow operations

#### 4. Duplicate Events

**Issue**: Same event processed multiple times

**Solution**:
- Implement idempotency keys
- Use `upsert` with unique constraints
- Check event IDs before processing
- Store processed event IDs

### Testing Checklist

- [ ] Webhook signature verification working
- [ ] Subscription created event updates database
- [ ] Subscription updated event reflects changes
- [ ] Subscription deleted event marks as cancelled
- [ ] Invoice paid event creates invoice record
- [ ] Invoice payment failed updates subscription status
- [ ] Payment method attached saves details
- [ ] Payment method detached removes record
- [ ] Idempotency prevents duplicate processing
- [ ] Error handling logs failures properly

### Debugging Commands

```bash
# Check Edge Function logs
supabase functions logs process-stripe-webhook --tail

# Test webhook locally
curl -X POST http://localhost:54321/functions/v1/process-stripe-webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: t=xxx,v1=xxx" \
  -d @webhook-test.json

# List Stripe customers
stripe customers list --limit 10

# List subscriptions
stripe subscriptions list --limit 10

# Retrieve specific subscription
stripe subscriptions retrieve sub_xxxxxxxxxxxxx
```

---

## Security Best Practices

### 1. API Key Security
- Never commit keys to version control
- Use environment variables for all keys
- Rotate keys regularly (every 90 days)
- Use different keys for test and production

### 2. Webhook Security
- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Validate event data before processing
- Implement rate limiting

### 3. Payment Flow Security
- Use SCA (Strong Customer Authentication)
- Validate amounts before charging
- Log all payment operations
- Implement fraud detection

### 4. Data Protection
- Encrypt sensitive payment data
- Follow PCI compliance guidelines
- Don't store full card numbers
- Use Stripe's secure payment forms

---

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Reference](https://stripe.com/docs/stripe-cli)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## Support

For issues or questions:
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Project Documentation: `/lme-saas/claudedocs/`

---

**Last Updated**: 2025-10-30
**Version**: 1.0
