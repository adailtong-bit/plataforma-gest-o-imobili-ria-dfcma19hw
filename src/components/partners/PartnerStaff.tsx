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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Search, Plus, UserPlus } from 'lucide-react'
import { opporjobStaffMock } from '@/stores/usePartnerStore'

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
  const [searchOpporjob, setSearchOpporjob] = useState('')
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

  const handleImportOpporjob = (staff: any) => {
    const existing = (partner.employees || []).find((e) => e.id === staff.id)
    if (existing) {
      toast({
        title: 'Already added',
        description: 'This member is already in your team.',
        variant: 'destructive',
      })
      return
    }

    const newEmp: PartnerEmployee = {
      id: staff.id,
      name: staff.name,
      role: staff.role,
      email: staff.email,
      phone: staff.phone,
      status: 'active',
      skills: staff.skills,
    }

    onUpdate({
      ...partner,
      employees: [...(partner.employees || []), newEmp],
    })

    setIsOpen(false)
    toast({
      title: 'Imported successfully',
      description: `${staff.name} is now integrated into SUMMERPM.`,
    })
  }

  const handleDelete = (empId: string) => {
    onUpdate({
      ...partner,
      employees: (partner.employees || []).filter((e) => e.id !== empId),
    })
    toast({ title: 'Employee removed successfully' })
  }

  const filteredOpporjob = opporjobStaffMock.filter(
    (s) =>
      s.name.toLowerCase().includes(searchOpporjob.toLowerCase()) ||
      s.role.toLowerCase().includes(searchOpporjob.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-trust-blue text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="manual" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  <TabsTrigger value="opporjob" className="gap-2">
                    Opporjob Network
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="manual" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Full Name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      placeholder="e.g. Cleaner, Plumber"
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
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
                  <DialogFooter className="mt-4">
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
                </TabsContent>

                <TabsContent
                  value="opporjob"
                  className="space-y-4 py-4 min-h-[300px]"
                >
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search Opporjob professionals..."
                      className="pl-8"
                      value={searchOpporjob}
                      onChange={(e) => setSearchOpporjob(e.target.value)}
                    />
                  </div>

                  <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                    {filteredOpporjob.map((staff) => (
                      <div
                        key={staff.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-50"
                      >
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {staff.name}
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 py-0 h-4"
                            >
                              Opporjob
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {staff.role} • {staff.email}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 shrink-0"
                          onClick={() => handleImportOpporjob(staff)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" /> Import
                        </Button>
                      </div>
                    ))}
                    {filteredOpporjob.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No professionals found.
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Importing a professional integrates them into SUMMERPM for
                    payments and tasks.
                  </p>
                </TabsContent>
              </Tabs>
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
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {emp.name}
                    {emp.id.startsWith('oj-') && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 py-0 h-4"
                      >
                        Opporjob
                      </Badge>
                    )}
                  </div>
                </TableCell>
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
