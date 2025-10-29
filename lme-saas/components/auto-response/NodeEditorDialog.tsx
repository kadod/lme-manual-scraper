'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScenarioNodeData, MessageNodeData, QuestionNodeData, BranchNodeData, ActionNodeData, AnswerType, ActionType } from '@/types/scenario'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface NodeEditorDialogProps {
  open: boolean
  onClose: () => void
  nodeData: ScenarioNodeData | null
  onSave: (data: ScenarioNodeData) => void
}

export function NodeEditorDialog({ open, onClose, nodeData, onSave }: NodeEditorDialogProps) {
  const [editData, setEditData] = useState<ScenarioNodeData | null>(nodeData)

  const handleSave = () => {
    if (editData) {
      onSave(editData)
      onClose()
    }
  }

  if (!editData) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData.type === 'message' && 'メッセージノード編集'}
            {editData.type === 'question' && '質問ノード編集'}
            {editData.type === 'branch' && '分岐ノード編集'}
            {editData.type === 'action' && 'アクションノード編集'}
          </DialogTitle>
        </DialogHeader>

        {editData.type === 'message' && (
          <MessageNodeEditor data={editData} onChange={setEditData} />
        )}
        {editData.type === 'question' && (
          <QuestionNodeEditor data={editData} onChange={setEditData} />
        )}
        {editData.type === 'branch' && (
          <BranchNodeEditor data={editData} onChange={setEditData} />
        )}
        {editData.type === 'action' && (
          <ActionNodeEditor data={editData} onChange={setEditData} />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleSave}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MessageNodeEditor({
  data,
  onChange,
}: {
  data: MessageNodeData
  onChange: (data: MessageNodeData) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>メッセージテキスト</Label>
        <Textarea
          value={data.text}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="送信するメッセージを入力"
          rows={4}
        />
      </div>
      <div>
        <Label>遅延時間（秒）</Label>
        <Input
          type="number"
          min="0"
          value={data.delay}
          onChange={(e) => onChange({ ...data, delay: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div>
        <Label>リッチメッセージID（オプション）</Label>
        <Input
          value={data.richMessageId || ''}
          onChange={(e) => onChange({ ...data, richMessageId: e.target.value })}
          placeholder="リッチメッセージを使用する場合"
        />
      </div>
    </div>
  )
}

function QuestionNodeEditor({
  data,
  onChange,
}: {
  data: QuestionNodeData
  onChange: (data: QuestionNodeData) => void
}) {
  const [newChoice, setNewChoice] = useState('')

  const addChoice = () => {
    if (newChoice.trim()) {
      onChange({
        ...data,
        choices: [...(data.choices || []), newChoice.trim()],
      })
      setNewChoice('')
    }
  }

  const removeChoice = (index: number) => {
    onChange({
      ...data,
      choices: data.choices?.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>質問文</Label>
        <Textarea
          value={data.questionText}
          onChange={(e) => onChange({ ...data, questionText: e.target.value })}
          placeholder="ユーザーに質問する内容"
          rows={3}
        />
      </div>
      <div>
        <Label>回答タイプ</Label>
        <Select
          value={data.answerType}
          onValueChange={(value: AnswerType) => onChange({ ...data, answerType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free_text">自由入力</SelectItem>
            <SelectItem value="single_choice">単一選択</SelectItem>
            <SelectItem value="multiple_choice">複数選択</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(data.answerType === 'single_choice' || data.answerType === 'multiple_choice') && (
        <div>
          <Label>選択肢</Label>
          <div className="space-y-2">
            {data.choices?.map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={choice} disabled />
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => removeChoice(index)}
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input
                value={newChoice}
                onChange={(e) => setNewChoice(e.target.value)}
                placeholder="新しい選択肢"
                onKeyDown={(e) => e.key === 'Enter' && addChoice()}
              />
              <Button variant="outline" size="icon-sm" onClick={addChoice}>
                <PlusIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <Label>タイムアウト（分）</Label>
        <Input
          type="number"
          min="1"
          value={data.timeoutMinutes}
          onChange={(e) => onChange({ ...data, timeoutMinutes: parseInt(e.target.value) || 5 })}
        />
      </div>
      <div>
        <Label>タイムアウト時の動作</Label>
        <Select
          value={data.timeoutAction || 'end'}
          onValueChange={(value: 'end' | 'continue') =>
            onChange({ ...data, timeoutAction: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="end">終了</SelectItem>
            <SelectItem value="continue">続行</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

function BranchNodeEditor({
  data,
  onChange,
}: {
  data: BranchNodeData
  onChange: (data: BranchNodeData) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>分岐条件</Label>
        <p className="text-sm text-gray-600 mb-2">
          各分岐の詳細設定は後のフェーズで実装予定
        </p>
        <div className="text-sm text-gray-700">
          条件数: {data.conditions.length}
        </div>
      </div>
    </div>
  )
}

function ActionNodeEditor({
  data,
  onChange,
}: {
  data: ActionNodeData
  onChange: (data: ActionNodeData) => void
}) {
  const addAction = () => {
    onChange({
      ...data,
      actions: [
        ...data.actions,
        {
          id: Date.now().toString(),
          actionType: 'add_tag',
        },
      ],
    })
  }

  const removeAction = (id: string) => {
    onChange({
      ...data,
      actions: data.actions.filter((a) => a.id !== id),
    })
  }

  const updateAction = (id: string, actionType: ActionType) => {
    onChange({
      ...data,
      actions: data.actions.map((a) => (a.id === id ? { ...a, actionType } : a)),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>アクション</Label>
        <div className="space-y-2 mt-2">
          {data.actions.map((action) => (
            <div key={action.id} className="flex items-center gap-2">
              <Select
                value={action.actionType}
                onValueChange={(value: ActionType) => updateAction(action.id, value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add_tag">タグ追加</SelectItem>
                  <SelectItem value="remove_tag">タグ削除</SelectItem>
                  <SelectItem value="add_segment">セグメント追加</SelectItem>
                  <SelectItem value="remove_segment">セグメント削除</SelectItem>
                  <SelectItem value="update_field">フィールド更新</SelectItem>
                  <SelectItem value="start_step">ステップ配信開始</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => removeAction(action.id)}
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={addAction} className="w-full">
            <PlusIcon className="size-4 mr-2" />
            アクション追加
          </Button>
        </div>
      </div>
    </div>
  )
}
