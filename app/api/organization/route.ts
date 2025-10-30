import { createClient } from '@/lib/supabase/server'
import { getCurrentUserOrganizationId } from '@/lib/utils/organization'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const organizationId = await getCurrentUserOrganizationId()
    if (!organizationId) {
      return NextResponse.json(
        { error: '組織が見つかりません' },
        { status: 404 }
      )
    }

    // Check if user is owner
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single()

    if (!userOrg || userOrg.role !== 'owner') {
      return NextResponse.json(
        { error: '権限がありません。組織の更新はオーナーのみが行えます。' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, slug, settings } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (settings !== undefined) updateData.settings = settings
    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('組織更新エラー:', error)
      return NextResponse.json(
        { error: '組織の更新に失敗しました', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('組織更新API エラー:', error)
    return NextResponse.json(
      { error: '組織の更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const organizationId = await getCurrentUserOrganizationId()
    if (!organizationId) {
      return NextResponse.json(
        { error: '組織が見つかりません' },
        { status: 404 }
      )
    }

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error) {
      console.error('組織取得エラー:', error)
      return NextResponse.json(
        { error: '組織の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('組織取得API エラー:', error)
    return NextResponse.json(
      { error: '組織の取得に失敗しました' },
      { status: 500 }
    )
  }
}
