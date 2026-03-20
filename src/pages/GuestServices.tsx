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
import useLanguageStore from '@/stores/useLanguageStore'
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
  const { t } = useLanguageStore()
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

  const activeBookings = bookings.filter(
    (b) => b.status === 'checked_in' || b.status === 'confirmed',
  )

  const filteredServices = guestServices.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = (form: Partial<GuestService>) => {
    if (editingRecord) {
      updateGuestService({ ...editingRecord, ...form } as GuestService)
      toast({ title: t('common.success') })
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
      toast({ title: t('common.success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteGuestService(deleteId)
      toast({ title: t('common.delete_success') })
      setDeleteId(null)
    }
  }

  const handleConsume = () => {
    if (!selectedService || !selectedBookingId) {
      toast({
        title: t('common.validation_error'),
        description: 'Selecione uma reserva.',
        variant: 'destructive',
      })
      return
    }

    const currentPrice = getCurrentPrice(
      selectedService.price,
      selectedService.prices,
    )

    // Add to invoices connected to booking
    addInvoice({
      id: `inv-gs-${Date.now()}`,
      description: `Consumo: ${selectedService.name}`,
      amount: currentPrice,
      status: 'pending',
      date: new Date().toISOString(),
      type: 'generic',
      bookingId: selectedBookingId,
    })

    toast({
      title: t('common.success'),
      description: 'Serviço faturado na reserva.',
    })
    setIsConsumeOpen(false)
    setSelectedService(null)
    setSelectedBookingId('')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.guest_services')}
          </h1>
          <p className="text-muted-foreground">
            Catálogo de serviços, preços temporais e lançamento na fatura do
            hóspede.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('common.search')}
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
            <Plus className="h-4 w-4" /> {t('common.add')}
          </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.category')}</TableHead>
                <TableHead>Preço Atual</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => {
                const currentPrice = getCurrentPrice(
                  service.price,
                  service.prices,
                )
                return (
                  <TableRow key={service.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      <DataMask>{service.name}</DataMask>
                      {service.prices && service.prices.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {service.prices.length} preço(s) agendado(s)
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {service.category === 'dining' ? 'Restaurante' : service.category === 'transport' ? 'Transporte' : service.category === 'other' ? 'Outro' : service.category}
                    </TableCell>
                    <TableCell className="font-medium">
                      <DataMask>{formatAppCurrency(currentPrice)}</DataMask>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.active ? 'default' : 'secondary'}>
                        {service.active
                          ? t('common.active')
                          : t('common.inactive')}
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
                            <ShoppingCart className="h-4 w-4 mr-2" /> Lançar na
                            Fatura
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingRecord(service)
                              setIsAddOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />{' '}
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(service.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete')}
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
                    {t('common.empty')}
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
            <DialogTitle>Lançar Consumo na Fatura</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label className="text-muted-foreground">Serviço</Label>
              <div className="font-semibold text-lg">
                {selectedService?.name}
              </div>
              <div className="text-sm">
                Valor:{' '}
                {formatAppCurrency(
                  getCurrentPrice(
                    selectedService?.price || 0,
                    selectedService?.prices,
                  ),
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reserva / Hóspede *</Label>
              <Select
                value={selectedBookingId}
                onValueChange={setSelectedBookingId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a reserva" />
                </SelectTrigger>
                <SelectContent>
                  {activeBookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.guestName} ({b.propertyName})
                    </SelectItem>
                  ))}
                  {activeBookings.length === 0 && (
                    <SelectItem value="none" disabled>
                      Nenhuma reserva ativa
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsumeOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConsume}
              className="bg-trust-blue text-white"
            >
              Lançar Custo
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
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.delete_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

