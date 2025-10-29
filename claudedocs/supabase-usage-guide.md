# Supabase Type-Safe Usage Guide

Quick reference for using the type-safe Supabase implementation in the lme-saas project.

## Quick Start

### 1. Using Server Actions (Recommended for App Router)

Server actions provide the simplest API with automatic authentication.

```typescript
// In Server Components
import { getFriends, createFriend, updateFriend } from '@/app/actions/friends'
import { getTags, addTagToFriend } from '@/app/actions/tags'

export default async function FriendsPage() {
  // Get all friends with filters
  const result = await getFriends({
    searchQuery: 'John',
    limit: 20,
    offset: 0
  })

  if (!result.success) {
    return <div>Error: {result.error.message}</div>
  }

  return (
    <div>
      {result.data.map(friend => (
        <FriendCard key={friend.id} friend={friend} />
      ))}
    </div>
  )
}
```

### 2. Using Query Classes Directly

For more control, use query classes directly in Server Components or Route Handlers.

```typescript
import { createClient } from '@/lib/supabase/server'
import { FriendsQueries } from '@/lib/supabase/queries'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const queries = new FriendsQueries(supabase)
  const result = await queries.getFriends(user.id, {
    isBlocked: false,
    limit: 100
  })

  if (!result.success) {
    return Response.json({ error: result.error.message }, { status: 500 })
  }

  return Response.json({ friends: result.data })
}
```

## Common Patterns

### Friends Management

#### List Friends with Filters
```typescript
import { getFriends } from '@/app/actions/friends'

const result = await getFriends({
  searchQuery: 'John',        // Search by display name
  tagIds: ['tag-1', 'tag-2'], // Filter by tags (AND logic)
  isBlocked: false,           // Filter blocked status
  limit: 20,                  // Pagination limit
  offset: 0                   // Pagination offset
})
```

#### Create a Friend
```typescript
import { createFriend } from '@/app/actions/friends'

const result = await createFriend({
  line_user_id: 'U1234567890',
  display_name: 'John Doe',
  picture_url: 'https://example.com/avatar.jpg',
  status_message: 'Hello!',
  metadata: { source: 'import', notes: 'VIP customer' }
})
```

#### Update Friend
```typescript
import { updateFriend } from '@/app/actions/friends'

const result = await updateFriend('friend-id', {
  display_name: 'Jane Doe',
  status_message: 'Updated status',
  last_interaction_at: new Date().toISOString()
})
```

#### Block/Unblock Friend
```typescript
import { blockFriend } from '@/app/actions/friends'

// Block
await blockFriend('friend-id', true)

// Unblock
await blockFriend('friend-id', false)
```

### Tags Management

#### List All Tags with Friend Counts
```typescript
import { getTags } from '@/app/actions/tags'

const result = await getTags()

if (result.success) {
  result.data.forEach(tag => {
    console.log(`${tag.name}: ${tag.friend_count} friends`)
  })
}
```

#### Create Tag
```typescript
import { createTag } from '@/app/actions/tags'

const result = await createTag({
  name: 'VIP',
  color: '#FFD700',
  description: 'VIP customers'
})
```

#### Assign Tag to Friend
```typescript
import { addTagToFriend } from '@/app/actions/tags'

const result = await addTagToFriend('friend-id', 'tag-id')
```

#### Remove Tag from Friend
```typescript
import { removeTagFromFriend } from '@/app/actions/tags'

const result = await removeTagFromFriend('friend-id', 'tag-id')
```

#### Get Friend's Tags
```typescript
import { getFriendTags } from '@/app/actions/tags'

const result = await getFriendTags('friend-id')

if (result.success) {
  const tagNames = result.data.map(tag => tag.name)
  console.log('Friend tags:', tagNames.join(', '))
}
```

### Segments (Advanced Filtering)

#### Create a Segment
```typescript
import { createClient } from '@/lib/supabase/server'
import { SegmentsQueries } from '@/lib/supabase/queries'

const supabase = await createClient()
const queries = new SegmentsQueries(supabase)

const result = await queries.createSegment({
  user_id: userId,
  name: 'Active VIP Users',
  description: 'VIP users who interacted in last 30 days',
  conditions: [
    {
      type: 'tag',
      operator: 'includes',
      value: ['vip-tag-id']
    },
    {
      type: 'interaction_date',
      operator: 'after',
      value: '2025-09-29T00:00:00Z'
    },
    {
      type: 'blocked_status',
      operator: 'equals',
      value: false
    }
  ]
})
```

#### Get Friends in a Segment
```typescript
const result = await queries.getSegmentFriends('segment-id', userId)

if (result.success) {
  console.log(`Found ${result.data.length} matching friends`)
}
```

#### Segment Condition Types

**Tag Conditions**:
```typescript
// Friends WITH specific tags
{
  type: 'tag',
  operator: 'includes',
  value: ['tag-id-1', 'tag-id-2'] // Has ANY of these tags
}

// Friends WITHOUT specific tags
{
  type: 'tag',
  operator: 'excludes',
  value: ['tag-id-1'] // Does NOT have this tag
}
```

**Interaction Date Conditions**:
```typescript
// Friends who interacted AFTER a date
{
  type: 'interaction_date',
  operator: 'after',
  value: '2025-01-01T00:00:00Z'
}

// Friends who interacted BEFORE a date
{
  type: 'interaction_date',
  operator: 'before',
  value: '2025-12-31T23:59:59Z'
}
```

**Blocked Status Conditions**:
```typescript
// Only non-blocked friends
{
  type: 'blocked_status',
  operator: 'equals',
  value: false
}
```

## Error Handling

All operations return a `DatabaseResult<T>` type:

```typescript
type DatabaseResult<T> =
  | { success: true; data: T }
  | { success: false; error: DatabaseError }
```

### Pattern 1: Early Return
```typescript
const result = await getFriends()

if (!result.success) {
  console.error('Error:', result.error.code, result.error.message)
  return
}

// TypeScript knows result.data exists here
const friends = result.data
```

### Pattern 2: Conditional Rendering
```typescript
export default async function Page() {
  const result = await getFriends()

  if (!result.success) {
    return <ErrorComponent error={result.error} />
  }

  return <FriendsList friends={result.data} />
}
```

### Pattern 3: Try-Catch Style
```typescript
function handleResult<T>(result: DatabaseResult<T>): T {
  if (!result.success) {
    throw result.error
  }
  return result.data
}

try {
  const friends = handleResult(await getFriends())
  // Use friends
} catch (error) {
  if (error instanceof DatabaseError) {
    console.error('Database error:', error.code, error.message)
  }
}
```

## Client-Side Usage (with React Query)

### Setup React Query

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### Create Custom Hooks

```typescript
// hooks/useFriends.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFriends, createFriend, updateFriend, deleteFriend } from '@/app/actions/friends'

export function useFriends(filters?: FriendFilters) {
  return useQuery({
    queryKey: ['friends', filters],
    queryFn: async () => {
      const result = await getFriends(filters)
      if (!result.success) throw result.error
      return result.data
    }
  })
}

export function useCreateFriend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createFriend,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['friends'] })
      }
    }
  })
}

export function useUpdateFriend() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: FriendUpdate }) =>
      updateFriend(id, updates),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['friends'] })
      }
    }
  })
}
```

### Use in Components

```typescript
'use client'

import { useFriends, useCreateFriend } from '@/hooks/useFriends'

export function FriendsList() {
  const { data: friends, isLoading, error } = useFriends({ limit: 20 })
  const createMutation = useCreateFriend()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button
        onClick={() => createMutation.mutate({
          line_user_id: 'U123',
          display_name: 'New Friend'
        })}
      >
        Add Friend
      </button>

      {friends?.map(friend => (
        <div key={friend.id}>{friend.display_name}</div>
      ))}
    </div>
  )
}
```

## Type Safety Tips

### Extract Types from Database Schema

```typescript
import { Database } from '@/types/supabase'

// Get table row type
type Friend = Database['public']['Tables']['friends']['Row']

// Get insert type (optional fields)
type FriendInsert = Database['public']['Tables']['friends']['Insert']

// Get update type (all optional)
type FriendUpdate = Database['public']['Tables']['friends']['Update']

// Or use helper types
import { Tables, TablesInsert, TablesUpdate } from '@/types/supabase'

type Friend = Tables<'friends'>
type FriendInsert = TablesInsert<'friends'>
type FriendUpdate = TablesUpdate<'friends'>
```

### Type-Safe Query Building

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// TypeScript knows available columns and types
const { data } = await supabase
  .from('friends')  // Type-safe table names
  .select('id, display_name, tags(name)')  // Type-checked columns
  .eq('user_id', userId)  // Type-safe filters
```

## Best Practices

1. **Always Check Results**: Use the result pattern to handle errors explicitly
2. **Use Server Actions**: Simplest API for App Router components
3. **Query Classes for Flexibility**: Use when you need more control
4. **Type Everything**: Leverage TypeScript for compile-time safety
5. **Cache with React Query**: Reduce server load and improve UX
6. **Filter Server-Side**: Use database queries instead of client-side filtering
7. **Validate Inputs**: Use Zod or similar for runtime validation
8. **Handle Auth Failures**: Check for UNAUTHORIZED errors and redirect to login

## Performance Tips

1. **Use Pagination**: Always set `limit` and `offset` for large datasets
2. **Select Specific Columns**: Use `.select('id, name')` instead of `.select('*')`
3. **Filter Early**: Apply filters in the database query, not in code
4. **Use Indexes**: Ensure database has indexes on filtered columns
5. **Batch Operations**: Create multiple records in one query when possible
6. **Cache Aggressively**: Use React Query with appropriate stale times

## Security Checklist

- [ ] Row Level Security (RLS) policies enabled on all tables
- [ ] User authentication checked before all operations
- [ ] User ID filtered on all queries
- [ ] Input validation on all mutations
- [ ] Error messages don't expose sensitive data
- [ ] Anon key is used (never service role key in client)
