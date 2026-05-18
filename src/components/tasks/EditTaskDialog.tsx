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
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { CurrencyInput } from '@/components/ui/currency-input'

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
  const { partners, importPartnerIfNeeded } = usePartnerStore()
  const { currentUser } = useAuthStore()
  const { toast } = useToast()
  const [form, setForm] = useState<Partial<Task>>({})

  const isAdminOrPM = [
    'platform_owner',
    'software_tenant',
    'internal_user',
  ].includes(currentUser?.role as string)
  const isPartner = currentUser?.role === 'partner'

  const availablePartners = isAdminOrPM
    ? partners
    : isPartner
      ? partners.filter((p) => p.id === currentUser?.id)
      : []

  useEffect(() => {
    if (task) {
      setForm({
        ...task,
        pricingModel: task.pricingModel || 'pm_driven',
        price: task.price || 0,
        laborCost: task.laborCost || 0,
        teamMemberPayout: task.teamMemberPayout || 0,
      })
    }
  }, [task])

  const handleSave = () => {
    if (task) {
      const partner = partners.find((p) => p.id === form.assigneeId)
      const emp = partner?.employees?.find(
        (e) => e.id === form.partnerEmployeeId,
      )

      let assigneeName = 'Unassigned'
      if (emp) assigneeName = `${emp.name} - ${partner?.name}`
      else if (partner) assigneeName = partner.name

      if (form.assigneeId) {
        importPartnerIfNeeded(form.assigneeId)
      }

      updateTask({ ...task, ...form, assignee: assigneeName } as Task)
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

  const requiredSkills = form.type ? taskTypeToSkills[form.type] || [] : []
  const selectedPartner = partners.find((p) => p.id === form.assigneeId)
  const availableEmployees = selectedPartner?.employees || []

  const recommendedStaff = availableEmployees.filter((s) =>
    s.skills?.some((sk) => requiredSkills.includes(sk)),
  )
  const otherStaff = availableEmployees.filter(
    (s) => !s.skills?.some((sk) => requiredSkills.includes(sk)),
  )

  const canSetPricingModel = isAdminOrPM
  const canSetOwnerPrice = isAdminOrPM
  const canSetPartnerPrice =
    isAdminOrPM || (isPartner && form.pricingModel === 'partner_driven')
  const canSetTeamMemberPayout = isAdminOrPM || isPartner

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Partner Company</Label>
              <Select
                value={form.assigneeId || 'none'}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    assigneeId: v === 'none' ? undefined : v,
                    partnerEmployeeId: undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned">
                    {(() => {
                      if (!form.assigneeId || form.assigneeId === 'none')
                        return 'Unassigned'
                      const p = availablePartners.find(
                        (x) => x.id === form.assigneeId,
                      ) as any
                      if (!p) return 'Unassigned'
                      return (
                        <div className="flex items-center gap-2">
                          <span>{p.name}</span>
                          {(p.source === 'opporjob' ||
                            p.origin === 'opporjob' ||
                            p.tags?.includes('opporjob') ||
                            p.name?.toLowerCase().includes('opporjob')) && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
                              Opporjob
                            </span>
                          )}
                          {(p.source === 'promoted' ||
                            p.origin === 'promoted' ||
                            p.tags?.includes('promoted')) && (
                            <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
                              Promoted
                            </span>
                          )}
                        </div>
                      )
                    })()}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {availablePartners.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {(p.source === 'opporjob' ||
                          p.origin === 'opporjob' ||
                          p.tags?.includes('opporjob') ||
                          p.name?.toLowerCase().includes('opporjob')) && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
                            Opporjob
                          </span>
                        )}
                        {(p.source === 'promoted' ||
                          p.origin === 'promoted' ||
                          p.tags?.includes('promoted')) && (
                          <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded font-medium">
                            Promoted
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned Member</Label>
              <Select
                value={form.partnerEmployeeId || 'none'}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    partnerEmployeeId: v === 'none' ? undefined : v,
                  })
                }
                disabled={!form.assigneeId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      form.assigneeId ? 'Select Member' : 'Select Partner First'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Any / Unassigned</SelectItem>
                  {recommendedStaff.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-trust-blue">
                        Recommended Staff (Matches Skill)
                      </SelectLabel>
                      {recommendedStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                  {otherStaff.length > 0 && (
                    <SelectGroup>
                      <SelectLabel>Other Staff</SelectLabel>
                      {otherStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Financials Section */}
          <div className="space-y-4 border-t pt-4 mt-4">
            <h4 className="font-semibold text-sm">Financials & Pricing</h4>

            {canSetPricingModel && (
              <div className="space-y-2">
                <Label>Pricing Model</Label>
                <Select
                  value={form.pricingModel || 'pm_driven'}
                  onValueChange={(v: any) =>
                    setForm({ ...form, pricingModel: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pm_driven">
                      PM Driven (Fixed by PM)
                    </SelectItem>
                    <SelectItem value="partner_driven">
                      Partner Driven (Set by Partner)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {canSetOwnerPrice && (
                <div className="space-y-2">
                  <Label>Owner Price ($)</Label>
                  <CurrencyInput
                    value={form.price || 0}
                    onChange={(v) => setForm({ ...form, price: v })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Charged to Owner.
                  </p>
                </div>
              )}
              {canSetPartnerPrice && (
                <div className="space-y-2">
                  <Label>Partner Price ($)</Label>
                  <CurrencyInput
                    value={form.laborCost || 0}
                    onChange={(v) => setForm({ ...form, laborCost: v })}
                    disabled={!isAdminOrPM && form.pricingModel === 'pm_driven'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paid to Partner.
                  </p>
                </div>
              )}
              {canSetTeamMemberPayout && (
                <div className="space-y-2">
                  <Label>Member Payout ($)</Label>
                  <CurrencyInput
                    value={form.teamMemberPayout || 0}
                    onChange={(v) => setForm({ ...form, teamMemberPayout: v })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paid to Staff.
                  </p>
                </div>
              )}
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
