import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import useTaskStore from '@/stores/useTaskStore'
import { useToast } from '@/hooks/use-toast'

export function RejectTaskDialog({
  taskId,
  open,
  onOpenChange,
}: {
  taskId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { rejectTask } = useTaskStore()
  const { toast } = useToast()
  const [reason, setReason] = useState('')

  const handleReject = () => {
    if (!reason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      })
      return
    }
    rejectTask(taskId, reason)
    toast({
      title: 'Task Rejected',
      description: 'The task has been marked as rejected.',
    })
    onOpenChange(false)
    setReason('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason for Rejection *</Label>
            <Textarea
              placeholder="Explain why this task is being rejected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReject}>
            Reject Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
