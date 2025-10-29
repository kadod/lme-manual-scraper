import { notFound } from 'next/navigation'
import { getPublicForm } from '@/app/actions/forms'
import { PublicForm } from '@/components/forms/PublicForm'

interface PageProps {
  params: Promise<{ formId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PublicFormPage({ params, searchParams }: PageProps) {
  const { formId } = await params
  const search = await searchParams
  const lineUserId = typeof search.userId === 'string' ? search.userId : undefined

  const form = await getPublicForm(formId)

  if (!form) {
    notFound()
  }

  return <PublicForm form={form} lineUserId={lineUserId} />
}

export async function generateMetadata({ params }: PageProps) {
  const { formId } = await params
  const form = await getPublicForm(formId)

  if (!form) {
    return {
      title: 'フォームが見つかりません'
    }
  }

  return {
    title: form.title,
    description: form.description || 'アンケートフォーム'
  }
}
