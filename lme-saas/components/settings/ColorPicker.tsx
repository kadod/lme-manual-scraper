'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ColorPickerProps {
  primaryColor: string
  secondaryColor: string
  onUpdate: (colors: { primaryColor: string; secondaryColor: string }) => Promise<void>
}

const PRESET_COLORS = [
  { name: 'LINE Green', primary: '#00B900', secondary: '#06C755' },
  { name: 'Blue', primary: '#0066FF', secondary: '#4D94FF' },
  { name: 'Purple', primary: '#9333EA', secondary: '#A855F7' },
  { name: 'Red', primary: '#EF4444', secondary: '#F87171' },
  { name: 'Orange', primary: '#F97316', secondary: '#FB923C' },
]

export function ColorPicker({ primaryColor, secondaryColor, onUpdate }: ColorPickerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [colors, setColors] = useState({ primaryColor, secondaryColor })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onUpdate(colors)
    } finally {
      setIsLoading(false)
    }
  }

  const applyPreset = async (preset: typeof PRESET_COLORS[0]) => {
    const newColors = { primaryColor: preset.primary, secondaryColor: preset.secondary }
    setColors(newColors)
    setIsLoading(true)
    try {
      await onUpdate(newColors)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ブランドカラー</CardTitle>
        <CardDescription>組織のブランドカラーを設定します</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">プライマリカラー</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={colors.primaryColor}
                  onChange={(e) => setColors({ ...colors, primaryColor: e.target.value })}
                  className="h-10 w-20"
                />
                <Input
                  type="text"
                  value={colors.primaryColor}
                  onChange={(e) => setColors({ ...colors, primaryColor: e.target.value })}
                  placeholder="#00B900"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">セカンダリカラー</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={colors.secondaryColor}
                  onChange={(e) => setColors({ ...colors, secondaryColor: e.target.value })}
                  className="h-10 w-20"
                />
                <Input
                  type="text"
                  value={colors.secondaryColor}
                  onChange={(e) => setColors({ ...colors, secondaryColor: e.target.value })}
                  placeholder="#06C755"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>プリセットカラー</Label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="group relative h-10 w-10 rounded-md border-2 hover:border-gray-400 transition-colors"
                  title={preset.name}
                  disabled={isLoading}
                >
                  <div className="absolute inset-0 rounded-md overflow-hidden">
                    <div className="h-full w-1/2 float-left" style={{ backgroundColor: preset.primary }} />
                    <div className="h-full w-1/2 float-left" style={{ backgroundColor: preset.secondary }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
