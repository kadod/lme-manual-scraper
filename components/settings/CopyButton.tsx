'use client'

import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  text: string
  label?: string
}

export function CopyButton({ text, label = 'コピー' }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
    >
      {label}
    </Button>
  )
}
