import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Task } from '@/lib/types'
import useTaskStore from '@/stores/useTaskStore'
import { useToast } from '@/hooks/use-toast'

export function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { updateTask } = useTaskStore()
  const { toast } = useToast()
  const [form, setForm] = useState<Partial<Task>>({})

  useEffect(() => {
    if (task) setForm(task)
  }, [task])

  const handleSave = () => {
    if (task) {
      updateTask({ ...task, ...form } as Task)
      toast({ title: 'Task updated successfully' })
      onOpenChange(false)
    }
  }

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={form.date?.split('T')[0] || ''}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price || ''}
                onChange={(e) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
