import { useState } from 'react'
import { Partner, PartnerEmployee } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useToast } from '@/hooks/use-toast'
import { Trash2 } from 'lucide-react'

export function PartnerStaff({
  partner,
  onUpdate,
  canEdit,
}: {
  partner: Partner
  onUpdate: (partner: Partner) => void
  canEdit: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', email: '', phone: '' })
  const { toast } = useToast()

  const handleAdd = () => {
    if (!form.name || !form.role) {
      toast({
        title: 'Validation Error',
        description: 'Name and role are required.',
        variant: 'destructive',
      })
      return
    }

    const newEmp: PartnerEmployee = {
      id: `emp-${Date.now()}`,
      name: form.name,
      role: form.role,
      email: form.email,
      phone: form.phone,
      status: 'active',
    }
    onUpdate({
      ...partner,
      employees: [...(partner.employees || []), newEmp],
    })
    setIsOpen(false)
    setForm({ name: '', role: '', email: '', phone: '' })
    toast({ title: 'Employee added successfully' })
  }

  const handleDelete = (empId: string) => {
    onUpdate({
      ...partner,
      employees: (partner.employees || []).filter((e) => e.id !== empId),
    })
    toast({ title: 'Employee removed successfully' })
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-trust-blue text-white">
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    placeholder="e.g. Cleaner, Plumber"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
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
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAdd}
                  className="bg-trust-blue text-white"
                >
                  Save Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Contact</TableHead>
              {canEdit && <TableHead className="text-right">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {(partner.employees || []).map((emp) => (
              <TableRow key={emp.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">{emp.name}</TableCell>
                <TableCell>{emp.role}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs text-slate-500">
                    <span>{emp.email}</span>
                    <span>{emp.phone}</span>
                  </div>
                </TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(emp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {(!partner.employees || partner.employees.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={canEdit ? 4 : 3}
                  className="text-center text-muted-foreground py-6"
                >
                  No team members added yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
