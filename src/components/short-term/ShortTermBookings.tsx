import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import useShortTermStore from '@/stores/useShortTermStore'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import { DataMask } from '@/components/DataMask'

export function ShortTermBookings() {
  const { bookings } = useShortTermStore()

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Guest</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Check-In</TableHead>
            <TableHead>Check-Out</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <DataMask>{booking.guestName}</DataMask>
              </TableCell>
              <TableCell>
                <DataMask>{booking.propertyName || 'Unknown'}</DataMask>
              </TableCell>
              <TableCell>{format(new Date(booking.checkIn), 'PP')}</TableCell>
              <TableCell>{format(new Date(booking.checkOut), 'PP')}</TableCell>
              <TableCell>
                <DataMask>{formatCurrency(booking.totalAmount)}</DataMask>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{booking.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
