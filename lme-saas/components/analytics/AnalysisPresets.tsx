'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { BookmarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid'

export interface AnalysisPreset {
  id: string
  name: string
  xAxis: string
  yAxis: string
  dateFrom?: string
  dateTo?: string
  status?: string
}

interface AnalysisPresetsProps {
  presets: AnalysisPreset[]
  onLoadPreset: (preset: AnalysisPreset) => void
  onSavePreset: (name: string, config: Omit<AnalysisPreset, 'id' | 'name'>) => void
  onDeletePreset: (id: string) => void
  currentConfig: Omit<AnalysisPreset, 'id' | 'name'>
}

export function AnalysisPresets({
  presets,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
  currentConfig
}: AnalysisPresetsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [presetName, setPresetName] = useState('')

  const handleSave = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim(), currentConfig)
      setPresetName('')
      setDialogOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BookmarkSolidIcon className="w-5 h-5 text-blue-600" />
          保存済みプリセット
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <PlusIcon className="w-4 h-4 mr-1" />
              プリセット保存
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>プリセットを保存</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="preset-name">プリセット名</Label>
                <Input
                  id="preset-name"
                  placeholder="例: タグ別配信分析"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave()
                    }
                  }}
                />
              </div>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
                <p><span className="font-medium">X軸:</span> {currentConfig.xAxis}</p>
                <p><span className="font-medium">Y軸:</span> {currentConfig.yAxis}</p>
                {currentConfig.dateFrom && (
                  <p><span className="font-medium">期間:</span> {currentConfig.dateFrom} 〜 {currentConfig.dateTo}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={!presetName.trim()}>
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {presets.length > 0 ? (
          <div className="space-y-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <button
                  onClick={() => onLoadPreset(preset)}
                  className="flex-1 text-left"
                >
                  <div className="font-medium text-sm mb-1">{preset.name}</div>
                  <div className="text-xs text-gray-600">
                    {preset.xAxis} × {preset.yAxis}
                  </div>
                </button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeletePreset(preset.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            <BookmarkIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
            保存されたプリセットはありません
          </div>
        )}
      </CardContent>
    </Card>
  )
}
