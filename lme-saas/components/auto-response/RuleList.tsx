'use client'

import { useState } from 'react'
import { RuleCard } from './RuleCard'
import { Button } from '@/components/ui/button'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import type { AutoResponseRule } from '@/app/actions/auto-response'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { updateRulePriority } from '@/app/actions/auto-response'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface RuleListProps {
  rules: AutoResponseRule[]
}

export function RuleList({ rules: initialRules }: RuleListProps) {
  const router = useRouter()
  const [rules, setRules] = useState(initialRules)
  const [isReordering, setIsReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = rules.findIndex((rule) => rule.id === active.id)
    const newIndex = rules.findIndex((rule) => rule.id === over.id)

    const newRules = arrayMove(rules, oldIndex, newIndex)
    setRules(newRules)

    try {
      setIsReordering(true)
      const updates = newRules.map((rule, index) => ({
        id: rule.id,
        priority: newRules.length - index,
      }))

      await Promise.all(
        updates.map((update) => updateRulePriority(update.id, update.priority))
      )

      toast.success('優先順位を更新しました')
      router.refresh()
    } catch (error) {
      console.error('Failed to update priority:', error)
      toast.error('優先順位の更新に失敗しました')
      setRules(initialRules)
    } finally {
      setIsReordering(false)
    }
  }

  if (rules.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">ルールがありません</h3>
        <p className="text-muted-foreground mb-4">
          最初の自動応答ルールを作成しましょう
        </p>
        <Button asChild>
          <Link href="/dashboard/auto-response/new">新規作成</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rules.length}件のルール
          {isReordering && ' (並び替え中...)'}
        </p>
        <p className="text-xs text-muted-foreground">
          ドラッグ&ドロップで優先順位を変更できます
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {rules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
