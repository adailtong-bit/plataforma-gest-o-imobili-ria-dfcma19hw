import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
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
  Plus,
  Calendar as CalendarIcon,
  Search,
  MoreHorizontal,
  CheckCircle2,
  Brush,
  ClipboardCheck,
} from 'lucide-react'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { Booking } from '@/lib/types'
import { format, isSameDay, isWithinInterval, parseISO } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function ShortTerm() {
  const { bookings, addBooking, updateBooking } = useShortTermStore()
  const { properties } = usePropertyStore()
  const { addTask } = useTaskStore()
  const { partners } = usePartnerStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [selectedBookingForTask, setSelectedBookingForTask] =
    useState<Booking | null>(null)
  const [selectedTaskType, setSelectedTaskType] = useState<
    'cleaning' | 'inspection'
  >('cleaning')
  const [selectedPartnerId, setSelectedPartnerId] = useState('')

  // New Booking State
  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    guestName: '',
    guestEmail: '',
    totalAmount: 0,
    paid: false,
    platform: 'airbnb',
    status: 'confirmed',
  })

  // Calendar State
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Filter Bookings
  const filteredBookings = bookings.filter(
    (b) =>
      b.guestName.toLowerCase().includes(filter.toLowerCase()) ||
      properties
        .find((p) => p.id === b.propertyId)
        ?.name.toLowerCase()
        .includes(filter.toLowerCase()),
  )

  // Short Term Properties Only
  const shortTermProperties = properties.filter(
    (p) => p.profileType === 'short_term',
  )

  const handleSaveBooking = () => {
    if (
      !newBooking.propertyId ||
      !newBooking.guestName ||
      !newBooking.checkIn ||
      !newBooking.checkOut
    ) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    addBooking({
      id: `bk-${Date.now()}`,
      propertyId: newBooking.propertyId,
      guestName: newBooking.guestName,
      guestEmail: newBooking.guestEmail || '',
      checkIn: newBooking.checkIn,
      checkOut: newBooking.checkOut,
      totalAmount: newBooking.totalAmount || 0,
      paid: newBooking.paid || false,
      platform: newBooking.platform || 'direct',
      status: newBooking.status || 'confirmed',
    } as Booking)

    setOpen(false)
    setNewBooking({
      guestName: '',
      guestEmail: '',
      totalAmount: 0,
      paid: false,
      platform: 'airbnb',
      status: 'confirmed',
    })
    toast({ title: 'Reserva criada com sucesso.' })
  }

  const handleCreateTask = () => {
    if (!selectedBookingForTask || !selectedPartnerId) return

    const property = properties.find(
      (p) => p.id === selectedBookingForTask.propertyId,
    )
    const partner = partners.find((p) => p.id === selectedPartnerId)

    // Determine deadline based on task type
    // Cleaning usually right after checkout
    // Inspection usually right before checkin (but here we link to booking, maybe pre-checkin?)
    // Let's assume Post-Stay Cleaning = CheckOut date
    // Pre-Stay Inspection = CheckIn date
    const taskDate =
      selectedTaskType === 'cleaning'
        ? selectedBookingForTask.checkOut
        : selectedBookingForTask.checkIn

    addTask({
      id: `task-${Date.now()}`,
      title:
        selectedTaskType === 'cleaning'
          ? `Limpeza: ${selectedBookingForTask.guestName}`
          : `Inspeção: ${selectedBookingForTask.guestName}`,
      propertyId: selectedBookingForTask.propertyId,
      propertyName: property?.name || 'Unknown',
      propertyAddress: property?.address,
      propertyCommunity: property?.community,
      status: 'pending',
      type: selectedTaskType,
      assignee: partner?.name || 'Unknown',
      assigneeId: selectedPartnerId,
      date: taskDate,
      priority: 'high', // Short term is usually high priority
      description: `Tarefa vinculada à reserva #${selectedBookingForTask.id.slice(-4)}`,
      bookingId: selectedBookingForTask.id,
    })

    toast({
      title: t('short_term.task_created'),
      description: `Tarefa de ${selectedTaskType === 'cleaning' ? 'Limpeza' : 'Inspeção'} criada.`,
    })
    setTaskDialogOpen(false)
    setSelectedBookingForTask(null)
    setSelectedPartnerId('')
  }

  const handleMarkPaid = (booking: Booking) => {
    updateBooking({ ...booking, paid: true })
    toast({
      title: 'Pagamento Registrado',
      description: t('short_term.payment_recorded'),
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'checked_in':
        return 'bg-green-100 text-green-800'
      case 'checked_out':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100'
    }
  }

  // Calendar Logic
  const bookingsOnDate = bookings.filter((b) => {
    if (!date) return false
    const start = parseISO(b.checkIn)
    const end = parseISO(b.checkOut)
    return isWithinInterval(date, { start, end }) || isSameDay(date, start)
  })

  // Calendar modifiers for visual indication
  const bookedDays = bookings.flatMap((b) => {
    const days = []
    let current = parseISO(b.checkIn)
    const end = parseISO(b.checkOut)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('short_term.title')}
          </h1>
          <p className="text-muted-foreground">{t('short_term.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('short_term.new_booking')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('short_term.new_booking')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('tenants.property')}</Label>
                  <Select
                    value={newBooking.propertyId}
                    onValueChange={(v) =>
                      setNewBooking({ ...newBooking, propertyId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {shortTermProperties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t('short_term.platform')}</Label>
                  <Select
                    value={newBooking.platform}
                    onValueChange={(v: any) =>
                      setNewBooking({ ...newBooking, platform: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                      <SelectItem value="vrbo">Vrbo</SelectItem>
                      <SelectItem value="booking.com">Booking.com</SelectItem>
                      <SelectItem value="direct">Direta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('short_term.guest')}</Label>
                  <Input
                    value={newBooking.guestName}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        guestName: e.target.value,
                      })
                    }
                    placeholder="Nome Completo"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.email')}</Label>
                  <Input
                    value={newBooking.guestEmail}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        guestEmail: e.target.value,
                      })
                    }
                    placeholder="email@guest.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('short_term.check_in')}</Label>
                  <Input
                    type="date"
                    value={newBooking.checkIn}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, checkIn: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('short_term.check_out')}</Label>
                  <Input
                    type="date"
                    value={newBooking.checkOut}
                    onChange={(e) =>
                      setNewBooking({ ...newBooking, checkOut: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('short_term.total')} ($)</Label>
                  <CurrencyInput
                    value={newBooking.totalAmount}
                    onChange={(v) =>
                      setNewBooking({ ...newBooking, totalAmount: v })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.status')}</Label>
                  <Select
                    value={newBooking.status}
                    onValueChange={(v: any) =>
                      setNewBooking({ ...newBooking, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="checked_in">Check-in</SelectItem>
                      <SelectItem value="checked_out">Check-out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleSaveBooking}>{t('common.save')}</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">{t('common.all')}</TabsTrigger>
          <TabsTrigger value="calendar">{t('common.calendar')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="flex items-center py-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('common.search')}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tenants.property')}</TableHead>
                    <TableHead>{t('short_term.guest')}</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>{t('short_term.total')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t('short_term.no_bookings')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => {
                      const prop = properties.find(
                        (p) => p.id === booking.propertyId,
                      )
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {prop?.name || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{booking.guestName}</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {booking.platform}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span className="flex items-center gap-1">
                                <span className="w-16 text-muted-foreground text-xs">
                                  In:
                                </span>
                                {format(
                                  parseISO(booking.checkIn),
                                  'dd/MM/yyyy',
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-16 text-muted-foreground text-xs">
                                  Out:
                                </span>
                                {format(
                                  parseISO(booking.checkOut),
                                  'dd/MM/yyyy',
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getStatusColor(booking.status)}
                              variant="outline"
                            >
                              {t(`short_term.${booking.status}`)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.paid ? (
                              <Badge className="bg-green-600">
                                {t('short_term.paid')}
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                {t('short_term.not_paid')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            ${booking.totalAmount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>
                                  {t('common.actions')}
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBookingForTask(booking)
                                    setTaskDialogOpen(true)
                                  }}
                                >
                                  <ClipboardCheck className="mr-2 h-4 w-4" />
                                  {t('short_term.create_task')}
                                </DropdownMenuItem>
                                {!booking.paid && (
                                  <DropdownMenuItem
                                    onClick={() => handleMarkPaid(booking)}
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                    {t('short_term.mark_paid')}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Disponibilidade</CardTitle>
                <CardDescription>
                  Selecione um dia para ver reservas.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  modifiers={{ booked: bookedDays }}
                  modifiersStyles={{
                    booked: {
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                      color: 'var(--primary)',
                    },
                  }}
                  className="rounded-md border shadow"
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  Reservas em {date ? format(date, 'dd/MM/yyyy') : '-'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsOnDate.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    Nenhuma reserva ativa nesta data.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingsOnDate.map((booking) => {
                      const prop = properties.find(
                        (p) => p.id === booking.propertyId,
                      )
                      return (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between border p-4 rounded-lg"
                        >
                          <div>
                            <h4 className="font-semibold text-lg">
                              {prop?.name}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              Hóspede: {booking.guestName}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">
                                {booking.platform}
                              </Badge>
                              <Badge className={getStatusColor(booking.status)}>
                                {t(`short_term.${booking.status}`)}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(booking.checkIn), 'dd/MM')} -{' '}
                              {format(parseISO(booking.checkOut), 'dd/MM')}
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => {
                                setSelectedBookingForTask(booking)
                                setTaskDialogOpen(true)
                              }}
                            >
                              <Plus className="h-3 w-3 mr-1" /> Task
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Creation Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Tarefa Rápida</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tipo de Tarefa</Label>
              <Select
                value={selectedTaskType}
                onValueChange={(v: any) => setSelectedTaskType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">
                    <div className="flex items-center gap-2">
                      <Brush className="h-4 w-4" />{' '}
                      {t('short_term.cleaning_task')}
                    </div>
                  </SelectItem>
                  <SelectItem value="inspection">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" />{' '}
                      {t('short_term.inspection_task')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>{t('tasks.assignee')}</Label>
              <Select
                value={selectedPartnerId}
                onValueChange={setSelectedPartnerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione Parceiro" />
                </SelectTrigger>
                <SelectContent>
                  {partners
                    .filter(
                      (p) =>
                        p.type ===
                          (selectedTaskType === 'cleaning'
                            ? 'cleaning'
                            : 'agent') || p.type === 'maintenance', // Broaden inspection
                    )
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBookingForTask && (
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                <p>
                  <strong>Data Sugerida:</strong>{' '}
                  {selectedTaskType === 'cleaning'
                    ? format(
                        parseISO(selectedBookingForTask.checkOut),
                        'dd/MM/yyyy',
                      )
                    : format(
                        parseISO(selectedBookingForTask.checkIn),
                        'dd/MM/yyyy',
                      )}
                </p>
                <p>
                  <strong>Propriedade:</strong>{' '}
                  {selectedBookingForTask.propertyName ||
                    properties.find(
                      (p) => p.id === selectedBookingForTask?.propertyId,
                    )?.name}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleCreateTask} disabled={!selectedPartnerId}>
                Criar Tarefa
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
