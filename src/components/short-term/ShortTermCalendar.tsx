import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import {
  parseISO,
  isSameDay,
  format,
  isWithinInterval,
  addDays,
} from 'date-fns'
import { CalendarBlock } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'

export function ShortTermCalendar() {
  const { bookings, calendarBlocks, addCalendarBlock, deleteCalendarBlock } =
    useShortTermStore()
  const { properties } = usePropertyStore()
  const { toast } = useToast()

  const [date, setDate] = useState<Date | undefined>(new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [blockType, setBlockType] = useState<'manual_block' | 'maintenance'>(
    'manual_block',
  )
  const [selectedProperty, setSelectedProperty] = useState('')
  const [blockNotes, setBlockNotes] = useState('')
  const [daysCount, setDaysCount] = useState(1)

  const shortTermProperties = properties.filter(
    (p) => p.profileType === 'short_term',
  )

  // Modifiers
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

  const blockedDays = calendarBlocks.flatMap((b) => {
    const days = []
    let current = parseISO(b.startDate)
    const end = parseISO(b.endDate)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  })

  const handleDateSelect = (selected: Date | undefined) => {
    setDate(selected)
    // If user clicks a date, we could open the dialog to add block
    // Or just update selection. Let's provide a button to add block on selected date
  }

  const handleAddBlock = () => {
    if (!date || !selectedProperty) return

    const endDate = addDays(date, daysCount - 1)

    addCalendarBlock({
      id: `blk-${Date.now()}`,
      propertyId: selectedProperty,
      startDate: date.toISOString(),
      endDate: endDate.toISOString(),
      type: blockType,
      notes: blockNotes,
    })

    setDialogOpen(false)
    toast({ title: 'Period Blocked' })
    // Reset form
    setBlockNotes('')
    setDaysCount(1)
  }

  const handleDeleteBlock = (id: string) => {
    deleteCalendarBlock(id)
    toast({ title: 'Block Removed' })
  }

  const selectedDateBlocks = calendarBlocks.filter((b) => {
    if (!date) return false
    return isWithinInterval(date, {
      start: parseISO(b.startDate),
      end: parseISO(b.endDate),
    })
  })

  const selectedDateBookings = bookings.filter((b) => {
    if (!date) return false
    return isWithinInterval(date, {
      start: parseISO(b.checkIn),
      end: parseISO(b.checkOut),
    })
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            modifiers={{
              booked: bookedDays,
              blocked: blockedDays,
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontWeight: 'bold',
              },
              blocked: {
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                textDecoration: 'line-through',
              },
            }}
            className="rounded-md border shadow mx-auto"
          />
          <div className="flex gap-4 justify-center text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 rounded-full border border-blue-200"></div>{' '}
              Booked
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 rounded-full border border-red-200"></div>{' '}
              Blocked
            </div>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            disabled={!date}
            className="w-full mt-2"
          >
            Block Selected Date
          </Button>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>
            Details for {date ? format(date, 'MMM dd, yyyy') : 'Selected Date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateBookings.length === 0 &&
          selectedDateBlocks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No events for this date.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateBookings.map((b) => {
                const prop = properties.find((p) => p.id === b.propertyId)
                return (
                  <div
                    key={b.id}
                    className="border p-4 rounded-lg flex justify-between items-center bg-blue-50/50"
                  >
                    <div>
                      <h4 className="font-semibold">{b.guestName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {prop?.name} • {b.platform}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(b.checkIn), 'MMM dd')} -{' '}
                        {format(parseISO(b.checkOut), 'MMM dd')}
                      </p>
                    </div>
                    <Badge className="bg-blue-600">Reservation</Badge>
                  </div>
                )
              })}
              {selectedDateBlocks.map((b) => {
                const prop = properties.find((p) => p.id === b.propertyId)
                return (
                  <div
                    key={b.id}
                    className="border p-4 rounded-lg flex justify-between items-center bg-red-50/50"
                  >
                    <div>
                      <h4 className="font-semibold">
                        {b.type === 'maintenance'
                          ? 'Maintenance'
                          : 'Owner Block'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {prop?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{b.notes}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="destructive">Blocked</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBlock(b.id)}
                        className="h-6 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Date Range</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Property</Label>
              <Select
                value={selectedProperty}
                onValueChange={setSelectedProperty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Property" />
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
              <Label>Block Type</Label>
              <Select
                value={blockType}
                onValueChange={(v: any) => setBlockType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_block">
                    Owner / Manual Block
                  </SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input value={date ? format(date, 'yyyy-MM-dd') : ''} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Duration (Days)</Label>
              <Input
                type="number"
                min={1}
                value={daysCount}
                onChange={(e) => setDaysCount(parseInt(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Notes</Label>
              <Input
                value={blockNotes}
                onChange={(e) => setBlockNotes(e.target.value)}
                placeholder="Reason for blocking..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddBlock}>Save Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
