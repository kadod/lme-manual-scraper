'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChatBubbleLeftRightIcon,
  BoltIcon,
  SparklesIcon,
  EllipsisVerticalIcon,
  Bars3Icon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { AutoResponseRule } from '@/app/actions/auto-response'
import {
  toggleAutoResponseRuleStatus,
  deleteAutoResponseRule,
  duplicateAutoResponseRule,
} from '@/app/actions/auto-response'
import { toast } from 'sonner'

interface RuleCardProps {
  rule: AutoResponseRule
}

export function RuleCard({ rule }: RuleCardProps) {
  const router = useRouter()
  const [isToggling, setIsToggling] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keyword':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />
      case 'scenario':
        return <BoltIcon className="h-5 w-5" />
      case 'ai':
        return <SparklesIcon className="h-5 w-5" />
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'keyword':
        return 'キーワード'
      case 'scenario':
        return 'シナリオ'
      case 'ai':
        return 'AI'
      default:
        return type
    }
  }

  const getStatusBadge = () => {
    if (rule.is_active) {
      return <Badge variant="default" className="bg-green-600">有効</Badge>
    }
    return <Badge variant="secondary">無効</Badge>
  }

  const handleToggleStatus = async (checked: boolean) => {
    setIsToggling(true)
    try {
      await toggleAutoResponseRuleStatus(rule.id)
      toast.success(`ルールを${rule.is_active ? '無効' : '有効'}にしました`)
      router.refresh()
    } catch (error) {
      console.error('Failed to toggle status:', error)
      toast.error('ステータスの変更に失敗しました')
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このルールを削除しますか？')) {
      return
    }

    try {
      await deleteAutoResponseRule(rule.id)
      toast.success('ルールを削除しました')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete rule:', error)
      toast.error('ルールの削除に失敗しました')
    }
  }

  const handleDuplicate = async () => {
    try {
      await duplicateAutoResponseRule(rule.id)
      toast.success('ルールを複製しました')
      router.refresh()
    } catch (error) {
      console.error('Failed to duplicate rule:', error)
      toast.error('ルールの複製に失敗しました')
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <button
            className="mt-1 cursor-move touch-none"
            {...attributes}
            {...listeners}
          >
            <Bars3Icon className="h-5 w-5 text-muted-foreground" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-accent rounded-lg">
                  {getTypeIcon(rule.trigger_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/dashboard/auto-response/${rule.id}`}
                      className="font-semibold hover:underline truncate text-lg"
                    >
                      {rule.name}
                    </Link>
                    <Badge variant="outline">{getTypeLabel(rule.trigger_type)}</Badge>
                    {getStatusBadge()}
                  </div>
                  {rule.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {rule.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={handleToggleStatus}
                  disabled={isToggling}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <EllipsisVerticalIcon className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/auto-response/${rule.id}`}>
                        編集
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                      複製
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ChartBarIcon className="h-4 w-4" />
                <span>優先度: {rule.priority}</span>
              </div>
              <div className="text-xs ml-auto">
                {formatDistanceToNow(new Date(rule.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
