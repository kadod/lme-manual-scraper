# Edge Functions Deployment Checklist

Quick reference for deploying Stripe webhook and system maintenance Edge Functions.

---

## Pre-Deployment

### 1. Stripe Account Setup
- [ ] Stripe account created and verified
- [ ] Pro plan product created (9,800 JPY/month)
- [ ] Enterprise plan product created (custom pricing)
- [ ] Price IDs copied for both plans
- [ ] Test mode enabled for initial testing

### 2. Environment Variables Prepared
- [ ] `STRIPE_SECRET_KEY` (test: sk_test_xxx, prod: sk_live_xxx)
- [ ] `STRIPE_PUBLISHABLE_KEY` (test: pk_test_xxx, prod: pk_live_xxx)
- [ ] `STRIPE_PRO_PRICE_ID` (price_xxx)
- [ ] `STRIPE_ENTERPRISE_PRICE_ID` (price_xxx)
- [ ] `STRIPE_WEBHOOK_SECRET` (whsec_xxx)
- [ ] `SUPABASE_URL` (project URL)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (service role key)

---

## Deployment Steps

### 1. Set Environment Variables in Supabase

```bash
# Using Supabase CLI
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
supabase secrets set STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
supabase secrets set STRIPE_ENTERPRISE_PRICE_ID=price_xxxxxxxxxxxxx
```

Or via Supabase Dashboard:
- Settings > Edge Functions > Environment Variables

### 2. Deploy Edge Functions

```bash
# Deploy Stripe webhook handler
supabase functions deploy process-stripe-webhook

# Deploy cron jobs
supabase functions deploy cleanup-expired-invitations
supabase functions deploy reset-daily-usage

# Verify deployment
supabase functions list
```

### 3. Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers > Webhooks**
3. Click **Add endpoint**
4. Enter webhook URL:
   ```
   https://[your-project-ref].supabase.co/functions/v1/process-stripe-webhook
   ```
5. Select events:
   - [x] customer.subscription.created
   - [x] customer.subscription.updated
   - [x] customer.subscription.deleted
   - [x] invoice.paid
   - [x] invoice.payment_failed
   - [x] payment_method.attached
   - [x] payment_method.detached
6. Click **Add endpoint**
7. Copy the signing secret (whsec_xxx)
8. Update environment variable:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

## Testing

### 1. Local Testing with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local development
stripe listen --forward-to http://localhost:54321/functions/v1/process-stripe-webhook

# In another terminal, trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.paid
```

### 2. Production Testing

```bash
# Test webhook endpoint
curl -X POST https://[project-ref].supabase.co/functions/v1/process-stripe-webhook \
  -H "Content-Type: application/json"

# Test cleanup function
curl -X POST https://[project-ref].supabase.co/functions/v1/cleanup-expired-invitations

# Test usage reset function
curl -X POST https://[project-ref].supabase.co/functions/v1/reset-daily-usage
```

### 3. Monitor Logs

```bash
# Watch logs in real-time
supabase functions logs process-stripe-webhook --tail
supabase functions logs cleanup-expired-invitations --tail
supabase functions logs reset-daily-usage --tail
```

---

## Verification Checklist

### Stripe Webhook
- [ ] Webhook endpoint responds with 200 status
- [ ] Signature verification working
- [ ] Subscription created event updates database
- [ ] Subscription updated event modifies status
- [ ] Subscription deleted event marks as cancelled
- [ ] Invoice paid event creates invoice record
- [ ] Invoice payment failed updates subscription
- [ ] Payment method attached saves details
- [ ] Payment method detached removes record
- [ ] No errors in Supabase logs
- [ ] Stripe Dashboard shows successful deliveries

### Cron Jobs
- [ ] cleanup-expired-invitations scheduled for 3:00 AM
- [ ] reset-daily-usage scheduled for midnight
- [ ] Both jobs appear in _cron.yml
- [ ] Manual invocation works correctly
- [ ] Logs show successful execution
- [ ] Database updates are correct

### Database
- [ ] Subscriptions table updated by webhooks
- [ ] Invoices table populated correctly
- [ ] Payment methods saved properly
- [ ] Invitations marked as expired
- [ ] Usage counters reset daily
- [ ] No constraint violations

---

## Post-Deployment

### 1. Monitoring Setup
- [ ] Check Stripe webhook delivery success rate
- [ ] Monitor Edge Function error rates
- [ ] Set up alerts for failures
- [ ] Review logs daily for first week

### 2. Production Switch
- [ ] Switch Stripe to live mode
- [ ] Update environment variables with live keys
- [ ] Update webhook endpoint in Stripe
- [ ] Test with real subscription
- [ ] Verify invoice generation

### 3. Documentation
- [ ] Update team documentation
- [ ] Share Stripe setup guide
- [ ] Document troubleshooting steps
- [ ] Create runbook for on-call

---

## Rollback Procedure

If issues occur:

```bash
# 1. Disable webhook in Stripe Dashboard
# Developers > Webhooks > [Your endpoint] > Disable

# 2. Rollback Edge Functions
supabase functions deploy process-stripe-webhook --rollback

# 3. Disable cron jobs temporarily
# Comment out in _cron.yml and redeploy

# 4. Investigate logs
supabase functions logs process-stripe-webhook --since 1h

# 5. Fix issues and redeploy
```

---

## Common Issues

### Issue: Webhook signature verification failed
**Solution**: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### Issue: Organization not found
**Solution**: Ensure subscription record exists with `stripe_customer_id`

### Issue: Webhook timeout
**Solution**: Optimize database queries, check indexes

### Issue: Duplicate events
**Solution**: Verify idempotency with `upsert` and unique constraints

---

## Support Resources

- **Stripe Setup Guide**: `/lme-saas/claudedocs/stripe-setup-guide.md`
- **Implementation Summary**: `/claudedocs/AGENT10_EDGE_FUNCTIONS_IMPLEMENTATION_SUMMARY.md`
- **Stripe Documentation**: https://stripe.com/docs
- **Supabase Documentation**: https://supabase.com/docs/guides/functions

---

## Emergency Contacts

- Stripe Support: https://support.stripe.com
- Supabase Discord: https://discord.supabase.com
- Project Lead: [Your contact info]

---

**Last Updated**: 2025-10-30
**Version**: 1.0
