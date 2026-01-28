import { useState, useRef } from 'react'
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
import { Plus, Trash2, Edit, Calendar, Upload } from 'lucide-react'
import { Partner, PartnerEmployee, GenericDocument } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    documents: [],
  })

  // Scheduler state
  const [schedulerOpen, setSchedulerOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] =
    useState<PartnerEmployee | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [scheduleSlots, setScheduleSlots] = useState<string>('09:00, 14:00')
  const [scheduleValue, setScheduleValue] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)

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
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      documents: [],
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const newDoc: GenericDocument = {
        id: `doc-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        date: new Date().toISOString(),
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        category: 'ID', // Default to ID
      }
      setFormData((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), newDoc],
      }))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeDocument = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((d) => d.id !== id),
    }))
  }

  // Schedule logic
  const openScheduler = (employee: PartnerEmployee) => {
    setSelectedEmployee(employee)
    setSelectedDate(new Date())
    updateSchedulerForm(employee, new Date())
    setSchedulerOpen(true)
  }

  const updateSchedulerForm = (employee: PartnerEmployee, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const existing = employee.schedule?.find((s) => s.date === dateStr)
    if (existing) {
      setScheduleSlots(existing.slots.join(', '))
      setScheduleValue(existing.value ? existing.value.toString() : '')
    } else {
      setScheduleSlots('09:00, 14:00')
      setScheduleValue('')
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !selectedEmployee) return
    setSelectedDate(date)
    updateSchedulerForm(selectedEmployee, date)
  }

  const saveSchedule = () => {
    if (!selectedEmployee || !selectedDate) return

    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const employees = partner.employees ? [...partner.employees] : []
    const index = employees.findIndex((e) => e.id === selectedEmployee.id)

    if (index !== -1) {
      const emp = employees[index]
      const currentSchedule = emp.schedule || []
      const filtered = currentSchedule.filter((s) => s.date !== dateStr)

      if (scheduleSlots.trim()) {
        filtered.push({
          date: dateStr,
          slots: scheduleSlots.split(',').map((s) => s.trim()),
          value: scheduleValue ? parseFloat(scheduleValue) : undefined,
        })
      }

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
            <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Editar' : 'Novo'} Funcionário
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid gap-2">
                  <Label>Endereço</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="grid gap-2">
                    <Label>Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Estado</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>CEP</Label>
                    <Input
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>País</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="border rounded p-3 bg-muted/20">
                  <div className="flex justify-between items-center mb-2">
                    <Label className="font-semibold">
                      Documentos (CNH, Passaporte)
                    </Label>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-3 w-3 mr-1" /> Upload
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {formData.documents?.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between text-sm bg-background p-2 rounded border"
                      >
                        <span>
                          {doc.name} ({doc.category})
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {(!formData.documents ||
                      formData.documents.length === 0) && (
                      <span className="text-xs text-muted-foreground">
                        Nenhum documento anexado.
                      </span>
                    )}
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
            {!partner.employees || partner.employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhum funcionário cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              partner.employees.map((emp) => (
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

        {/* Scheduler Dialog */}
        <Dialog open={schedulerOpen} onOpenChange={setSchedulerOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Agenda: {selectedEmployee?.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="border rounded-md p-4 flex justify-center">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="rounded-md"
                />
              </div>
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h4 className="font-medium mb-4">
                    Detalhes para{' '}
                    {selectedDate
                      ? format(selectedDate, 'dd/MM/yyyy')
                      : 'Selecione uma data'}
                  </h4>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>
                        Horários Disponíveis (separados por vírgula)
                      </Label>
                      <Input
                        value={scheduleSlots}
                        onChange={(e) => setScheduleSlots(e.target.value)}
                        placeholder="Ex: 09:00, 14:00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Valor Diária / Serviço ($)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={scheduleValue}
                        onChange={(e) => setScheduleValue(e.target.value)}
                        placeholder="Opcional: Valor específico"
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para usar valor padrão.
                      </p>
                    </div>
                    <Button
                      onClick={saveSchedule}
                      className="mt-2 bg-trust-blue"
                    >
                      Atualizar Disponibilidade
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Dias com agenda definida:</p>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {selectedEmployee?.schedule?.map((s) => (
                      <Badge key={s.date} variant="outline">
                        {format(new Date(s.date), 'dd/MM')} ({s.slots.length}{' '}
                        slots)
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
