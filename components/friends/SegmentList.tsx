'use client'

import { useEffect, useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SegmentDialog } from './SegmentDialog'
import { DeleteSegmentDialog } from './DeleteSegmentDialog'
import { getSegments } from '@/app/actions/segments'
import { SegmentWithCount } from '@/lib/supabase/queries/segments'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export function SegmentList() {
  const [segments, setSegments] = useState<SegmentWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSegment, setSelectedSegment] = useState<SegmentWithCount | null>(null)
  const [deleteSegment, setDeleteSegment] = useState<SegmentWithCount | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadSegments()
  }, [])

  const loadSegments = async () => {
    setLoading(true)
    const result = await getSegments()
    if (result.success) {
      setSegments(result.data)
    }
    setLoading(false)
  }

  const handleCreateNew = () => {
    setSelectedSegment(null)
    setDialogOpen(true)
  }

  const handleEdit = (segment: SegmentWithCount) => {
    setSelectedSegment(segment)
    setDialogOpen(true)
  }

  const handleDelete = (segment: SegmentWithCount) => {
    setDeleteSegment(segment)
  }

  const handleDialogClose = async (refresh?: boolean) => {
    setDialogOpen(false)
    setSelectedSegment(null)
    if (refresh) {
      await loadSegments()
    }
  }

  const handleDeleteDialogClose = async (refresh?: boolean) => {
    setDeleteSegment(null)
    if (refresh) {
      await loadSegments()
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-2/3"></div>
              <div className="h-4 bg-muted rounded w-full mt-2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (segments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FunnelIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">セグメントがありません</h3>
          <p className="text-muted-foreground text-center mb-6">
            条件を設定して友だちグループを作成しましょう
          </p>
          <Button onClick={handleCreateNew}>
            <PlusIcon className="h-5 w-5 mr-2" />
            セグメント作成
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateNew}>
          <PlusIcon className="h-5 w-5 mr-2" />
          新規セグメント
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment) => (
          <Card key={segment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{segment.name}</CardTitle>
                  {segment.description && (
                    <CardDescription className="mt-1">
                      {segment.description}
                    </CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Friend Count */}
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">{segment.friendCount || 0}</span>
                <span className="text-muted-foreground">人</span>
              </div>

              {/* Conditions Count */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {(segment.conditions as any)?.length || 0} 件の条件
                </Badge>
              </div>

              {/* Created Date */}
              <div className="text-xs text-muted-foreground">
                作成日: {format(new Date(segment.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(segment)}
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  編集
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDelete(segment)}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  削除
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segment Dialog */}
      <SegmentDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        segment={selectedSegment}
      />

      {/* Delete Confirmation Dialog */}
      {deleteSegment && (
        <DeleteSegmentDialog
          open={!!deleteSegment}
          onClose={handleDeleteDialogClose}
          segment={deleteSegment}
        />
      )}
    </>
  )
}
