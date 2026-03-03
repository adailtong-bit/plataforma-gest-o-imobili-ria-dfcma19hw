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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Plus } from 'lucide-react'
import useTaskStore from '@/stores/useTaskStore'
import usePropertyStore from '@/stores/usePropertyStore'
import usePartnerStore from '@/stores/usePartnerStore'
import { useToast } from '@/hooks/use-toast'

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const { addTask } = useTaskStore()
  const { properties } = usePropertyStore()
  const { partners } = usePartnerStore()
  const { toast } = useToast()

  const [form, setForm] = useState({
    title: '',
    propertyId: '',
    type: '',
    priority: 'medium',
    assigneeId: '',
    partnerEmployeeId: '',
    assigneeName: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSave = () => {
    if (!form.title || !form.propertyId || !form.type) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      })
      return
    }

    const prop = properties.find((p) => p.id === form.propertyId)

    addTask({
      id: `task-${Date.now()}`,
      title: form.title,
      propertyId: form.propertyId,
      propertyName: prop?.name || '',
      propertyAddress: prop?.address,
      type: form.type as any,
      priority: form.priority as any,
      status: 'pending',
      date: form.date,
      assigneeId: form.assigneeId || undefined,
      partnerEmployeeId: form.partnerEmployeeId || undefined,
      assignee: form.assigneeName || 'Unassigned',
      source: 'manual',
    })

    toast({ title: 'Task created successfully' })
    setOpen(false)
    setForm({
      title: '',
      propertyId: '',
      type: '',
      priority: 'medium',
      assigneeId: '',
      partnerEmployeeId: '',
      assigneeName: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

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

  const requiredSkills = form.type ? taskTypeToSkills[form.type] || [] : []

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
        assigneeId: '',
        partnerEmployeeId: '',
        assigneeName: '',
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
          assigneeName: `${staff.name} - ${staff.partnerName}`,
        }))
      }
    } else if (type === 'partner') {
      const partner = partners.find((p) => p.id === id)
      if (partner) {
        setForm((prev) => ({
          ...prev,
          assigneeId: partner.id,
          partnerEmployeeId: '',
          assigneeName: partner.name,
        }))
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-trust-blue text-white gap-2 h-9">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Property *</Label>
            <Select
              value={form.propertyId}
              onValueChange={(v) => setForm({ ...form, propertyId: v })}
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
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
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
              <Label>Assignee</Label>
              <Select
                value={currentAssigneeVal}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
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
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue text-white">
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
