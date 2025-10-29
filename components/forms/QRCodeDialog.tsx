'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

type QRCodeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  formId: string
  formTitle: string
}

export function QRCodeDialog({ open, onOpenChange, formId, formTitle }: QRCodeDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const formUrl = `${window.location.origin}/forms/${formId}`

  useEffect(() => {
    if (open && formId) {
      QRCode.toDataURL(formUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR code generation failed:', err))
    }
  }, [open, formId, formUrl])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(formUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.download = `${formTitle}_qr.png`
    link.href = qrCodeUrl
    link.click()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QRコード</DialogTitle>
          <DialogDescription>{formTitle}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          {qrCodeUrl && (
            <div className="p-4 bg-white rounded-lg border">
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
            </div>
          )}
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={formUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
              />
              <Button size="icon" variant="outline" onClick={handleCopyUrl}>
                <ClipboardDocumentIcon className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 text-center">URLをコピーしました</p>
            )}
          </div>
          <Button onClick={handleDownloadQR} className="w-full">
            QRコードをダウンロード
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
