'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'
import { StepCard } from './StepCard'

export interface CampaignStep {
  id: string
  step_number: number
  name: string
  delay_value: number
  delay_unit: 'minutes' | 'hours' | 'days'
  message_type: 'text' | 'image' | 'video' | 'flex' | 'template'
  message_content: {
    type: string
    text?: string
    [key: string]: unknown
  }
  condition?: Record<string, unknown>
}

interface StepBuilderProps {
  steps: CampaignStep[]
  onChange: (steps: CampaignStep[]) => void
}

export function StepBuilder({ steps, onChange }: StepBuilderProps) {
  const [editingStep, setEditingStep] = useState<string | null>(null)

  const addStep = () => {
    const newStep: CampaignStep = {
      id: `temp-${Date.now()}`,
      step_number: steps.length + 1,
      name: `ステップ ${steps.length + 1}`,
      delay_value: 1,
      delay_unit: 'days',
      message_type: 'text',
      message_content: {
        type: 'text',
        text: '',
      },
    }
    onChange([...steps, newStep])
    setEditingStep(newStep.id)
  }

  const removeStep = (stepId: string) => {
    const newSteps = steps
      .filter(s => s.id !== stepId)
      .map((s, idx) => ({ ...s, step_number: idx + 1 }))
    onChange(newSteps)
  }

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const index = steps.findIndex(s => s.id === stepId)
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === steps.length - 1)
    ) {
      return
    }

    const newSteps = [...steps]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]]

    // Update step numbers
    const reorderedSteps = newSteps.map((s, idx) => ({
      ...s,
      step_number: idx + 1,
    }))
    onChange(reorderedSteps)
  }

  const updateStep = (stepId: string, updates: Partial<CampaignStep>) => {
    const newSteps = steps.map(s =>
      s.id === stepId ? { ...s, ...updates } : s
    )
    onChange(newSteps)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">ステップ設定</h3>
        <Button onClick={addStep} size="sm">
          <PlusIcon className="h-4 w-4 mr-2" />
          ステップ追加
        </Button>
      </div>

      {steps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              ステップがまだありません
            </p>
            <Button onClick={addStep}>
              <PlusIcon className="h-4 w-4 mr-2" />
              最初のステップを追加
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
              isEditing={editingStep === step.id}
              onEdit={() => setEditingStep(step.id)}
              onCollapse={() => setEditingStep(null)}
              onUpdate={(updates) => updateStep(step.id, updates)}
              onMoveUp={() => moveStep(step.id, 'up')}
              onMoveDown={() => moveStep(step.id, 'down')}
              onDelete={() => removeStep(step.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
