'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface QRCodeGeneratorProps {
  url: string
  title?: string
}

export function QRCodeGenerator({ url, title = 'QRコード' }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState(256)
  const [margin, setMargin] = useState(2)

  useEffect(() => {
    generateQRCode()
  }, [url, size, margin])

  const generateQRCode = () => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: margin,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })
    }
  }

  const handleDownloadPNG = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `qrcode-${Date.now()}.png`
    link.href = image
    link.click()
    toast.success('QRコードをダウンロードしました')
  }

  const handleDownloadSVG = async () => {
    try {
      const svg = await QRCode.toString(url, {
        type: 'svg',
        width: size,
        margin: margin,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })

      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const svgUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.svg`
      link.href = svgUrl
      link.click()
      URL.revokeObjectURL(svgUrl)
      toast.success('SVG形式でダウンロードしました')
    } catch (error) {
      toast.error('SVGのダウンロードに失敗しました')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          スマートフォンでスキャンして短縮URLにアクセスできます
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <canvas ref={canvasRef} className="border rounded-lg shadow-sm" />
          <div className="text-sm text-center break-all text-muted-foreground px-4 max-w-md">
            {url}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="qr-size">サイズ (px)</Label>
            <Input
              id="qr-size"
              type="number"
              min="128"
              max="512"
              step="32"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qr-margin">余白</Label>
            <Input
              id="qr-margin"
              type="number"
              min="0"
              max="10"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownloadPNG} className="flex-1">
            PNG形式でダウンロード
          </Button>
          <Button onClick={handleDownloadSVG} variant="outline" className="flex-1">
            SVG形式でダウンロード
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
