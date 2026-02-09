import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { GuestService, Booking, ServiceOrder } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { isWithinInterval, parseISO } from 'date-fns'

interface ScheduleServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (order: ServiceOrder) => void
  services: GuestService[]
  bookings: Booking[]
}

export function ScheduleServiceDialog({
  open,
  onOpenChange,
  onSave,
  services,
  bookings,
}: ScheduleServiceDialogProps) {
  const { t, language } = useLanguageStore()
  const { toast } = useToast()

  const [bookingId, setBookingId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const activeBookings = useMemo(
    () =>
      bookings.filter(
        (b) => b.status === 'confirmed' || b.status === 'checked_in',
      ),
    [bookings],
  )

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId],
  )

  const calculatedPrice = useMemo(() => {
    if (!selectedService || !date) return 0

    // Check for seasonal pricing
    const seasonal = selectedService.seasonalPrices?.find((sp) =>
      isWithinInterval(parseISO(date), {
        start: parseISO(sp.startDate),
        end: parseISO(sp.endDate),
      }),
    )

    return seasonal ? seasonal.price : selectedService.price
  }, [selectedService, date])

  const handleSave = () => {
    if (!bookingId || !serviceId || !date || !time) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }

    if (selectedService) {
      const order: ServiceOrder = {
        id: `ord-${Date.now()}`,
        bookingId,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        price: calculatedPrice,
        date: new Date().toISOString(),
        scheduledFor: `${date}T${time}`,
        status: 'pending',
      }
      onSave(order)
      onOpenChange(false)
      setBookingId('')
      setServiceId('')
      setDate('')
      setTime('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('guest_services.schedule')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t('short_term.guest')}</Label>
            <Select value={bookingId} onValueChange={setBookingId}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                {activeBookings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.guestName} - {b.propertyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t('guest_services.service_name')}</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                {services
                  .filter((s) => s.active)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('common.date')}</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-md border flex justify-between items-center">
            <span className="font-bold">{t('common.total')}</span>
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(calculatedPrice, language)}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue">
            {t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
