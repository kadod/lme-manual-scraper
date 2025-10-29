import { MessageCreationWizard } from '@/components/messages/MessageCreationWizard'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'メッセージ作成 | L Message',
  description: '新しいメッセージを作成',
}

export default async function NewMessagePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // セグメントを取得
  const { data: segments } = await supabase
    .from('segments')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  // タグを取得
  const { data: tags } = await supabase
    .from('tags')
    .select('id, name, color')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">メッセージ作成</h1>
          <p className="text-muted-foreground mt-2">
            新しいメッセージを作成して友だちに配信します
          </p>
        </div>

        {/* Wizard */}
        <MessageCreationWizard
          segments={segments || []}
          tags={
            tags?.map((tag) => ({
              ...tag,
              color: tag.color || '#6366F1',
            })) || []
          }
        />
      </div>
    </div>
  )
}
