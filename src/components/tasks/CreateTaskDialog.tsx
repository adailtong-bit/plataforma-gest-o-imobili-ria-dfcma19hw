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
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { CurrencyInput } from '@/components/ui/currency-input'

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const { addTask } = useTaskStore()
  const { properties } = usePropertyStore()
  const { partners } = usePartnerStore()
  const { currentUser } = useAuthStore()
  const { toast } = useToast()

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

  const partnerData = isPartner
    ? partners.find((p) => p.id === currentUser?.id)
    : null
  const availableProperties = isPartner
    ? properties.filter((p) => partnerData?.linkedPropertyIds?.includes(p.id))
    : properties

  const [form, setForm] = useState({
    title: '',
    propertyId: '',
    type: '',
    priority: 'medium',
    assigneeId: '',
    partnerEmployeeId: '',
    date: new Date().toISOString().split('T')[0],
    pricingModel: 'pm_driven' as 'pm_driven' | 'partner_driven',
    price: 0,
    laborCost: 0,
    teamMemberPayout: 0,
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

    const prop = availableProperties.find((p) => p.id === form.propertyId)
    const partner = partners.find((p) => p.id === form.assigneeId)
    const emp = partner?.employees?.find((e) => e.id === form.partnerEmployeeId)

    let assigneeName = 'Unassigned'
    if (emp) assigneeName = `${emp.name} - ${partner?.name}`
    else if (partner) assigneeName = partner.name

    const priceToCheck =
      form.pricingModel === 'pm_driven' ? form.price : form.laborCost
    const isAboveThreshold = priceToCheck >= 100

    const initialStatus = isAboveThreshold ? 'pending_approval' : 'pending'
    const initialApprovalStatus = isAboveThreshold ? 'owner_pending' : undefined

    addTask({
      title: form.title,
      propertyId: form.propertyId,
      propertyName: prop?.name || '',
      propertyAddress: prop?.address,
      type: form.type as any,
      priority: form.priority as any,
      status: initialStatus,
      approvalStatus: initialApprovalStatus,
      date: form.date,
      assigneeId: form.assigneeId || undefined,
      partnerEmployeeId: form.partnerEmployeeId || undefined,
      assignee: assigneeName,
      pricingModel: form.pricingModel,
      price: form.price,
      laborCost: form.laborCost,
      teamMemberPayout: form.teamMemberPayout,
      source: 'manual',
    })

    toast({
      title: 'Task created successfully',
      description: isAboveThreshold
        ? 'Task value exceeds $100 and requires Owner Approval.'
        : undefined,
    })
    setOpen(false)
    setForm({
      title: '',
      propertyId: '',
      type: '',
      priority: 'medium',
      assigneeId: '',
      partnerEmployeeId: '',
      date: new Date().toISOString().split('T')[0],
      pricingModel: 'pm_driven',
      price: 0,
      laborCost: 0,
      teamMemberPayout: 0,
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-trust-blue text-white gap-2 h-9">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
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
                {availableProperties.map((p) => (
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
              <Label>Partner Company</Label>
              <Select
                value={form.assigneeId || 'none'}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    assigneeId: v === 'none' ? '' : v,
                    partnerEmployeeId: '',
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {availablePartners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned Team Member</Label>
              <Select
                value={form.partnerEmployeeId || 'none'}
                onValueChange={(v) =>
                  setForm({ ...form, partnerEmployeeId: v === 'none' ? '' : v })
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
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

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
