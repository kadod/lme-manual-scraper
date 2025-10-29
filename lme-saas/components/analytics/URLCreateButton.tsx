'use client'

import { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { CreateUrlDialog } from './CreateUrlDialog'

export function URLCreateButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <PlusIcon className="h-4 w-4 mr-2" />
        短縮URL作成
      </Button>
      <CreateUrlDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
