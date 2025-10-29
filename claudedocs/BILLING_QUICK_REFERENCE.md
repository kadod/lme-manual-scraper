# Billing & Stripe Integration - Quick Reference

## Server Actions Overview

### Subscription Management

#### `getSubscription()`
Returns current subscription details
- **Access**: All members
- **Returns**: `Subscription | null`

#### `getUsageLimits()`
Returns limits, usage, remaining, and percentages
- **Access**: All members
- **Returns**: `UsageLimits | null`

#### `checkUsageLimit(resource)`
Check if resource is available before operation
- **Access**: All members
- **Params**: `resource: 'friends' | 'messages_per_month' | 'staff_accounts' | etc.`
- **Returns**: `boolean`

#### `createCheckoutSession({ plan, success_url, cancel_url })`
Create Stripe checkout for plan upgrade
- **Access**: Owner only
- **Returns**: `{ sessionId: string, url: string }`

#### `changePlan({ plan })`
Change subscription plan (upgrade/downgrade)
- **Access**: Owner only
- **Params**: `{ plan: 'free' | 'pro' | 'enterprise' }`

#### `cancelSubscription()`
Cancel subscription at period end
- **Access**: Owner only

#### `reactivateSubscription()`
Undo cancellation
- **Access**: Owner only

---

### Payment Methods

#### `getPaymentMethods()`
List all saved payment methods
- **Access**: Owner only
- **Returns**: `PaymentMethod[]`

#### `addPaymentMethod({ payment_method_id })`
Add new payment method from Stripe Elements
- **Access**: Owner only
- **Params**: `{ payment_method_id: string }`

#### `setDefaultPaymentMethod({ payment_method_id })`
Set default payment method
- **Access**: Owner only

#### `removePaymentMethod({ payment_method_id })`
Delete payment method (cannot remove default)
- **Access**: Owner only

---

### Invoices

#### `getInvoices()`
Get last 12 invoices
- **Access**: All members
- **Returns**: `Invoice[]`

#### `downloadInvoice(invoiceId)`
Get invoice PDF URL
- **Access**: All members
- **Returns**: `string | null`

---

## Plan Limits Reference

### Free Plan (¥0/month)
```typescript
{
  friends: 1000,
  messages_per_month: 5000,
  staff_accounts: 3,
  forms: 10,
  rich_menus: 5,
  api_calls_per_day: 1000
}
```

### Pro Plan (¥9,800/month)
```typescript
{
  friends: 10000,
  messages_per_month: 50000,
  staff_accounts: 10,
  forms: -1,        // unlimited
  rich_menus: -1,   // unlimited
  api_calls_per_day: 10000
}
```

### Enterprise Plan (Custom)
```typescript
{
  friends: -1,              // unlimited
  messages_per_month: -1,   // unlimited
  staff_accounts: -1,       // unlimited
  forms: -1,                // unlimited
  rich_menus: -1,           // unlimited
  api_calls_per_day: -1     // unlimited
}
```

---

## Usage Pattern Examples

### Before Adding a Friend
```typescript
const canAdd = await checkUsageLimit('friends')
if (!canAdd) {
  toast.error('Friend limit reached. Please upgrade your plan.')
  return
}
// Proceed with adding friend
```

### Display Usage Gauge
```typescript
const limits = await getUsageLimits()
if (limits) {
  const friendsUsed = limits.usage.friends
  const friendsLimit = limits.limits.friends
  const friendsPercent = limits.percentages.friends

  // Show: "456 / 10,000 (4.6%)"
}
```

### Upgrade Flow
```typescript
'use client'
import { createCheckoutSession } from '@/app/actions/billing'

async function handleUpgrade() {
  const result = await createCheckoutSession({
    plan: 'pro',
    success_url: `${window.location.origin}/dashboard/settings/billing?success=true`,
    cancel_url: `${window.location.origin}/dashboard/settings/billing`
  })

  // Redirect to Stripe Checkout
  window.location.href = result.url
}
```

### Cancel Subscription
```typescript
const handleCancel = async () => {
  if (confirm('Are you sure you want to cancel?')) {
    await cancelSubscription()
    toast.success('Subscription will be cancelled at period end')
  }
}
```

---

## Environment Variables

```env
# Required Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxx              # Server-side key
STRIPE_PRO_PRICE_ID=price_xxx              # Pro plan Price ID
STRIPE_ENTERPRISE_PRICE_ID=price_xxx       # Enterprise Price ID
STRIPE_WEBHOOK_SECRET=whsec_xxx            # Webhook secret

# App Configuration
NEXT_PUBLIC_APP_URL=https://lme-saas.com   # For redirects
```

---

## File Locations

- **Server Actions**: `/lme-saas/app/actions/billing.ts`
- **Stripe Client**: `/lme-saas/lib/stripe/client.ts`
- **Type Definitions**: `/lme-saas/types/billing.ts`

---

## Common Errors

### "Unauthorized: User not authenticated"
- User is not logged in
- Session expired

### "Permission denied: Only organization owners..."
- Non-owner trying to manage billing
- Check user role in user_organizations

### "Subscription not found"
- Organization doesn't have subscription record
- Database inconsistency

### "Cannot remove default payment method..."
- Trying to delete the default payment method
- Set another as default first

### "Stripe customer not found"
- No customer ID in subscription record
- Customer will be created on first checkout

---

## Security Notes

1. All billing operations require authentication
2. Only owners can manage billing
3. All Stripe operations are server-side only
4. No Stripe secrets in client code
5. RLS policies enforce data access
6. Webhook signatures must be verified

---

## Performance Tips

1. Cache subscription data in client state
2. Use React Query for server state management
3. Debounce usage checks
4. Preload payment methods on billing page
5. Show optimistic UI during operations

---

## Testing Stripe Integration

### Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### Webhook Testing
Use Stripe CLI to forward webhooks to localhost:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Test Mode
All development uses Stripe test mode (sk_test_xxx keys)

---

## Quick Checklist

- [ ] Stripe SDK installed: `npm install stripe`
- [ ] Environment variables configured
- [ ] Type definitions imported
- [ ] Server Actions created
- [ ] Stripe client initialized
- [ ] Owner-only permissions enforced
- [ ] Error handling implemented
- [ ] Webhook endpoint ready
- [ ] Test cards verified
- [ ] Frontend components ready
