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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Task } from '@/lib/types'
import useTaskStore from '@/stores/useTaskStore'
import usePartnerStore from '@/stores/usePartnerStore'
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
  const { partners } = usePartnerStore()
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

  const taskTypeToSkills: Record<string, string[]> = {
    cleaning: ['cleaning', 'deep_cleaning'],
    maintenance: [
      'plumbing',
      'electrical',
      'hvac',
      'painting',
      'general_maintenance',
      'pool',
      'pest_control',
    ],
  }

  const requiredSkills = task.type ? taskTypeToSkills[task.type] || [] : []

  const assignableStaff = partners.flatMap((partner) => {
    return (partner.employees || []).map((emp) => ({
      id: emp.id,
      name: emp.name,
      partnerId: partner.id,
      partnerName: partner.name,
      skills: emp.skills || [],
    }))
  })

  const recommendedStaff = assignableStaff.filter((s) =>
    s.skills.some((sk) => requiredSkills.includes(sk)),
  )
  const otherStaff = assignableStaff.filter(
    (s) => !s.skills.some((sk) => requiredSkills.includes(sk)),
  )

  const currentAssigneeVal = form.partnerEmployeeId
    ? `employee:${form.partnerEmployeeId}`
    : form.assigneeId
      ? `partner:${form.assigneeId}`
      : 'none'

  const handleAssigneeChange = (val: string) => {
    if (val === 'none') {
      setForm((prev) => ({
        ...prev,
        assigneeId: undefined,
        partnerEmployeeId: undefined,
        assignee: 'Unassigned',
      }))
      return
    }

    const [type, id] = val.split(':')
    if (type === 'employee') {
      const staff = assignableStaff.find((s) => s.id === id)
      if (staff) {
        setForm((prev) => ({
          ...prev,
          assigneeId: staff.partnerId,
          partnerEmployeeId: staff.id,
          assignee: `${staff.name} - ${staff.partnerName}`,
        }))
      }
    } else if (type === 'partner') {
      const partner = partners.find((p) => p.id === id)
      if (partner) {
        setForm((prev) => ({
          ...prev,
          assigneeId: partner.id,
          partnerEmployeeId: undefined,
          assignee: partner.name,
        }))
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
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
            <Label>Description</Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trust-blue"
              value={form.description || ''}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Task details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date?.split('T')[0] || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    date: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v: any) => setForm({ ...form, priority: v })}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: any) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending_approval">
                    Pending Approval
                  </SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignee (Staff / Partner)</Label>
              <Select
                value={currentAssigneeVal}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>

                  {recommendedStaff.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-trust-blue">
                        Recommended Staff (Matches Skill)
                      </SelectLabel>
                      {recommendedStaff.map((staff) => (
                        <SelectItem
                          key={`emp-${staff.id}`}
                          value={`employee:${staff.id}`}
                        >
                          {staff.name} - {staff.partnerName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  {otherStaff.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Other Staff</SelectLabel>
                      {otherStaff.map((staff) => (
                        <SelectItem
                          key={`emp-${staff.id}`}
                          value={`employee:${staff.id}`}
                        >
                          {staff.name} - {staff.partnerName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  {partners.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Partners (Agencies)</SelectLabel>
                      {partners.map((partner) => (
                        <SelectItem
                          key={`pat-${partner.id}`}
                          value={`partner:${partner.id}`}
                        >
                          {partner.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
