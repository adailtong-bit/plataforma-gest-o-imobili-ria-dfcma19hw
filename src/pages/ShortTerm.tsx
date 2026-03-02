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

export default function ShortTerm() {
  const {
    bookings,
    properties,
    promotions,
    formatAppCurrency,
    addBooking,
    updateBooking,
    deleteBooking,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
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
      toast({ title: t('common.error'), variant: 'destructive' })
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
    toast({ title: 'Reserva incluída com sucesso' })
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
    toast({ title: 'Reserva alterada com sucesso' })
  }

  const handleDelete = (id: string) => {
    deleteBooking(id)
    toast({ title: 'Reserva excluída com sucesso' })
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
            {t('common.short_term')}
          </h1>
          <p className="text-muted-foreground">Manage your vacation rentals.</p>
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
              <Plus className="h-4 w-4" /> Incluir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Incluir Reserva</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Propriedade</Label>
                <Select
                  value={form.propertyId}
                  onValueChange={(v) =>
                    setForm({ ...form, propertyId: v, promotionId: 'none' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione...</SelectItem>
                    {properties.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nome do Hóspede</Label>
                <Input
                  placeholder="Nome do Hóspede"
                  value={form.guestName}
                  onChange={(e) =>
                    setForm({ ...form, guestName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-In</Label>
                  <Input
                    type="date"
                    value={form.checkIn}
                    onChange={(e) =>
                      setForm({ ...form, checkIn: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Check-Out</Label>
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
                  <Label>Valor Base</Label>
                  <Input
                    type="number"
                    placeholder="Valor Base"
                    value={form.baseAmount}
                    onChange={(e) =>
                      setForm({ ...form, baseAmount: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Promoção</Label>
                  <Select
                    value={form.promotionId}
                    onValueChange={(v) => setForm({ ...form, promotionId: v })}
                    disabled={applicablePromotions.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nenhuma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
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
                  <span>Desconto Aplicado:</span>
                  <span>-{formatAppCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Final:</span>
                <span>{formatAppCurrency(finalAmount)}</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Guest Name</TableHead>
                <TableHead>{t('common.property')}</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => (
                <TableRow key={b.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{b.guestName}</DataMask>
                  </TableCell>
                  <TableCell>{b.propertyName}</TableCell>
                  <TableCell>
                    {format(new Date(b.checkIn), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(b.checkOut), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold">
                        {formatAppCurrency(b.totalAmount)}
                      </span>
                      {b.promotionId && (
                        <span className="text-xs text-green-600">
                          Desc. {formatAppCurrency(b.discountAmount || 0)}
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
                            <Pencil className="h-4 w-4 mr-2" /> Alterar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Alterar Reserva</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Propriedade</Label>
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
                                    Selecione...
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
                              <Label>Nome do Hóspede</Label>
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
                                <Label>Check-In</Label>
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
                                <Label>Check-Out</Label>
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
                                <Label>Valor Base</Label>
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
                                <Label>Promoção</Label>
                                <Select
                                  value={form.promotionId}
                                  onValueChange={(v) =>
                                    setForm({ ...form, promotionId: v })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Nenhuma" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">
                                      Nenhuma
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
                                <span>Desconto Aplicado:</span>
                                <span>
                                  -{formatAppCurrency(discountAmount)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center font-bold text-lg">
                              <span>Total Final:</span>
                              <span>{formatAppCurrency(finalAmount)}</span>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleEdit}>Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Reserva</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(b.id)}
                            >
                              Excluir
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
                    {t('common.empty')}
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
