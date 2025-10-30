# Project-Specific Instructions for Claude Code

## Supabase MCP Configuration

**IMPORTANT**: When using Supabase MCP tools, ALWAYS use the following project ID:
```
powrxrjblbxrfrqskvye
```

Never use any other project ID. This is the correct production Supabase project for this application.

Example usage:
```typescript
// Correct ✅
mcp__supabase__execute_sql({
  project_id: "powrxrjblbxrfrqskvye",
  query: "SELECT * FROM users"
})

// Wrong ❌
mcp__supabase__execute_sql({
  project_id: "some-other-id",
  query: "SELECT * FROM users"
})
```

## Project Overview

This is a LINE Messaging SaaS application built with:
- **Framework**: Next.js 15 (App Router with Turbopack)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Custom components + Heroicons
- **Language**: TypeScript

## Key Architecture Patterns

### Organization-Based Access Control
- All data is scoped to `organization_id`
- Users belong to organizations via `users.organization_id`
- RLS policies enforce organization-based access
- Always use `getCurrentUserOrganizationId()` for data access

### Database Schema
- `users` - User accounts with `organization_id` and `role` ('owner' | 'admin' | 'member')
- `organizations` - Organization/company data
- `line_channels` - LINE channel credentials (one per organization)
- `line_friends` - LINE bot followers
- `chat_messages` - 1:1 chat messages between staff and LINE users
- `reservations` - Booking/reservation data

### Server Actions Pattern
All database operations use Server Actions (`'use server'`):
- Located in `app/actions/` directory
- Always verify organization access
- Check user permissions (owner/admin) for sensitive operations
- Return structured responses with error handling

## Development Guidelines

### When Creating New Features
1. Check existing patterns in similar features
2. Use organization-scoped queries
3. Implement proper RLS policies
4. Add permission checks for admin operations
5. Follow the Server Actions pattern

### Common Utilities
- `getCurrentUserOrganizationId()` - Get current user's organization
- `createClient()` - Get Supabase client instance
- Always use absolute paths, never relative paths

### LINE Integration
- Channel credentials stored in `line_channels` table
- Use `getLineClient()` to fetch credentials
- All LINE API operations should be organization-scoped
- Webhook URL: `${NEXT_PUBLIC_APP_URL}/api/line/webhook`

## Next Phase: 1:1 Chat Feature

Implementing `/dashboard/chat` with the following functionality:
- Real-time chat interface with LINE users
- Chat list showing all conversations
- Message history and real-time updates
- Chat settings and configuration
- Organization-scoped access to chats
