# LINE Integration Setup Guide

## Prerequisites

1. **LINE Developers Account**
   - Create account at: https://developers.line.biz/
   - Verify email address

2. **LINE Official Account**
   - Create via LINE Official Account Manager
   - Get your Channel ID

3. **Supabase Database**
   - Required tables must exist (see Database Schema section)

---

## Step 1: LINE Developers Console Setup

### Create Messaging API Channel

1. Go to LINE Developers Console: https://developers.line.biz/console/
2. Create a new provider or select existing
3. Create a new channel:
   - Channel type: **Messaging API**
   - Channel name: Your bot name
   - Channel description: Brief description
   - Category: Select appropriate category
   - Subcategory: Select appropriate subcategory

### Get Channel Credentials

1. Go to **Basic Settings** tab:
   - Copy **Channel ID**
   - Copy **Channel Secret**

2. Go to **Messaging API** tab:
   - Click **Issue** to create Channel Access Token
   - Copy **Channel Access Token** (long-lived)
   - Save this token securely - it won't be shown again

### Configure Webhook

1. In **Messaging API** tab:
   - Find **Webhook settings** section
   - Click **Edit** on Webhook URL
   - Enter your webhook URL:
     ```
     https://yourdomain.com/api/line/webhook
     ```
   - Click **Update**
   - Enable **Use webhook**
   - Enable **Webhook redelivery** (recommended)

2. Verify webhook:
   - Click **Verify** button
   - Should show success message

### Configure Other Settings

1. **Auto-reply messages**:
   - Go to LINE Official Account Manager
   - Disable auto-reply if you want custom responses

2. **Greeting messages**:
   - Customize or disable as needed

3. **Response settings**:
   - Set to "Bot" mode if you want API-only responses
   - Or "Chat" mode for manual + API responses

---

## Step 2: Application Configuration

### Environment Variables

Add to `.env.local`:

```env
# Application URL (required for webhook URL generation)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Default LINE credentials (not recommended for production)
# LINE_CHANNEL_SECRET=your_channel_secret
# LINE_CHANNEL_ACCESS_TOKEN=your_access_token
```

### Database Schema

Ensure these tables exist in your Supabase database:

```sql
-- LINE Channels
CREATE TABLE IF NOT EXISTS line_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL UNIQUE,
  channel_secret TEXT NOT NULL,
  channel_access_token TEXT NOT NULL,
  channel_name TEXT,
  channel_icon_url TEXT,
  settings JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LINE Friends (followers)
CREATE TABLE IF NOT EXISTS line_friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_channel_id UUID NOT NULL REFERENCES line_channels(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  picture_url TEXT,
  status_message TEXT,
  follow_status TEXT NOT NULL DEFAULT 'active' CHECK (follow_status IN ('active', 'unfollowed', 'blocked')),
  followed_at TIMESTAMP WITH TIME ZONE,
  unfollowed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(line_channel_id, line_user_id)
);

-- Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  line_friend_id UUID NOT NULL REFERENCES line_friends(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  line_message_id TEXT UNIQUE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'bot', 'system')),
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'location', 'sticker')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook Logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_channel_id UUID NOT NULL REFERENCES line_channels(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_line_friends_channel_user ON line_friends(line_channel_id, line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_friends_organization ON line_friends(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_friend ON conversations(line_friend_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_channel ON webhook_logs(line_channel_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed_at DESC);
```

### Deploy Application

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your hosting platform:
   - Vercel, Netlify, or your preferred platform
   - Ensure environment variables are set

3. Test deployment:
   ```bash
   curl https://yourdomain.com/api/line/webhook
   ```
   Should return:
   ```json
   {
     "message": "LINE Webhook endpoint is active",
     "timestamp": "2024-01-01T00:00:00.000Z"
   }
   ```

---

## Step 3: Configure in Application

1. **Login to Dashboard**
   - Go to: `https://yourdomain.com/dashboard`
   - Login with your organization account

2. **Navigate to LINE Settings**
   - Go to: Settings → LINE Settings
   - Or: `/dashboard/settings/line`

3. **Enter Channel Information**
   - **Channel ID**: Paste from LINE Developers Console
   - **Channel Secret**: Paste from LINE Developers Console
   - **Access Token**: Paste from LINE Developers Console
   - **LIFF ID** (Optional): If you have LIFF app

4. **Test Connection**
   - Click **接続チェック** (Connection Test)
   - Should show success with bot name
   - Bot profile image should appear

5. **Save Settings**
   - Click **保存** (Save)
   - Webhook URL will be displayed
   - Copy webhook URL for LINE Developers Console

6. **Update Profile** (Optional)
   - Click **情報更新** (Update Info)
   - Fetches latest bot name and icon from LINE

---

## Step 4: Testing

### Test Webhook Reception

1. **Add Bot as Friend**
   - Scan QR code in LINE Official Account Manager
   - Or search by Channel ID
   - Add bot as friend

2. **Verify Database**
   - Check `line_friends` table
   - Should have new record with your user ID
   - `follow_status` should be 'active'

3. **Send Test Message**
   - Send "Hello" to the bot
   - Check `chat_messages` table
   - Should have your message recorded
   - Check `conversations` table for conversation record

4. **Check Webhook Logs**
   - Query `webhook_logs` table
   - Should see all events logged
   - Status should be 'success'

### Test with Script

Use the provided test script:

```bash
# Set environment variables
export WEBHOOK_URL=https://yourdomain.com/api/line/webhook
export LINE_CHANNEL_SECRET=your_channel_secret
export LINE_CHANNEL_ID=your_channel_id

# Run tests
node scripts/test-line-webhook.mjs
```

### Manual Testing Scenarios

1. **Follow Flow**:
   - Add bot → Check line_friends
   - Block bot → Check follow_status = 'unfollowed'
   - Unblock bot → Check follow_status = 'active'

2. **Message Flow**:
   - Send text → Check chat_messages
   - Send sticker → Check metadata field
   - Send multiple → Check all recorded

3. **Error Handling**:
   - Invalid signature → Should return 401
   - Missing user → Should skip gracefully
   - Network error → Should log error

---

## Step 5: Monitoring & Maintenance

### Database Queries for Monitoring

```sql
-- Total friends count
SELECT COUNT(*) FROM line_friends WHERE follow_status = 'active';

-- Messages today
SELECT COUNT(*) FROM chat_messages
WHERE created_at >= CURRENT_DATE;

-- Webhook errors today
SELECT * FROM webhook_logs
WHERE status = 'error'
AND processed_at >= CURRENT_DATE
ORDER BY processed_at DESC;

-- Active conversations
SELECT COUNT(*) FROM conversations WHERE status = 'open';
```

### Health Checks

1. **Webhook Status**:
   ```bash
   curl https://yourdomain.com/api/line/webhook
   ```

2. **Channel Connection**:
   - Use connection test in settings page
   - Or API call:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.line.me/v2/bot/info
   ```

3. **Database Connectivity**:
   - Check Supabase dashboard
   - Monitor query performance

### Troubleshooting

#### Webhook Not Receiving Events

1. **Check LINE Developers Console**:
   - Verify webhook URL is correct
   - Verify "Use webhook" is enabled
   - Check webhook delivery logs

2. **Check Application Logs**:
   - Look for signature verification failures
   - Check for database connection errors
   - Review webhook_logs table

3. **Test Webhook Manually**:
   ```bash
   node scripts/test-line-webhook.mjs
   ```

#### Messages Not Saving

1. **Check Permissions**:
   - Verify organization ID is correct
   - Check user has proper role

2. **Check Database**:
   - Verify tables exist
   - Check foreign key constraints
   - Review error logs

3. **Check LINE Friend Record**:
   - Must exist before messages can be saved
   - Add bot as friend first

#### Connection Test Failing

1. **Verify Credentials**:
   - Check Channel Access Token
   - Verify not expired
   - Test with curl

2. **Check Network**:
   - Ensure can reach LINE API
   - Check firewall rules
   - Verify DNS resolution

---

## Security Best Practices

1. **Protect Credentials**:
   - Never commit secrets to git
   - Use environment variables
   - Rotate tokens regularly

2. **Webhook Security**:
   - Always verify signatures
   - Use HTTPS only
   - Monitor for unusual activity

3. **Database Security**:
   - Use Row Level Security (RLS) in Supabase
   - Limit access by organization
   - Audit access logs

4. **Error Handling**:
   - Don't expose internal errors to users
   - Log errors securely
   - Monitor error rates

---

## Support Resources

- **LINE Developers Documentation**: https://developers.line.biz/en/docs/
- **Messaging API Reference**: https://developers.line.biz/en/reference/messaging-api/
- **LINE Bot SDK**: https://github.com/line/line-bot-sdk-nodejs
- **Supabase Documentation**: https://supabase.com/docs

---

## Next Steps

After basic setup is complete:

1. **Implement Auto-Responses**
   - Keyword-based responses
   - Business hours routing
   - FAQ automation

2. **Setup Rich Menus**
   - Create rich menu designs
   - Configure menu actions
   - A/B testing

3. **LIFF Integration**
   - Create LIFF app
   - Implement authentication
   - Link user profiles

4. **Analytics**
   - Message delivery tracking
   - User engagement metrics
   - Conversion tracking

5. **Advanced Features**
   - Flex message templates
   - Broadcast campaigns
   - Integration with other services
