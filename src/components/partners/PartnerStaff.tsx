import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Edit, Calendar } from 'lucide-react'
import { Partner, PartnerEmployee } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { addDays, format } from 'date-fns'

interface PartnerStaffProps {
  partner: Partner
  onUpdate: (partner: Partner) => void
  canEdit: boolean
}

export function PartnerStaff({
  partner,
  onUpdate,
  canEdit,
}: PartnerStaffProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<PartnerEmployee>>({
    name: '',
    role: '',
    email: '',
    phone: '',
    status: 'active',
  })

  // Scheduler state
  const [schedulerOpen, setSchedulerOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] =
    useState<PartnerEmployee | null>(null)
  const [scheduleDate, setScheduleDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd'),
  )
  const [scheduleSlots, setScheduleSlots] = useState<string>('09:00, 14:00')

  const handleSave = () => {
    if (!formData.name || !formData.role) return

    const employees = partner.employees ? [...partner.employees] : []

    if (editingId) {
      const index = employees.findIndex((e) => e.id === editingId)
      if (index !== -1) {
        employees[index] = { ...employees[index], ...formData } as any
      }
    } else {
      employees.push({
        id: `emp-${Date.now()}`,
        status: 'active',
        ...formData,
      } as PartnerEmployee)
    }

    onUpdate({ ...partner, employees })
    setOpen(false)
    resetForm()
    toast({ title: 'Sucesso', description: 'Funcionário salvo com sucesso.' })
  }

  const handleDelete = (id: string) => {
    if (confirm('Remover funcionário?')) {
      const employees = partner.employees?.filter((e) => e.id !== id) || []
      onUpdate({ ...partner, employees })
    }
  }

  const handleEdit = (employee: PartnerEmployee) => {
    setEditingId(employee.id)
    setFormData(employee)
    setOpen(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      status: 'active',
    })
  }

  // Schedule logic
  const openScheduler = (employee: PartnerEmployee) => {
    setSelectedEmployee(employee)
    setSchedulerOpen(true)
    // Pre-fill if exists for today?
    // Simplified for now
  }

  const saveSchedule = () => {
    if (!selectedEmployee) return

    const employees = partner.employees ? [...partner.employees] : []
    const index = employees.findIndex((e) => e.id === selectedEmployee.id)
    if (index !== -1) {
      const emp = employees[index]
      const currentSchedule = emp.schedule || []
      // remove existing for that date
      const filtered = currentSchedule.filter((s) => s.date !== scheduleDate)
      filtered.push({
        date: scheduleDate,
        slots: scheduleSlots.split(',').map((s) => s.trim()),
      })
      employees[index] = { ...emp, schedule: filtered }
      onUpdate({ ...partner, employees })
      toast({ title: 'Agenda atualizada' })
      setSchedulerOpen(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Equipe Interna</CardTitle>
        {canEdit && (
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v)
              if (!v) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="bg-trust-blue">
                <Plus className="h-4 w-4 mr-2" /> Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar' : 'Novo'} Funcionário
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Cargo / Função</Label>
                  <Input
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="Ex: Supervisor, Cleaner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Telefone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleSave}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partner.employees?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Nenhum funcionário cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              partner.employees?.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.role}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span>{emp.email}</span>
                      <span className="text-muted-foreground">{emp.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        emp.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openScheduler(emp)}
                        title="Agenda"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(emp)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDelete(emp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Schedule Dialog */}
        <Dialog open={schedulerOpen} onOpenChange={setSchedulerOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agenda: {selectedEmployee?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Horários Disponíveis (separados por vírgula)</Label>
                <Input
                  value={scheduleSlots}
                  onChange={(e) => setScheduleSlots(e.target.value)}
                  placeholder="09:00, 14:00"
                />
              </div>
              <Button onClick={saveSchedule}>Atualizar Disponibilidade</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
