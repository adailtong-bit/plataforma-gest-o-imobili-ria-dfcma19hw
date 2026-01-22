import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, MoreHorizontal, Send, Filter } from 'lucide-react'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { Booking, MessageTemplate } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ShortTermBookings() {
  const { bookings, messageTemplates } = useShortTermStore()
  const { properties } = usePropertyStore()
  const { toast } = useToast()

  const [filter, setFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)

  const filteredBookings = bookings.filter(
    (b) =>
      (b.guestName.toLowerCase().includes(filter.toLowerCase()) ||
        properties
          .find((p) => p.id === b.propertyId)
          ?.name.toLowerCase()
          .includes(filter.toLowerCase())) &&
      (sourceFilter === 'all' || b.platform === sourceFilter),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'checked_in':
        return 'bg-green-100 text-green-800'
      case 'checked_out':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100'
    }
  }

  const handleTriggerTemplate = (template: MessageTemplate) => {
    if (!selectedBooking) return
    // Mock sending
    let content = template.content
    content = content.replace('{GuestName}', selectedBooking.guestName)
    content = content.replace(
      '{CheckInDate}',
      format(parseISO(selectedBooking.checkIn), 'dd/MM/yyyy'),
    )

    toast({
      title: 'Message Sent',
      description: `Template "${template.name}" sent to ${selectedBooking.guestName}`,
    })
    setMessageDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guest or property..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="w-[200px]">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Source" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="airbnb">Airbnb</SelectItem>
              <SelectItem value="vrbo">Vrbo</SelectItem>
              <SelectItem value="booking.com">Booking.com</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => {
                const prop = properties.find((p) => p.id === booking.propertyId)
                return (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{prop?.name}</TableCell>
                    <TableCell>{booking.guestName}</TableCell>
                    <TableCell className="text-xs">
                      {format(parseISO(booking.checkIn), 'MMM dd')} -{' '}
                      {format(parseISO(booking.checkOut), 'MMM dd')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.platform}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(booking.status)}
                        variant="outline"
                      >
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>${booking.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBooking(booking)
                              setMessageDialogOpen(true)
                            }}
                          >
                            <Send className="mr-2 h-4 w-4" /> Send Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Send Message to {selectedBooking?.guestName}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Select a template to send:
            </p>
            {messageTemplates.map((tmpl) => (
              <Button
                key={tmpl.id}
                variant="outline"
                className="justify-start"
                onClick={() => handleTriggerTemplate(tmpl)}
              >
                {tmpl.name}
              </Button>
            ))}
            {messageTemplates.length === 0 && (
              <p className="text-sm italic">No templates configured.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
