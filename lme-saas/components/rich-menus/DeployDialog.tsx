'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { deployRichMenu, setAsDefault } from '@/app/actions/rich-menus'

type DeployDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  richMenuId: string
  richMenuName: string
}

export function DeployDialog({
  open,
  onOpenChange,
  richMenuId,
  richMenuName,
}: DeployDialogProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [setAsDefaultMenu, setSetAsDefaultMenu] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await deployRichMenu({
        richMenuId,
        setAsDefault: setAsDefaultMenu,
      })

      if (!result.success) {
        setError(result.error || 'Failed to deploy')
      } else {
        setSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          setSuccess(false)
          setSetAsDefaultMenu(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Deploy error:', error)
      setError('Failed to deploy')
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deploy Rich Menu</DialogTitle>
          <DialogDescription>
            Deploy &quot;{richMenuName}&quot; to LINE
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={setAsDefaultMenu}
              onChange={(e) => setSetAsDefaultMenu(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isDeploying}
            />
            <div className="flex-1">
              <div className="font-medium">Set as default menu</div>
              <div className="text-sm text-gray-500">
                Display this rich menu to all friends
              </div>
            </div>
          </label>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">Successfully deployed</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeploying}
          >
            Cancel
          </Button>
          <Button onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
