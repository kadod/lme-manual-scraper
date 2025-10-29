import { Suspense } from 'react'
import { getRichMenus } from '@/app/actions/rich-menus'
import { RichMenuList } from '@/components/rich-menus/RichMenuList'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { RectangleStackIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function RichMenuListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}

async function RichMenusContent() {
  try {
    const richMenus = await getRichMenus()
    return <RichMenuList initialMenus={richMenus} />
  } catch (error) {
    console.error('Failed to load rich menus:', error)
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-red-500 mb-4">Failed to load rich menus</p>
        <Button onClick={() => window.location.reload()}>Reload</Button>
      </div>
    )
  }
}

export default function RichMenusPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <RectangleStackIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold tracking-tight">Rich Menus</h1>
          </div>
          <p className="text-gray-500 mt-1">
            Manage menus displayed in chat screen
          </p>
        </div>
        <Link href="/dashboard/rich-menus/new">
          <Button size="lg">
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <Suspense fallback={<RichMenuListSkeleton />}>
        <RichMenusContent />
      </Suspense>
    </div>
  )
}
