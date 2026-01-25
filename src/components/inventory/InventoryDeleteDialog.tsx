import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface InventoryDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  count: number
}

export function InventoryDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  count,
}: InventoryDeleteDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [confirmText, setConfirmText] = useState('')
  const isMatch = confirmText === 'DELETE'

  const handleClose = () => {
    setStep(1)
    setConfirmText('')
    onClose()
  }

  const handleConfirmStep1 = (e: React.MouseEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleFinalConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isMatch) {
      onConfirm()
      handleClose()
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {step === 1 ? 'Clear Inventory?' : 'Final Confirmation'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {step === 1 ? (
              <span>
                Are you sure you want to delete all <strong>{count}</strong>{' '}
                inventory items? This action cannot be undone.
              </span>
            ) : (
              <span className="text-red-600 font-medium">
                This will permanently erase the entire inventory. Type "DELETE"
                below to confirm.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {step === 2 && (
          <div className="py-2">
            <Label className="sr-only">Confirmation</Label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="border-red-300 focus-visible:ring-red-500"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          {step === 1 ? (
            <AlertDialogAction
              onClick={handleConfirmStep1}
              className="bg-red-600 hover:bg-red-700"
            >
              Continue
            </AlertDialogAction>
          ) : (
            <AlertDialogAction
              onClick={handleFinalConfirm}
              disabled={!isMatch}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Permanent Delete
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
