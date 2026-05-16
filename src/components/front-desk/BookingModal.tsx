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
    amount: booking?.total_amount || property.listing_price || 0,
  })

  const [loading, setLoading] = useState(false)

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

      const { error: bookErr } = await supabase.from('bookings').insert({
        property_id: property.id,
        guest_id: guestData.id,
        check_in: new Date(formData.checkIn).toISOString(),
        check_out: new Date(formData.checkOut).toISOString(),
        origin: formData.origin,
        total_amount: formData.amount,
        status: 'confirmed',
      })

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
              <Label>Valor Total Previsto</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                disabled={isExisting}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {!isExisting && (
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-trust-blue text-white"
            >
              Confirmar Reserva
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
