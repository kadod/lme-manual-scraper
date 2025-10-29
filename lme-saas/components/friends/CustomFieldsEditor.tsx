'use client'

import { useState } from 'react'
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateCustomFields } from '@/app/actions/friends'
import { useRouter } from 'next/navigation'

interface CustomFieldsEditorProps {
  friend: {
    id: string
    custom_fields: Record<string, any>
  }
}

export function CustomFieldsEditor({ friend }: CustomFieldsEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>(
    friend.custom_fields || {}
  )
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleAddField = () => {
    if (newFieldKey && newFieldValue) {
      setFields({
        ...fields,
        [newFieldKey]: newFieldValue,
      })
      setNewFieldKey('')
      setNewFieldValue('')
    }
  }

  const handleRemoveField = (key: string) => {
    const newFields = { ...fields }
    delete newFields[key]
    setFields(newFields)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateCustomFields(friend.id, fields)
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to update custom fields:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <PencilIcon className="h-5 w-5" />
          カスタムフィールド
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4 mr-2" />
              編集
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>カスタムフィールド編集</DialogTitle>
              <DialogDescription>
                友だち固有の情報を追加・編集できます
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Existing Fields */}
              {Object.entries(fields).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(fields).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 p-2 border rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{key}</div>
                        <div className="text-sm text-muted-foreground">{value}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveField(key)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Field */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-sm font-semibold">新しいフィールドを追加</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="fieldKey">フィールド名</Label>
                    <Input
                      id="fieldKey"
                      placeholder="例: 誕生日"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fieldValue">値</Label>
                    <Input
                      id="fieldValue"
                      placeholder="例: 1990-01-01"
                      value={newFieldValue}
                      onChange={(e) => setNewFieldValue(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleAddField}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    追加
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {Object.entries(fields).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            カスタムフィールドはまだ設定されていません
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(fields).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
