import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TagList } from '@/components/friends/TagList'
import { getTags } from '@/lib/actions/tags'

export default async function TagsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const tags = await getTags()

  return (
    <div className="p-8">
      <TagList initialTags={tags} />
    </div>
  )
}
