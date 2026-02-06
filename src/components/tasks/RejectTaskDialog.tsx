import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import useTaskStore from '@/stores/useTaskStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { AlertTriangle } from 'lucide-react'

interface RejectTaskDialogProps {
  taskId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RejectTaskDialog({
  taskId,
  open,
  onOpenChange,
}: RejectTaskDialogProps) {
  const { rejectTask } = useTaskStore()
  const { t } = useLanguageStore()
  const [reason, setReason] = useState('')
  const [error, setError] = useState(false)

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError(true)
      return
    }
    rejectTask(taskId, reason)
    setReason('')
    setError(false)
    onOpenChange(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setReason('')
      setError(false)
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Reject Task
          </DialogTitle>
          <DialogDescription>
            This action will return the task to the requester for modification
            or cancellation. Please provide a reason.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Rejection *</Label>
            <Textarea
              id="reason"
              placeholder="e.g. Cost is too high, details are missing..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (error && e.target.value.trim()) setError(false)
              }}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-xs text-destructive font-medium">
                A reason is required to reject the task.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Reject Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
