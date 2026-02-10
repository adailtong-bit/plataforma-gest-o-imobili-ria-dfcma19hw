import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { GuestService, Booking, ServiceOrder } from '@/lib/types'
import { useState } from 'react'

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
  const [bookingId, setBookingId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [date, setDate] = useState('')

  const handleSave = () => {
    const booking = bookings.find((b) => b.id === bookingId)
    const service = services.find((s) => s.id === serviceId)
    if (!booking || !service) return

    onSave({
      id: `ord-${Date.now()}`,
      bookingId,
      serviceId,
      serviceName: service.name,
      price: service.price,
      date: new Date().toISOString(),
      scheduledFor: date,
      status: 'pending',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Service</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Guest / Room</Label>
            <Select value={bookingId} onValueChange={setBookingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Guest" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.guestName} ({b.propertyName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Service</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} - ${s.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Date & Time</Label>
            <Input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
