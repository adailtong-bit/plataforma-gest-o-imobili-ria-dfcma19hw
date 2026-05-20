import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { format, addDays } from 'date-fns'

export function BookingModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: any) {
  const { property, date, booking } = initialData
  const { toast } = useToast()

  const isExisting = !!booking

  const [formData, setFormData] = useState({
    guestName: booking?.guests?.name || '',
    guestEmail: booking?.guests?.email || '',
    guestPhone: booking?.guests?.phone || '',
    guestDoc: booking?.guests?.document || '',
    checkIn: booking?.check_in
      ? format(new Date(booking.check_in), 'yyyy-MM-dd')
      : format(date, 'yyyy-MM-dd'),
    checkOut: booking?.check_out
      ? format(new Date(booking.check_out), 'yyyy-MM-dd')
      : format(addDays(date, 1), 'yyyy-MM-dd'),
    origin: booking?.origin || 'presential',
    discountAmount: booking?.discount_amount || 0,
  })

  const [loading, setLoading] = useState(false)

  // Calculations
  const checkInDate = new Date(formData.checkIn)
  const checkOutDate = new Date(formData.checkOut)
  const nights = Math.max(
    1,
    Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  )
  const baseAmount = (property.listing_price || 0) * nights
  const totalAmount = Math.max(0, baseAmount - formData.discountAmount)

  const handleSave = async () => {
    setLoading(true)
    try {
      if (isExisting) {
        toast({
          title: 'Aviso',
          description:
            'Edição de reserva existente será implementada em breve.',
        })
        setLoading(false)
        return
      }

      if (!formData.guestName) throw new Error('Nome do hóspede é obrigatório.')

      const { data: guestData, error: guestErr } = await supabase
        .from('guests')
        .insert({
          name: formData.guestName,
          email: formData.guestEmail,
          phone: formData.guestPhone,
          document: formData.guestDoc,
        })
        .select()
        .single()

      if (guestErr) throw guestErr

      const approvalStatus =
        formData.discountAmount > 0 ? 'pending' : 'approved'
      const status =
        approvalStatus === 'pending' ? 'pending_approval' : 'confirmed'

      const { error: bookErr } = await supabase.from('bookings').insert({
        property_id: property.id,
        guest_id: guestData.id,
        check_in: new Date(formData.checkIn).toISOString(),
        check_out: new Date(formData.checkOut).toISOString(),
        origin: formData.origin,
        total_amount: totalAmount,
        base_amount: baseAmount,
        discount_amount: formData.discountAmount,
        approval_status: approvalStatus,
        status: status,
      } as any)

      if (bookErr) throw bookErr

      toast({ title: 'Sucesso', description: 'Reserva criada com sucesso!' })
      onSuccess()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>
            {isExisting
              ? 'Detalhes da Reserva'
              : 'Nova Reserva (Walk-in / Integração)'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="p-3 bg-slate-50 border rounded-md text-sm text-slate-700">
            <span className="font-semibold">Quarto Selecionado:</span>{' '}
            {property.room_number || property.name} (Andar{' '}
            {property.floor || '-'})
          </div>

          <div className="grid gap-2">
            <Label>Nome Completo do Hóspede *</Label>
            <Input
              value={formData.guestName}
              onChange={(e) =>
                setFormData({ ...formData, guestName: e.target.value })
              }
              disabled={isExisting}
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Documento / Passaporte</Label>
              <Input
                value={formData.guestDoc}
                onChange={(e) =>
                  setFormData({ ...formData, guestDoc: e.target.value })
                }
                disabled={isExisting}
              />
            </div>
            <div className="grid gap-2">
              <Label>Telefone</Label>
              <Input
                value={formData.guestPhone}
                onChange={(e) =>
                  setFormData({ ...formData, guestPhone: e.target.value })
                }
                disabled={isExisting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Data de Check-in</Label>
              <Input
                type="date"
                value={formData.checkIn}
                onChange={(e) =>
                  setFormData({ ...formData, checkIn: e.target.value })
                }
                disabled={isExisting}
              />
            </div>
            <div className="grid gap-2">
              <Label>Data de Check-out</Label>
              <Input
                type="date"
                value={formData.checkOut}
                onChange={(e) =>
                  setFormData({ ...formData, checkOut: e.target.value })
                }
                disabled={isExisting}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Origem da Reserva</Label>
              <Select
                value={formData.origin}
                onValueChange={(v) => setFormData({ ...formData, origin: v })}
                disabled={isExisting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presential">
                    Presencial / Walk-in
                  </SelectItem>
                  <SelectItem value="booking">Booking.com</SelectItem>
                  <SelectItem value="airbnb">Airbnb</SelectItem>
                  <SelectItem value="trivago">Trivago</SelectItem>
                  <SelectItem value="other">Outro Canal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Desconto Solicitado</Label>
              <Input
                type="number"
                value={formData.discountAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountAmount: Number(e.target.value),
                  })
                }
                disabled={isExisting}
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-md border mt-2 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Diária Base:</span>
              <span className="font-medium">
                {new Intl.NumberFormat(navigator.language || 'en-US', {
                  style: 'currency',
                  currency: property.country === 'BR' ? 'BRL' : 'USD',
                }).format(property.listing_price || 0)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Noites:</span>
              <span className="font-medium">{nights}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium">
                {new Intl.NumberFormat(navigator.language || 'en-US', {
                  style: 'currency',
                  currency: property.country === 'BR' ? 'BRL' : 'USD',
                }).format(baseAmount)}
              </span>
            </div>
            {formData.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Desconto Solicitado:</span>
                <span className="font-medium">
                  -{' '}
                  {new Intl.NumberFormat(navigator.language || 'en-US', {
                    style: 'currency',
                    currency: property.country === 'BR' ? 'BRL' : 'USD',
                  }).format(formData.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Total a Cobrar:</span>
              <span>
                {new Intl.NumberFormat(navigator.language || 'en-US', {
                  style: 'currency',
                  currency: property.country === 'BR' ? 'BRL' : 'USD',
                }).format(totalAmount)}
              </span>
            </div>
            {formData.discountAmount > 0 && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                ⚠️ A aplicação de desconto requer aprovação do gerente. A
                reserva ficará com status pendente.
              </div>
            )}
            {!property.listing_price && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-2">
                ⚠️ Quarto sem valor base configurado. Edite a unidade
                (listing_price) para definir a tarifa.
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {!isExisting && (
            <Button
              onClick={handleSave}
              disabled={loading || (!isExisting && !property.listing_price)}
              className="bg-trust-blue text-white"
            >
              {formData.discountAmount > 0
                ? 'Solicitar Aprovação'
                : 'Confirmar Reserva'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
