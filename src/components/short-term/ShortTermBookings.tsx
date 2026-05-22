import { useState } from 'react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'

export function ShortTermBookings() {
  const { bookings, addBooking, updateBooking } = useShortTermStore()
  const { properties, updateProperty } = usePropertyStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    guestName: '',
    propertyId: '',
    checkIn: '',
    checkOut: '',
    totalAmount: 0,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validate = () => {
    const newErrors: { [key: string]: string } = {}
    let isValid = true

    if (!formData.guestName) {
      newErrors.guestName = 'Guest name is required'
      isValid = false
    }

    if (!formData.propertyId) {
      newErrors.propertyId = 'Property is required'
      isValid = false
    }

    if (!formData.checkIn) {
      newErrors.checkIn = 'Check-in is required'
      isValid = false
    }

    if (!formData.checkOut) {
      newErrors.checkOut = 'Check-out is required'
      isValid = false
    } else if (formData.checkIn && formData.checkOut <= formData.checkIn) {
      newErrors.checkOut = 'Check-out must be after check-in'
      isValid = false
    }

    if (formData.totalAmount < 0) {
      newErrors.totalAmount = 'Amount cannot be negative'
      isValid = false
    }

    // Reservation Conflict Check
    if (formData.propertyId && formData.checkIn && formData.checkOut) {
      const isConflict = bookings.some(
        (b) =>
          b.propertyId === formData.propertyId &&
          b.status !== 'cancelled' &&
          ((formData.checkIn >= b.checkIn && formData.checkIn < b.checkOut) ||
            (formData.checkOut > b.checkIn &&
              formData.checkOut <= b.checkOut) ||
            (formData.checkIn <= b.checkIn && formData.checkOut >= b.checkOut)),
      )

      if (isConflict) {
        newErrors.general =
          'This property is already booked for the selected dates.'
        isValid = false
      }

      // Check for maintenance
      const property = properties.find((p) => p.id === formData.propertyId)
      if (property?.status === 'maintenance') {
        newErrors.general =
          'Cannot book a property currently under maintenance.'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = () => {
    if (!validate()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors before saving.',
        variant: 'destructive',
      })
      return
    }

    const prop = properties.find((p) => p.id === formData.propertyId)

    const newBooking = {
      id: `st-${Date.now()}`,
      propertyId: formData.propertyId,
      propertyName: prop?.name || 'Unknown Property',
      guestName: formData.guestName,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      totalAmount: formData.totalAmount,
      status: 'confirmed' as const,
      guests: 1,
      platform: 'direct',
    }

    addBooking(newBooking as any)
    setIsOpen(false)
    setFormData({
      guestName: '',
      propertyId: '',
      checkIn: '',
      checkOut: '',
      totalAmount: 0,
    })
    setErrors({})
    toast({
      title: 'Booking Created',
      description: 'Reservation has been successfully created.',
    })
  }

  // Inter-module logic: Check-in button to change property status
  const handleCheckIn = (bookingId: string, propertyId: string) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      updateBooking({ ...booking, status: 'checked_in' } as any)
      const prop = properties.find((p) => p.id === propertyId)
      if (prop) {
        updateProperty({ ...prop, status: 'occupied' }) // Room status auto transition
      }
      toast({ title: 'Checked In', description: 'Status updated to Occupied.' })
    }
  }

  const handleCheckOut = (bookingId: string, propertyId: string) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      updateBooking({ ...booking, status: 'checked_out' } as any)
      const prop = properties.find((p) => p.id === propertyId)
      if (prop) {
        updateProperty({ ...prop, status: 'available' }) // Room status auto transition
      }
      toast({
        title: 'Checked Out',
        description: 'Status updated to Available.',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsOpen(true)} className="bg-trust-blue gap-2">
          <Plus className="h-4 w-4" /> {t('common.new', 'New')} Booking
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('short_term.guest', 'Guest Name')}</TableHead>
              <TableHead>{t('common.property', 'Property')}</TableHead>
              <TableHead>{t('short_term.check_in', 'Check-in')}</TableHead>
              <TableHead>{t('short_term.check_out', 'Check-out')}</TableHead>
              <TableHead>{t('short_term.amount', 'Total Amount')}</TableHead>
              <TableHead>{t('common.status', 'Status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions', 'Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-4 text-muted-foreground"
                >
                  {t('short_term.empty', 'No records found.')}
                </TableCell>
              </TableRow>
            )}
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <DataMask>{booking.guestName}</DataMask>
                </TableCell>
                <TableCell>
                  <DataMask>{booking.propertyName || 'Unknown'}</DataMask>
                </TableCell>
                <TableCell>{format(new Date(booking.checkIn), 'PP')}</TableCell>
                <TableCell>
                  {format(new Date(booking.checkOut), 'PP')}
                </TableCell>
                <TableCell>
                  <DataMask>{formatCurrency(booking.totalAmount)}</DataMask>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.status === 'checked_in' ? 'default' : 'outline'
                    }
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCheckIn(booking.id, booking.propertyId)
                      }
                    >
                      {t('short_term.check_in_btn', 'Check-In')}
                    </Button>
                  )}
                  {booking.status === 'checked_in' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCheckOut(booking.id, booking.propertyId)
                      }
                    >
                      {t('short_term.check_out_btn', 'Check-Out')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) setErrors({})
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('short_term.add_title', 'Include Reservation')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {errors.general && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
                {errors.general}
              </div>
            )}
            <div className="grid gap-2">
              <Label className={errors.guestName ? 'text-red-500' : ''}>
                {t('short_term.guest', 'Guest Name')}
              </Label>
              <Input
                value={formData.guestName}
                onChange={(e) => {
                  setFormData({ ...formData, guestName: e.target.value })
                  if (errors.guestName) setErrors({ ...errors, guestName: '' })
                }}
                className={
                  errors.guestName
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
                onBlur={() => {
                  if (!formData.guestName)
                    setErrors({
                      ...errors,
                      guestName: 'Guest name is required',
                    })
                }}
              />
              {errors.guestName && (
                <span className="text-xs text-red-500">{errors.guestName}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label className={errors.propertyId ? 'text-red-500' : ''}>
                {t('short_term.property', 'Property')}
              </Label>
              <select
                className={`flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.propertyId ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                value={formData.propertyId}
                onChange={(e) => {
                  setFormData({ ...formData, propertyId: e.target.value })
                  if (errors.propertyId)
                    setErrors({ ...errors, propertyId: '' })
                }}
                onBlur={() => {
                  if (!formData.propertyId)
                    setErrors({ ...errors, propertyId: 'Property is required' })
                }}
              >
                <option value="">{t('common.select', 'Select...')}</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.propertyId && (
                <span className="text-xs text-red-500">
                  {errors.propertyId}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className={errors.checkIn ? 'text-red-500' : ''}>
                  {t('short_term.check_in', 'Check-in')}
                </Label>
                <Input
                  type="date"
                  value={formData.checkIn}
                  onChange={(e) => {
                    setFormData({ ...formData, checkIn: e.target.value })
                    if (errors.checkIn) setErrors({ ...errors, checkIn: '' })
                  }}
                  className={
                    errors.checkIn
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                  onBlur={() => {
                    if (!formData.checkIn)
                      setErrors({ ...errors, checkIn: 'Check-in is required' })
                  }}
                />
                {errors.checkIn && (
                  <span className="text-xs text-red-500">{errors.checkIn}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label className={errors.checkOut ? 'text-red-500' : ''}>
                  {t('short_term.check_out', 'Check-out')}
                </Label>
                <Input
                  type="date"
                  value={formData.checkOut}
                  onChange={(e) => {
                    setFormData({ ...formData, checkOut: e.target.value })
                    if (errors.checkOut) setErrors({ ...errors, checkOut: '' })
                  }}
                  className={
                    errors.checkOut
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                  onBlur={() => {
                    if (!formData.checkOut) {
                      setErrors({
                        ...errors,
                        checkOut: 'Check-out is required',
                      })
                    } else if (
                      formData.checkIn &&
                      formData.checkOut <= formData.checkIn
                    ) {
                      setErrors({
                        ...errors,
                        checkOut: 'Check-out must be after check-in',
                      })
                    }
                  }}
                />
                {errors.checkOut && (
                  <span className="text-xs text-red-500">
                    {errors.checkOut}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className={errors.totalAmount ? 'text-red-500' : ''}>
                {t('short_term.amount', 'Total Amount')}
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalAmount || ''}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (val >= 0) {
                    setFormData({ ...formData, totalAmount: val })
                    if (errors.totalAmount)
                      setErrors({ ...errors, totalAmount: '' })
                  }
                }}
                className={
                  errors.totalAmount
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }
                onBlur={() => {
                  if (formData.totalAmount < 0) {
                    setErrors({
                      ...errors,
                      totalAmount: 'Amount cannot be negative',
                    })
                  }
                }}
              />
              {errors.totalAmount && (
                <span className="text-xs text-red-500">
                  {errors.totalAmount}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} className="bg-trust-blue">
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
