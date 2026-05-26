import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  ShoppingCart,
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { GuestService } from '@/lib/types'
import { DataMask } from '@/components/DataMask'
import { ServiceDialog } from '@/components/services/ServiceDialog'
import { getCurrentPrice } from '@/lib/utils'

export default function GuestServices() {
  const {
    guestServices,
    addGuestService,
    updateGuestService,
    deleteGuestService,
    formatAppCurrency,
    bookings,
    addInvoice,
  } = useContext(AppContext)!
  const { t } = useDbTranslations()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<GuestService | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Consumption Modal State
  const [isConsumeOpen, setIsConsumeOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<GuestService | null>(
    null,
  )
  const [selectedBookingId, setSelectedBookingId] = useState<string>('')

  const activeBookings = (bookings || []).filter(
    (b) => b.status === 'checked_in' || b.status === 'confirmed',
  )

  const filteredServices = (guestServices || []).filter((s) =>
    (s.name || '').toLowerCase().includes((search || '').toLowerCase()),
  )

  const handleSave = (form: Partial<GuestService>) => {
    if (editingRecord) {
      updateGuestService({ ...editingRecord, ...form } as GuestService)
      toast({ title: t('common.success', 'Success') })
    } else {
      addGuestService({
        id: `gs-${Date.now()}`,
        name: form.name!,
        description: form.description || '',
        price: Number(form.price) || 0,
        category: form.category || 'other',
        active: form.active ?? true,
        prices: form.prices || [],
      } as GuestService)
      toast({ title: t('common.success', 'Success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteGuestService(deleteId)
      toast({ title: t('common.delete_success', 'Deleted successfully') })
      setDeleteId(null)
    }
  }

  const handleConsume = () => {
    if (!selectedService || !selectedBookingId) {
      toast({
        title: t('common.validation_error', 'Validation Error'),
        description: t(
          'guest_services.validation_error_desc',
          'Please select a booking.',
        ),
        variant: 'destructive',
      })
      return
    }

    const currentPrice = getCurrentPrice(
      selectedService.price || 0,
      selectedService.prices || [],
    )

    // Add to invoices connected to booking
    addInvoice({
      id: `inv-gs-${Date.now()}`,
      description: `${t('guest_services.consume_prefix', 'Consume:')} ${selectedService.name}`,
      amount: currentPrice,
      status: 'pending',
      date: new Date().toISOString(),
      type: 'generic',
      bookingId: selectedBookingId,
    })

    toast({
      title: t('common.success', 'Success'),
      description: t(
        'guest_services.invoice_added',
        'Service successfully billed to invoice.',
      ),
    })
    setIsConsumeOpen(false)
    setSelectedService(null)
    setSelectedBookingId('')
  }

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.guest_services', 'Guest Services')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'guest_services.subtitle',
              'Service catalog, temporary pricing, and billing for guests.',
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('common.search', 'Search...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button
            className="bg-trust-blue gap-2 text-white"
            onClick={() => {
              setEditingRecord(null)
              setIsAddOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> {t('common.add', 'Add')}
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name', 'Name')}</TableHead>
                <TableHead>{t('common.category', 'Category')}</TableHead>
                <TableHead>
                  {t('guest_services.current_price', 'Current Price')}
                </TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => {
                const currentPrice = getCurrentPrice(
                  service.price || 0,
                  service.prices || [],
                )
                return (
                  <TableRow key={service.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      <DataMask>{service.name}</DataMask>
                      {service.prices && service.prices.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {service.prices.length}{' '}
                          {t(
                            'guest_services.prices_scheduled',
                            'scheduled price(s)',
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {service.category === 'dining'
                        ? t('guest_services.category.dining', 'Dining')
                        : service.category === 'transport'
                          ? t('guest_services.category.transport', 'Transport')
                          : service.category === 'other'
                            ? t('guest_services.category.other', 'Other')
                            : service.category}
                    </TableCell>
                    <TableCell className="font-medium">
                      <DataMask>{formatAppCurrency(currentPrice)}</DataMask>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.active ? 'default' : 'secondary'}>
                        {service.active
                          ? t('common.active', 'Active')
                          : t('common.inactive', 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedService(service)
                              setIsConsumeOpen(true)
                            }}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />{' '}
                            {t(
                              'guest_services.bill_to_invoice',
                              'Bill to Invoice',
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingRecord(service)
                              setIsAddOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />{' '}
                            {t('common.edit', 'Edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(service.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete', 'Delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredServices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty', 'No data available.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ServiceDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        service={editingRecord}
        onSave={handleSave}
      />

      {/* Consume Modal */}
      <Dialog open={isConsumeOpen} onOpenChange={setIsConsumeOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {t('guest_services.consume_title', 'Bill Service to Invoice')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-muted-foreground">
                {t('guest_services.service_label', 'Service')}
              </Label>
              <div className="font-semibold text-lg">
                {selectedService?.name}
              </div>
              <div className="text-sm">
                {t('guest_services.value_label', 'Value:')}{' '}
                {formatAppCurrency(
                  getCurrentPrice(
                    selectedService?.price || 0,
                    selectedService?.prices,
                  ),
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                {t('guest_services.booking_label', 'Booking / Guest *')}
              </Label>
              <Select
                value={selectedBookingId}
                onValueChange={setSelectedBookingId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'guest_services.select_booking',
                      'Select booking',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {activeBookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.guestName} ({b.propertyName})
                    </SelectItem>
                  ))}
                  {activeBookings.length === 0 && (
                    <SelectItem value="none" disabled>
                      {t(
                        'guest_services.no_active_bookings',
                        'No active bookings',
                      )}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsumeOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleConsume}
              className="bg-trust-blue text-white"
            >
              {t('guest_services.bill_cost_btn', 'Bill Cost')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('common.confirm_delete', 'Confirm Deletion')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                'common.delete_desc',
                'Are you sure? This action cannot be undone.',
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
