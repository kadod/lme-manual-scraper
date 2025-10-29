# L Message SaaS Deployment Guide

**Project**: L Message SaaS (complete recreation)
**Database**: Supabase (powrxrjblbxrfrqskvye)
**Target**: Production deployment
**Date**: 2025-10-29

---

## Prerequisites

### Required Accounts & Access
- [ ] Supabase account with project access
- [ ] Vercel account (or alternative hosting)
- [ ] LINE Developers account
- [ ] LINE Messaging API channel created
- [ ] Domain name (optional, for custom domain)

### LINE API Setup
1. Create LINE Messaging API channel at https://developers.line.biz/
2. Get required credentials:
   - Channel Access Token (long-lived)
   - Channel Secret
   - Webhook URL (will be Supabase Edge Function URL)
3. Enable required features:
   - Messaging API
   - Rich Menu
   - LIFF (for form integration)
   - Webhook

### Local Setup Verification
- [ ] Project builds successfully (`npm run build`)
- [ ] All environment variables configured
- [ ] Database connection working
- [ ] Development server runs without errors

---

## Phase 1: Database Deployment

### Step 1: Verify Supabase CLI Installation

```bash
# Check Supabase CLI version
supabase --version

# If not installed:
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### Step 2: Link to Production Project

```bash
# Navigate to project directory
cd lme-saas

# Link to production project
supabase link --project-ref powrxrjblbxrfrqskvye

# You'll be prompted to enter your Supabase password
```

### Step 3: Review Database Migrations

All migrations are in `supabase/migrations/` directory:

**Core Tables** (Phase 1):
- `20251029_create_organizations.sql` - Organizations
- `20251029_create_friends.sql` - Friends/contacts
- `20251029_create_tags.sql` - Tags system
- `20251029_create_segments.sql` - Dynamic segments
- `20251029_create_custom_fields.sql` - Custom fields
- `20251029_create_auth_triggers.sql` - Auth hooks

**Message System** (Phase 2):
- `20251029_create_messages.sql` - Broadcast messages
- `20251029_create_step_campaigns.sql` - Step campaigns
- `20251029_create_message_templates.sql` - Templates
- `20251029_create_scheduled_messages.sql` - Scheduling

**Forms** (Phase 3):
- `20251029_create_forms.sql` - Form definitions
- `20251029_create_form_fields.sql` - Form fields
- `20251029_create_form_responses.sql` - Form responses
- `20251029_create_form_analytics.sql` - Form analytics

**Rich Menus** (Phase 4):
- `20251029_create_rich_menus.sql` - Rich menu definitions
- `20251029_create_rich_menu_areas.sql` - Tap areas
- `20251029_create_rich_menu_deployments.sql` - Deployment tracking

**Indexes & RLS**:
- `20251029_create_indexes.sql` - 76 performance indexes
- `20251029_setup_rls_policies.sql` - 113 RLS policies

### Step 4: Push Migrations to Production

```bash
# Review what will be changed
supabase db diff

# Push all migrations
supabase db push

# Verify migrations applied successfully
supabase migration list
```

**Expected Output**:
```
Applying migration 20251029_create_organizations.sql...
Applying migration 20251029_create_friends.sql...
...
✓ All migrations applied successfully
```

### Step 5: Verify Database Setup

```bash
# Check tables created
supabase db list

# Run SQL to verify tables
psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"
```

**Expected tables** (26+):
- organizations
- friends
- tags
- friend_tags
- segments
- segment_conditions
- custom_fields
- friend_custom_fields
- messages
- message_deliveries
- step_campaigns
- step_campaign_steps
- message_templates
- forms
- form_fields
- form_responses
- form_analytics
- rich_menus
- rich_menu_areas
- rich_menu_deployments
- ... and more

### Step 6: Create Test Organization

```bash
# Connect to database
psql $DATABASE_URL

# Create test organization
INSERT INTO organizations (id, name, line_channel_id, line_channel_secret, line_channel_access_token, subscription_plan, settings)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Test Organization',
  'YOUR_LINE_CHANNEL_ID',
  'YOUR_LINE_CHANNEL_SECRET',
  'YOUR_LINE_CHANNEL_ACCESS_TOKEN',
  'pro',
  '{}'
);

# Verify organization created
SELECT id, name, subscription_plan FROM organizations;
```

### Checklist: Database Deployment

- [ ] Supabase CLI installed and authenticated
- [ ] Linked to production project (powrxrjblbxrfrqskvye)
- [ ] Reviewed all migration files
- [ ] Pushed migrations successfully
- [ ] Verified all 26+ tables created
- [ ] Verified indexes created (76 indexes)
- [ ] Verified RLS policies enabled (113 policies)
- [ ] Created test organization
- [ ] Tested database connection from Next.js app

---

## Phase 2: Edge Functions Deployment

### Step 1: Review Edge Functions

All Edge Functions are in `supabase/functions/` directory:

1. **send-line-message** - Send broadcast messages via LINE API
2. **process-scheduled-messages** - Cron job for scheduled messages (runs every minute)
3. **process-line-webhook** - Handle LINE webhook events
4. **process-step-campaigns** - Process step campaign triggers
5. **deploy-rich-menu** - Deploy rich menus to LINE

### Step 2: Set Environment Variables

```bash
# Set LINE API credentials
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN="your_line_channel_access_token" \
  --project-ref powrxrjblbxrfrqskvye

supabase secrets set LINE_CHANNEL_SECRET="your_line_channel_secret" \
  --project-ref powrxrjblbxrfrqskvye

# Set Supabase credentials (for Edge Functions to access database)
supabase secrets set SUPABASE_URL="https://powrxrjblbxrfrqskvye.supabase.co" \
  --project-ref powrxrjblbxrfrqskvye

supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key" \
  --project-ref powrxrjblbxrfrqskvye

# Verify secrets set
supabase secrets list --project-ref powrxrjblbxrfrqskvye
```

### Step 3: Deploy Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy send-line-message --project-ref powrxrjblbxrfrqskvye
supabase functions deploy process-scheduled-messages --project-ref powrxrjblbxrfrqskvye
supabase functions deploy process-line-webhook --project-ref powrxrjblbxrfrqskvye
supabase functions deploy process-step-campaigns --project-ref powrxrjblbxrfrqskvye
supabase functions deploy deploy-rich-menu --project-ref powrxrjblbxrfrqskvye
```

**Expected Output** (for each function):
```
Deploying function send-line-message...
✓ Function send-line-message deployed successfully
URL: https://powrxrjblbxrfrqskvye.supabase.co/functions/v1/send-line-message
```

### Step 4: Configure Cron Jobs

The `process-scheduled-messages` function needs to run every minute:

```bash
# Create cron schedule (in Supabase dashboard or via SQL)
SELECT
  cron.schedule(
    'process-scheduled-messages',
    '* * * * *',  -- Every minute
    $$
    SELECT
      net.http_post(
        url := 'https://powrxrjblbxrfrqskvye.supabase.co/functions/v1/process-scheduled-messages',
        headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
      );
    $$
  );
```

**Alternative**: Use external cron service (like GitHub Actions, Vercel Cron, or cron-job.org)

### Step 5: Configure LINE Webhook

1. Go to LINE Developers Console: https://developers.line.biz/console/
2. Select your Messaging API channel
3. Go to "Messaging API" tab
4. Set Webhook URL:
   ```
   https://powrxrjblbxrfrqskvye.supabase.co/functions/v1/process-line-webhook
   ```
5. Enable "Use webhook"
6. Enable "Webhook redelivery"
7. Click "Verify" to test webhook

### Step 6: Test Edge Functions

```bash
# Test send-line-message
curl -X POST \
  https://powrxrjblbxrfrqskvye.supabase.co/functions/v1/send-line-message \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "USER_ID",
    "messages": [{
      "type": "text",
      "text": "Test message from L Message SaaS"
    }]
  }'

# Test deploy-rich-menu
curl -X POST \
  https://powrxrjblbxrfrqskvye.supabase.co/functions/v1/deploy-rich-menu \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "richMenuId": "TEST_RICH_MENU_ID"
  }'
```

### Checklist: Edge Functions Deployment

- [ ] All environment variables set in Supabase secrets
- [ ] send-line-message deployed and tested
- [ ] process-scheduled-messages deployed
- [ ] process-line-webhook deployed and tested
- [ ] process-step-campaigns deployed
- [ ] deploy-rich-menu deployed and tested
- [ ] Cron job configured for scheduled messages
- [ ] LINE webhook URL configured
- [ ] LINE webhook verified successfully
- [ ] Test messages sent successfully

---

## Phase 3: Frontend Deployment (Vercel)

### Step 1: Prepare for Build

**Fix Turbopack Issue** (Japanese characters in path):

Option A: Move project to English path
```bash
# Move project
mv ~/Documents/開発プロジェクト/GitHub/lme-manual-scraper ~/Documents/Projects/lme-manual-scraper

# Update working directory
cd ~/Documents/Projects/lme-manual-scraper/lme-saas
```

Option B: Use webpack instead of Turbopack
```bash
# Edit package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",  // Remove --turbo flag
    "start": "next start"
  }
}
```

### Step 2: Test Production Build Locally

```bash
# Clean previous builds
rm -rf .next

# Build for production
npm run build

# Test production server locally
npm run start

# Verify all pages load correctly
# Open http://localhost:3000
```

**Expected Output**:
```
✓ Creating an optimized production build
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (50/50)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    142 B          87.2 kB
├ ○ /dashboard                           1.2 kB         88.3 kB
├ ○ /dashboard/friends                   2.5 kB         89.6 kB
...
```

### Step 3: Push to Git Repository

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Phase 1-4 complete: Friends, Messages, Forms, Rich Menus"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/lme-saas.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com/new
2. Import Git repository
3. Configure project:
   - Framework Preset: Next.js
   - Root Directory: lme-saas
   - Build Command: `npm run build`
   - Output Directory: (default)
4. Add environment variables (see below)
5. Click "Deploy"

### Step 5: Configure Environment Variables in Vercel

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

**Production Environment**:
```
NEXT_PUBLIC_SUPABASE_URL=https://powrxrjblbxrfrqskvye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token
LINE_CHANNEL_SECRET=your_line_channel_secret
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Preview & Development Environments**:
Same as production (or use separate Supabase project for staging)

### Step 6: Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add custom domain (e.g., `app.yourdomain.com`)
3. Configure DNS records:
   - Type: CNAME
   - Name: app
   - Value: cname.vercel-dns.com
4. Wait for DNS propagation (5-60 minutes)
5. Vercel will automatically provision SSL certificate

### Step 7: Verify Production Deployment

Test all critical features:

**Authentication**:
- [ ] Sign up works
- [ ] Login works
- [ ] Logout works
- [ ] Session persistence works

**Friends Management** (Phase 1):
- [ ] Friends list loads
- [ ] Add new friend works
- [ ] Edit friend works
- [ ] Tag management works
- [ ] Segment builder works
- [ ] CSV import works

**Message Delivery** (Phase 2):
- [ ] Message list loads
- [ ] Create broadcast message works
- [ ] Schedule message works
- [ ] Step campaign builder works
- [ ] Template management works
- [ ] LINE message sending works

**Forms** (Phase 3):
- [ ] Form list loads
- [ ] Form builder works
- [ ] Public form submission works (test URL: /f/[formId])
- [ ] Response management works
- [ ] Analytics dashboard loads
- [ ] CSV export works

**Rich Menus** (Phase 4):
- [ ] Rich menu list loads
- [ ] Canvas editor works
- [ ] Image upload works
- [ ] Deploy to LINE works
- [ ] Rich menu visible in LINE app

### Checklist: Frontend Deployment

- [ ] Turbopack issue resolved (moved to English path or using webpack)
- [ ] Production build successful locally
- [ ] Code pushed to Git repository
- [ ] Deployed to Vercel
- [ ] All environment variables configured
- [ ] Custom domain configured (if applicable)
- [ ] All critical features tested in production
- [ ] SSL certificate active
- [ ] Performance metrics acceptable (Lighthouse score >90)

---

## Phase 4: Post-Deployment Setup

### Step 1: Create Admin User

```bash
# Connect to production database
psql $DATABASE_URL

# Create admin user (after they sign up via UI)
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{organization_id}',
  '"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"'
)
WHERE email = 'admin@yourdomain.com';

# Grant admin role
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  raw_app_meta_data,
  '{role}',
  '"admin"'
)
WHERE email = 'admin@yourdomain.com';
```

### Step 2: Configure LINE LIFF (for forms)

1. Go to LINE Developers Console
2. Select your channel → LIFF tab
3. Click "Add" to create LIFF app
4. Configure:
   - LIFF app name: L Message Forms
   - Size: Full
   - Endpoint URL: `https://your-domain.vercel.app/f`
   - Scopes: `profile`, `openid`
5. Copy LIFF ID
6. Add to environment variables: `NEXT_PUBLIC_LINE_LIFF_ID=your-liff-id`
7. Redeploy Vercel

### Step 3: Set Up Monitoring

**Vercel Analytics**:
1. Go to Vercel Dashboard → Analytics
2. Enable Web Analytics
3. Monitor:
   - Page views
   - Performance metrics
   - Error rates

**Supabase Monitoring**:
1. Go to Supabase Dashboard → Logs
2. Monitor:
   - API requests
   - Database queries
   - Edge Function invocations
   - Error logs

**LINE Webhook Logs**:
1. Go to LINE Developers Console → Webhook
2. Monitor webhook delivery status
3. Check for failed deliveries

### Step 4: Set Up Backups

**Database Backups**:
Supabase automatically backs up your database daily. Configure retention:
1. Go to Supabase Dashboard → Settings → Backups
2. Set retention period (7 days recommended)
3. Test backup restoration

**Code Backups**:
Already handled by Git. Ensure:
- [ ] Code pushed to GitHub
- [ ] Protected main branch
- [ ] Regular commits
- [ ] Tagged releases

### Step 5: Performance Optimization

**Database Optimization**:
```sql
-- Analyze query performance
SELECT * FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Add missing indexes if needed
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_slow_query
  ON table_name (column_name);

-- Update statistics
ANALYZE;
```

**Next.js Optimization**:
- Enable Partial Prerendering (PPR) for static pages
- Use Image Optimization for all images
- Enable compression in Vercel
- Configure caching headers

### Checklist: Post-Deployment

- [ ] Admin user created and tested
- [ ] LINE LIFF configured for forms
- [ ] Vercel Analytics enabled
- [ ] Supabase monitoring configured
- [ ] LINE webhook logging checked
- [ ] Database backups verified
- [ ] Code repository backed up
- [ ] Performance optimizations applied
- [ ] Error tracking configured
- [ ] Documentation updated

---

## Troubleshooting

### Issue: Build fails with "byte index is not a char boundary"
**Solution**: Move project to path without Japanese characters or use webpack instead of Turbopack

### Issue: "Invalid JWT" errors
**Solution**: Verify SUPABASE_SERVICE_ROLE_KEY is correct and has proper permissions

### Issue: LINE messages not sending
**Solution**:
1. Check LINE_CHANNEL_ACCESS_TOKEN is valid
2. Verify webhook URL is correct
3. Check Edge Function logs for errors
4. Test LINE API credentials manually

### Issue: RLS policies blocking queries
**Solution**:
1. Verify organization_id in JWT claims
2. Check custom_access_token_hook is working
3. Test with service role key to bypass RLS
4. Review RLS policies for missing cases

### Issue: Forms not submitting
**Solution**:
1. Check form status is "published"
2. Verify public form URL is correct
3. Check browser console for errors
4. Test with service role key

### Issue: Rich menu not appearing in LINE
**Solution**:
1. Verify rich menu deployed successfully
2. Check image dimensions (2500x1686px or 2500x843px)
3. Verify LINE API credentials
4. Check if rich menu is set as default
5. Test with specific user ID

---

## Security Checklist

- [ ] All RLS policies enabled and tested
- [ ] Service role key kept secret (never in frontend)
- [ ] LINE credentials stored securely (Supabase secrets)
- [ ] Rate limiting configured on Edge Functions
- [ ] Input validation on all forms
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] HTTPS enforced (Vercel does this automatically)
- [ ] Security headers configured
- [ ] Regular dependency updates scheduled

---

## Maintenance Schedule

**Daily**:
- [ ] Monitor error logs (Vercel + Supabase)
- [ ] Check webhook delivery status
- [ ] Review Edge Function invocations

**Weekly**:
- [ ] Review performance metrics
- [ ] Check database size and growth
- [ ] Review user feedback
- [ ] Update dependencies (security patches)

**Monthly**:
- [ ] Full backup verification
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Feature usage analysis
- [ ] Cost optimization review

---

## Support & Resources

### Documentation
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- LINE Messaging API: https://developers.line.biz/en/docs/messaging-api/
- Vercel: https://vercel.com/docs

### Community
- Supabase Discord: https://discord.supabase.com
- Next.js Discord: https://discord.gg/nextjs
- LINE Developers Community: https://www.line-community.me/

### Emergency Contacts
- Supabase Support: support@supabase.io
- Vercel Support: https://vercel.com/support
- LINE Support: https://www.linebiz.com/jp/support/

---

## Deployment Complete!

**Status**: ✅ Ready for production

**Next Steps**:
1. Test all features thoroughly
2. Invite team members
3. Import production data
4. Launch to users
5. Monitor performance and errors
6. Plan Phase 5 (Reservation Management)

**Congratulations on successfully deploying L Message SaaS!** 🎉
