import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import useTaskStore from '@/stores/useTaskStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Task } from '@/lib/types'

interface CreateTaskDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialPropertyId?: string
  initialDate?: Date
}

export function CreateTaskDialog({
  open: controlledOpen,
  onOpenChange,
  initialPropertyId,
  initialDate,
}: CreateTaskDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const { addTask } = useTaskStore()
  const { properties } = usePropertyStore()
  const { currentUser } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    propertyId: initialPropertyId || '',
    type: 'maintenance',
    priority: 'medium',
    date: initialDate ? initialDate.toISOString().split('T')[0] : '',
    description: '',
  })

  const handleSave = () => {
    if (!newTask.title || !newTask.propertyId) {
      toast({
        title: 'Error',
        description: 'Title and Property are required.',
        variant: 'destructive',
      })
      return
    }

    const prop = properties.find((p) => p.id === newTask.propertyId)

    addTask({
      ...newTask,
      id: `task-${Date.now()}`,
      status: 'pending',
      propertyName: prop?.name || 'Unknown',
      date: newTask.date
        ? new Date(newTask.date).toISOString()
        : new Date().toISOString(),
      assignee: 'Unassigned',
      createdBy: currentUser.id,
    } as Task)

    toast({ title: 'Success', description: 'Task created.' })
    if (setIsOpen) setIsOpen(false)
    setNewTask({
      title: '',
      propertyId: '',
      type: 'maintenance',
      priority: 'medium',
      date: '',
      description: '',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="bg-trust-blue gap-2">
            <Plus className="h-4 w-4" /> {t('common.new_task')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('common.create_title')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t('tasks.task_title')}</Label>
            <Input
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('common.property')}</Label>
            <Select
              value={newTask.propertyId}
              onValueChange={(v) => setNewTask({ ...newTask, propertyId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('common.type')}</Label>
              <Select
                value={newTask.type}
                onValueChange={(v) =>
                  setNewTask({ ...newTask, type: v as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">
                    {t('partners.maintenance')}
                  </SelectItem>
                  <SelectItem value="cleaning">
                    {t('partners.cleaning')}
                  </SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t('common.priority')}</Label>
              <Select
                value={newTask.priority}
                onValueChange={(v) =>
                  setNewTask({ ...newTask, priority: v as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t('common.date')}</Label>
            <Input
              type="date"
              value={newTask.date}
              onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('common.description')}</Label>
            <Textarea
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
