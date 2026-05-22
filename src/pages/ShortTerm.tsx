import { useContext, useState, useMemo } from 'react'
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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import { formatDate } from '@/lib/utils'

export default function ShortTerm() {
  const {
    bookings,
    properties,
    promotions,
    addBooking,
    updateBooking,
    deleteBooking,
  } = useContext(AppContext)!
  const { t, language } = useLanguageStore()

  const formatLocalCurrency = (value: number) => {
    const loc =
      language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)

  const defaultForm = {
    guestName: '',
    checkIn: '',
    checkOut: '',
    propertyId: 'none',
    baseAmount: '',
    promotionId: 'none',
  }
  const [form, setForm] = useState(defaultForm)

  const applicablePromotions = useMemo(() => {
    if (form.propertyId === 'none') return []
    const selectedProp = properties.find((p) => p.id === form.propertyId)

    return promotions.filter((p) => {
      if (!p.active) return false
      if (p.targetType === 'all' || !p.targetType) return true
      if (p.targetType === 'property' && p.targetId === form.propertyId)
        return true
      if (p.targetType === 'hotel' && selectedProp?.hotelId === p.targetId) {
        if (p.scope === 'global' || !p.scope) return true
        if (
          p.scope === 'specific_rooms' &&
          p.roomIds?.includes(form.propertyId)
        )
          return true
      }
      return false
    })
  }, [form.propertyId, properties, promotions])

  const discountAmount = useMemo(() => {
    const base = Number(form.baseAmount) || 0
    if (form.promotionId !== 'none') {
      const p = promotions.find((x) => x.id === form.promotionId)
      if (p) {
        return p.type === 'percentage' ? base * (p.value / 100) : p.value
      }
    }
    return 0
  }, [form.baseAmount, form.promotionId, promotions])

  const finalAmount = useMemo(() => {
    const base = Number(form.baseAmount) || 0
    return Math.max(0, base - discountAmount)
  }, [form.baseAmount, discountAmount])

  const handleAdd = () => {
    if (form.propertyId === 'none') {
      toast({ title: t('common.error', 'Error'), variant: 'destructive' })
      return
    }

    const prop = properties.find((p) => p.id === form.propertyId)

    addBooking({
      id: `booking-${Date.now()}`,
      propertyId: form.propertyId,
      propertyName: prop?.name || 'Property',
      guestName: form.guestName || 'Novo Hóspede',
      guestEmail: 'guest@example.com',
      checkIn: form.checkIn || new Date().toISOString(),
      checkOut: form.checkOut || new Date().toISOString(),
      baseAmount: Number(form.baseAmount) || 0,
      discountAmount: discountAmount,
      promotionId: form.promotionId !== 'none' ? form.promotionId : undefined,
      totalAmount: finalAmount,
      status: 'confirmed',
      paid: false,
      platform: 'direct',
    })
    setIsAddOpen(false)
    setForm(defaultForm)
    toast({
      title: t('short_term.success_add', 'Reservation added successfully'),
    })
  }

  const handleEdit = () => {
    if (editingRecord) {
      updateBooking({
        ...editingRecord,
        propertyId: form.propertyId,
        guestName: form.guestName,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        baseAmount: Number(form.baseAmount) || 0,
        discountAmount: discountAmount,
        promotionId: form.promotionId !== 'none' ? form.promotionId : undefined,
        totalAmount: finalAmount,
      })
    }
    setEditingRecord(null)
    toast({
      title: t('short_term.success_edit', 'Reservation updated successfully'),
    })
  }

  const handleDelete = (id: string) => {
    deleteBooking(id)
    toast({
      title: t('short_term.success_delete', 'Reservation deleted successfully'),
    })
  }

  const openEdit = (b: any) => {
    setEditingRecord(b)
    setForm({
      guestName: b.guestName,
      checkIn: b.checkIn.split('T')[0],
      checkOut: b.checkOut.split('T')[0],
      propertyId: b.propertyId || 'none',
      baseAmount: (b.baseAmount || b.totalAmount).toString(),
      promotionId: b.promotionId || 'none',
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('short_term.title', 'Short-Term Rentals')}
          </h1>
          <p className="text-muted-foreground">
            {t('short_term.subtitle', 'Manage your vacation rentals.')}
          </p>
        </div>
        <Dialog
          open={isAddOpen}
          onOpenChange={(v) => {
            setIsAddOpen(v)
            if (!v) setForm(defaultForm)
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2 text-white">
              <Plus className="h-4 w-4" />{' '}
              {t('short_term.new_booking', '+ Include')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t('short_term.add_title', 'Include Reservation')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{t('short_term.property', 'Property')}</Label>
                <Select
                  value={form.propertyId}
                  onValueChange={(v) =>
                    setForm({ ...form, propertyId: v, promotionId: 'none' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Select...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      {t('common.select', 'Select...')}
                    </SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('short_term.guest', 'Guest Name')}</Label>
                <Input
                  placeholder={t('short_term.guest', 'Guest Name')}
                  value={form.guestName}
                  onChange={(e) =>
                    setForm({ ...form, guestName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('short_term.check_in', 'Check-in')}</Label>
                  <Input
                    type="date"
                    value={form.checkIn}
                    onChange={(e) =>
                      setForm({ ...form, checkIn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('short_term.check_out', 'Check-out')}</Label>
                  <Input
                    type="date"
                    value={form.checkOut}
                    onChange={(e) =>
                      setForm({ ...form, checkOut: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>{t('short_term.base_amount', 'Base Amount')}</Label>
                  <Input
                    type="number"
                    placeholder={t('short_term.base_amount', 'Base Amount')}
                    value={form.baseAmount}
                    onChange={(e) =>
                      setForm({ ...form, baseAmount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('short_term.promotion', 'Promotion')}</Label>
                  <Select
                    value={form.promotionId}
                    onValueChange={(v) => setForm({ ...form, promotionId: v })}
                    disabled={applicablePromotions.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.none', 'None')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {t('common.none', 'None')}
                      </SelectItem>
                      {applicablePromotions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.code} (
                          {p.type === 'percentage'
                            ? `${p.value}%`
                            : `$${p.value}`}
                          )
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 p-2 rounded">
                  <span>
                    {t('short_term.discount_applied', 'Discount Applied:')}
                  </span>
                  <span>-{formatLocalCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-lg">
                <span>{t('short_term.final_total', 'Final Total:')}</span>
                <span>{formatLocalCurrency(finalAmount)}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>{t('common.save', 'Save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('short_term.guest', 'Guest Name')}</TableHead>
                <TableHead>{t('common.property', 'Property')}</TableHead>
                <TableHead>{t('short_term.check_in', 'Check-in')}</TableHead>
                <TableHead>{t('short_term.check_out', 'Check-out')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-right">
                  {t('short_term.amount', 'Total')}
                </TableHead>
                <TableHead className="text-right">
                  {t('common.actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{b.guestName}</DataMask>
                  </TableCell>
                  <TableCell>{b.propertyName}</TableCell>
                  <TableCell>{formatDate(b.checkIn, language)}</TableCell>
                  <TableCell>{formatDate(b.checkOut, language)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold">
                        {formatLocalCurrency(b.totalAmount)}
                      </span>
                      {b.promotionId && (
                        <span className="text-xs text-green-600">
                          Desc. {formatLocalCurrency(b.discountAmount || 0)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingRecord?.id === b.id}
                        onOpenChange={(open) => !open && setEditingRecord(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(b)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />{' '}
                            {t('common.edit', 'Edit')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              {t('short_term.edit_title', 'Edit Reservation')}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>
                                {t('short_term.property', 'Property')}
                              </Label>
                              <Select
                                value={form.propertyId}
                                onValueChange={(v) =>
                                  setForm({
                                    ...form,
                                    propertyId: v,
                                    promotionId: 'none',
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    {t('common.select', 'Select...')}
                                  </SelectItem>
                                  {properties.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>
                                {t('short_term.guest', 'Guest Name')}
                              </Label>
                              <Input
                                value={form.guestName}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    guestName: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>
                                  {t('short_term.check_in', 'Check-in')}
                                </Label>
                                <Input
                                  type="date"
                                  value={form.checkIn}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      checkIn: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>
                                  {t('short_term.check_out', 'Check-out')}
                                </Label>
                                <Input
                                  type="date"
                                  value={form.checkOut}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      checkOut: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                              <div className="space-y-2">
                                <Label>
                                  {t('short_term.base_amount', 'Base Amount')}
                                </Label>
                                <Input
                                  type="number"
                                  value={form.baseAmount}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      baseAmount: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>
                                  {t('short_term.promotion', 'Promotion')}
                                </Label>
                                <Select
                                  value={form.promotionId}
                                  onValueChange={(v) =>
                                    setForm({ ...form, promotionId: v })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={t('common.none', 'None')}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      {t('common.none', 'None')}
                                    </SelectItem>
                                    {applicablePromotions.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.code}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {discountAmount > 0 && (
                              <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 p-2 rounded">
                                <span>
                                  {t(
                                    'short_term.discount_applied',
                                    'Discount Applied:',
                                  )}
                                </span>
                                <span>
                                  -{formatLocalCurrency(discountAmount)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center font-bold text-lg">
                              <span>
                                {t('short_term.final_total', 'Final Total:')}
                              </span>
                              <span>{formatLocalCurrency(finalAmount)}</span>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleEdit}>
                              {t('common.save', 'Save')}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete', 'Delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t(
                                'short_term.delete_title',
                                'Delete Reservation',
                              )}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t(
                                'short_term.delete_desc',
                                'This action cannot be undone.',
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel', 'Cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(b.id)}
                            >
                              {t('common.delete', 'Delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('short_term.empty', 'No records found.')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
