# Stripe Initialization Error Fix

## Issue Summary
The billing page was throwing a `TypeError: Cannot read properties of undefined (reading 'match')` error when trying to initialize Stripe. This occurred because the `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable was not defined.

## Root Cause
In `/components/settings/AddPaymentMethodDialog.tsx`, the code was calling `loadStripe()` with an undefined value:
```typescript
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
```

When `process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is undefined, `loadStripe()` tries to call `.match()` on undefined internally, causing the error.

## Changes Made

### 1. Fixed AddPaymentMethodDialog.tsx
**File**: `/components/settings/AddPaymentMethodDialog.tsx`

**Changes**:
- Added a `getStripePromise()` helper function that validates the environment variable before calling `loadStripe()`
- Returns `null` if the publishable key is not defined, instead of attempting to initialize Stripe
- Added comprehensive null checks throughout the component
- Added user-friendly error message when Stripe is not configured
- Enhanced error handling for setup intent creation

**Key improvements**:
```typescript
// Before (unsafe):
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// After (safe with validation):
const getStripePromise = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined in environment variables')
    return null
  }

  return loadStripe(publishableKey)
}

const stripePromise = getStripePromise()
```

### 2. Updated Environment Configuration
**File**: `/.env.local`

**Added**:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with placeholder value
- `STRIPE_SECRET_KEY` with placeholder value
- `STRIPE_PRO_PRICE_ID` with placeholder value
- `STRIPE_ENTERPRISE_PRICE_ID` with placeholder value
- `STRIPE_WEBHOOK_SECRET` with placeholder value

### 3. Created Environment Example File
**File**: `/.env.example`

Created a comprehensive example file documenting all required environment variables with:
- Clear section headers
- Links to where to obtain each credential
- Example key formats

## Configuration Required

To enable Stripe functionality, update the following environment variables in `.env.local`:

```bash
# Get these from: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # or pk_live_... for production
STRIPE_SECRET_KEY=sk_test_...                    # or sk_live_... for production
STRIPE_PRO_PRICE_ID=price_...                    # Create price in Stripe dashboard
STRIPE_ENTERPRISE_PRICE_ID=price_...             # Create price in Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_...                  # From webhook settings
```

## User Experience

### Before Fix
- Application would crash with cryptic error: `TypeError: Cannot read properties of undefined (reading 'match')`
- No indication of what was wrong
- Poor developer experience

### After Fix
- If Stripe is not configured, users see a clear error message in Japanese:
  "Stripe が設定されていません。環境変数 NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY を設定してください。"
- Application continues to function (non-Stripe features work)
- Developers get console error with specific environment variable name
- Better error handling for API failures

## Testing Recommendations

1. **Without Stripe configured** (current state):
   - Open the Add Payment Method dialog
   - Should see friendly error message
   - No console errors about undefined

2. **With Stripe configured**:
   - Add valid Stripe keys to `.env.local`
   - Restart development server
   - Open Add Payment Method dialog
   - Should load Stripe payment form

3. **Error scenarios**:
   - Test with invalid Stripe keys
   - Test with network failures
   - Verify error messages are user-friendly

## Security Notes

- Server-side Stripe initialization (`/lib/stripe/client.ts`) already had proper error handling
- Client-side publishable keys are safe to expose (as intended by Stripe)
- Secret keys remain server-side only
- Added validation prevents accidental initialization with undefined values

## Files Modified

1. `/components/settings/AddPaymentMethodDialog.tsx` - Fixed Stripe initialization with proper null checks
2. `/.env.local` - Added Stripe environment variables with placeholders
3. `/.env.example` - Created comprehensive environment variable documentation
