'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface QRCodeDisplayProps {
  url: string
  onClose: () => void
}

export function QRCodeDisplay({ url, onClose }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
    }
  }, [url])

  const handleDownload = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const image = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = image
    link.click()
    toast.success('QRコードをダウンロードしました')
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>QRコード</DialogTitle>
          <DialogDescription>
            スマートフォンでスキャンして短縮URLにアクセスできます
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 space-y-4">
          <canvas ref={canvasRef} className="border rounded-lg" />
          <div className="text-sm text-center break-all text-muted-foreground px-4">
            {url}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
          <Button onClick={handleDownload}>ダウンロード</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
