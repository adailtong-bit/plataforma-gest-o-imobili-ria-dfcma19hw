import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Partner, PartnerEmployee } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Pencil, Trash2, UserCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MultiSelect, OptionType } from '@/components/ui/multi-select'
import { useToast } from '@/hooks/use-toast'

const SKILL_OPTIONS: OptionType[] = [
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Deep Cleaning', value: 'deep_cleaning' },
  { label: 'Plumbing', value: 'plumbing' },
  { label: 'Electrical', value: 'electrical' },
  { label: 'HVAC', value: 'hvac' },
  { label: 'Painting', value: 'painting' },
  { label: 'General Maintenance', value: 'general_maintenance' },
  { label: 'Pool Maintenance', value: 'pool' },
  { label: 'Pest Control', value: 'pest_control' },
]

export function PartnerStaff({
  partner,
  onUpdate,
  canEdit,
}: {
  partner: Partner
  onUpdate: (partner: Partner) => void
  canEdit: boolean
}) {
  const { toast } = useToast()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<PartnerEmployee | null>(null)
  const [form, setForm] = useState<{
    name: string
    phone: string
    email: string
    skills: string[]
  }>({
    name: '',
    phone: '',
    email: '',
    skills: [],
  })

  const staff = partner.employees || []

  const handleAddStaff = () => {
    if (!form.name) return

    const newStaff: PartnerEmployee = {
      id: `staff-${Date.now()}`,
      name: form.name,
      role: 'Staff',
      phone: form.phone,
      email: form.email,
      skills: form.skills,
      status: 'active',
    }

    onUpdate({
      ...partner,
      employees: [...staff, newStaff],
    })

    setIsAddOpen(false)
    setForm({ name: '', phone: '', email: '', skills: [] })
    toast({ title: 'Success', description: 'Team member added.' })
  }

  const handleEditStaff = () => {
    if (!editingStaff || !form.name) return

    const updatedStaff = staff.map((s) => {
      if (s.id === editingStaff.id) {
        return {
          ...s,
          name: form.name,
          phone: form.phone,
          email: form.email,
          skills: form.skills,
        }
      }
      return s
    })

    onUpdate({
      ...partner,
      employees: updatedStaff,
    })

    setIsAddOpen(false)
    setEditingStaff(null)
    toast({ title: 'Success', description: 'Team member updated.' })
  }

  const handleDeleteStaff = (id: string) => {
    onUpdate({
      ...partner,
      employees: staff.filter((s) => s.id !== id),
    })
    toast({ title: 'Success', description: 'Team member removed.' })
  }

  const openEdit = (employee: PartnerEmployee) => {
    setEditingStaff(employee)
    setForm({
      name: employee.name,
      phone: employee.phone || '',
      email: employee.email || '',
      skills: employee.skills || [],
    })
    setIsAddOpen(true)
  }

  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
        <div>
          <CardTitle>Team & Staff</CardTitle>
          <CardDescription>
            Manage individual team members and their specific skills for task
            allocation.
          </CardDescription>
        </div>
        {canEdit && (
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingStaff(null)
                setForm({ name: '', phone: '', email: '', skills: [] })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue text-white gap-2">
                <Plus className="h-4 w-4" /> Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingStaff ? 'Edit Team Member' : 'Add Team Member'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Member Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Skills Map (For Task Allocation)</Label>
                  <MultiSelect
                    options={SKILL_OPTIONS}
                    selected={form.skills}
                    onChange={(val) => setForm({ ...form, skills: val })}
                    placeholder="Select skills..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={editingStaff ? handleEditStaff : handleAddStaff}
                  className="bg-trust-blue text-white"
                >
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-slate-400" />
                  {member.name}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {member.phone && <div>{member.phone}</div>}
                    {member.email && (
                      <div className="text-muted-foreground">
                        {member.email}
                      </div>
                    )}
                    {!member.phone && !member.email && '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {member.skills && member.skills.length > 0 ? (
                      member.skills.map((skill) => {
                        const opt = SKILL_OPTIONS.find((s) => s.value === skill)
                        return (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="font-normal text-xs"
                          >
                            {opt ? opt.label : skill}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.status === 'active' ? 'default' : 'outline'}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(member)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDeleteStaff(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No team members registered yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
