import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  CalendarIcon,
  Plus,
  Trash2,
  CheckCircle,
  Edit,
  Ban,
  Clock,
  User,
} from 'lucide-react'
import { format } from 'date-fns'
import useLanguageStore from '@/stores/useLanguageStore'
import useVisitStore from '@/stores/useVisitStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Visit } from '@/lib/types'

export default function Visits() {
  const { t } = useLanguageStore()
  const { visits, addVisit, updateVisit, deleteVisit } = useVisitStore()
  const { properties } = usePropertyStore()
  const { currentUser, allUsers } = useAuthStore()
  const { toast } = useToast()

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState('10:00')
  const [clientName, setClientName] = useState('')
  const [propertyId, setPropertyId] = useState('')
  const [notes, setNotes] = useState('')
  const [reason, setReason] = useState('')
  const [assignedTo, setAssignedTo] = useState('')

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null)

  // Status Confirmation State
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    visit: Visit
    status: Visit['status']
  } | null>(null)

  // Filter assignable users (Partners, Employees, or Internal Users)
  const assignableUsers = allUsers.filter(
    (u) =>
      u.role === 'partner' ||
      u.role === 'partner_employee' ||
      u.role === 'internal_user',
  )

  const handleSchedule = () => {
    if (!clientName || !propertyId || !date) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    const property = properties.find((p) => p.id === propertyId)
    const dateTime = new Date(date)
    const [hours, minutes] = time.split(':')
    dateTime.setHours(parseInt(hours), parseInt(minutes))

    const assignee = allUsers.find((u) => u.id === assignedTo)

    const newVisit: Visit = {
      id: `visit-${Date.now()}`,
      propertyId,
      propertyName: property?.name || 'Unknown',
      clientName,
      date: dateTime.toISOString(),
      status: 'scheduled',
      notes,
      registeredBy: currentUser.id,
      assignedTo: assignedTo || undefined,
      assignedRole: assignee?.role,
      reason,
    }

    addVisit(newVisit)
    toast({
      title: t('visits.schedule_visit'),
      description: `Visit for ${clientName} scheduled successfully.`,
    })

    // Reset form
    setClientName('')
    setPropertyId('')
    setNotes('')
    setReason('')
    setAssignedTo('')
  }

  const initiateStatusChange = (visit: Visit, status: Visit['status']) => {
    // Only allow closure by assigned user or PM/Admin
    if (status === 'completed') {
      const isPM = ['platform_owner', 'software_tenant'].includes(
        currentUser.role,
      )
      const isAssignee = visit.assignedTo === currentUser.id

      if (!isPM && !isAssignee) {
        toast({
          title: 'Permission Denied',
          description:
            'Only the assigned team member or a Property Manager can close this visit.',
          variant: 'destructive',
        })
        return
      }
    }

    setPendingStatusChange({ visit, status })
    setConfirmOpen(true)
  }

  const confirmStatusChange = () => {
    if (pendingStatusChange) {
      const { visit, status } = pendingStatusChange
      updateVisit({ ...visit, status })
      toast({
        title: t('common.status') + ' Updated',
        description: `Visit marked as ${status}.`,
      })
      setConfirmOpen(false)
      setPendingStatusChange(null)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm(t('common.delete_title'))) {
      deleteVisit(id)
      toast({ title: t('common.success') })
    }
  }

  const openEdit = (visit: Visit) => {
    setEditingVisit(visit)
    setIsEditOpen(true)
  }

  const handleUpdateVisit = () => {
    if (!editingVisit) return

    // Check if date changed to trigger 'rescheduled' status
    const originalVisit = visits.find((v) => v.id === editingVisit.id)
    let newStatus = editingVisit.status

    if (originalVisit && originalVisit.date !== editingVisit.date) {
      newStatus = 'rescheduled'
    }

    const assignee = allUsers.find((u) => u.id === editingVisit.assignedTo)

    updateVisit({
      ...editingVisit,
      status: newStatus,
      assignedRole: assignee?.role,
    })
    setIsEditOpen(false)
    setEditingVisit(null)
    toast({ title: t('common.success') })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            {t('common.scheduled')}
          </Badge>
        )
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            {t('common.completed')}
          </Badge>
        )
      case 'canceled':
        return <Badge variant="destructive">{t('common.canceled')}</Badge>
      case 'suspended':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200"
          >
            {t('status.suspended')}
          </Badge>
        )
      case 'rescheduled':
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 border-purple-200"
          >
            {t('status.rescheduled') || 'Rescheduled'}
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getUserName = (id?: string) => {
    if (!id) return 'Unassigned'
    const user = allUsers.find((u) => u.id === id)
    return user ? user.name : 'Unknown'
  }

  // Sort visits by date (newest first)
  const sortedVisits = [...visits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('common.visit_scheduling')}
        </h1>
        <p className="text-muted-foreground">{t('visits.upcoming_past')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('common.schedule_visit')}</CardTitle>
            <CardDescription>{t('visits.enter_details')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('common.client_name')}</Label>
              <Input
                placeholder="John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('common.property')}</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
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

            <div className="space-y-2">
              <Label>{t('visits.assign_team')}</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  {assignableUsers.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({t(`roles.${u.role}`)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>{t('common.visit_date')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('visits.time')}</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('visits.reason')}</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="showing">{t('visits.showing')}</SelectItem>
                  <SelectItem value="inspection">
                    {t('visits.inspection')}
                  </SelectItem>
                  <SelectItem value="other">{t('common.none')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('common.description')} / Notes</Label>
              <Textarea
                placeholder={t('visits.client_prefs')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button className="w-full bg-trust-blue" onClick={handleSchedule}>
              <Plus className="mr-2 h-4 w-4" /> {t('common.schedule_visit')}
            </Button>
          </CardContent>
        </Card>

        {/* Visits List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('visits.list_title')}</CardTitle>
            <CardDescription>{t('visits.upcoming_past')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead>{t('common.property')}</TableHead>
                  <TableHead>{t('common.client_name')}</TableHead>
                  <TableHead>{t('tasks.assignee')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVisits.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      {t('visits.no_visits')}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedVisits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(visit.date), 'PPP')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(visit.date), 'p')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell
                        className="max-w-[150px] truncate"
                        title={visit.propertyName}
                      >
                        {visit.propertyName}
                      </TableCell>
                      <TableCell>{visit.clientName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{getUserName(visit.assignedTo)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(visit.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(visit)}
                            title={t('common.edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {visit.status !== 'completed' &&
                            visit.status !== 'canceled' && (
                              <>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() =>
                                    initiateStatusChange(visit, 'completed')
                                  }
                                  title={t('common.completed')}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                                  onClick={() =>
                                    initiateStatusChange(visit, 'suspended')
                                  }
                                  title={t('status.suspended')}
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() =>
                              initiateStatusChange(visit, 'canceled')
                            }
                            title={t('common.cancel')}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleDelete(visit.id)}
                            title={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('common.edit')}</DialogTitle>
          </DialogHeader>
          {editingVisit && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Registered By</Label>
                  <Input
                    value={getUserName(editingVisit.registeredBy)}
                    disabled
                  />
                </div>
                <div>
                  <Label>Current Status</Label>
                  <div className="mt-2">
                    {getStatusBadge(editingVisit.status)}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>{t('common.client_name')}</Label>
                <Input
                  value={editingVisit.clientName}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      clientName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>{t('tasks.assignee')}</Label>
                <Select
                  value={editingVisit.assignedTo || ''}
                  onValueChange={(val) =>
                    setEditingVisit({ ...editingVisit, assignedTo: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({t(`roles.${u.role}`)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>
                  {t('common.date')} & {t('visits.time')}
                </Label>
                <Input
                  type="datetime-local"
                  value={format(
                    new Date(editingVisit.date),
                    "yyyy-MM-dd'T'HH:mm",
                  )}
                  onChange={(e) =>
                    setEditingVisit({
                      ...editingVisit,
                      date: new Date(e.target.value).toISOString(),
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>{t('visits.reason')}</Label>
                <Input
                  value={editingVisit.reason || ''}
                  onChange={(e) =>
                    setEditingVisit({ ...editingVisit, reason: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>{t('common.description')}</Label>
                <Textarea
                  value={editingVisit.notes || ''}
                  onChange={(e) =>
                    setEditingVisit({ ...editingVisit, notes: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateVisit}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status to{' '}
              <strong>{pendingStatusChange?.status}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
