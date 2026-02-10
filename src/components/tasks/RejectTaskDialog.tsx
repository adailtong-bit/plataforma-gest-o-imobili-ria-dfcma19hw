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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import useTaskStore from '@/stores/useTaskStore'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    if (!reason.trim()) {
      toast({
        title: 'Error',
        description: 'Reason is required',
        variant: 'destructive',
      })
      return
    }
    rejectTask(taskId, reason)
    toast({ title: 'Task Rejected' })
    onOpenChange(false)
    setReason('')
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Task</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this task. This will be sent
            to the requester.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-2">
          <Label>Reason</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this being rejected?"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
