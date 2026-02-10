import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import usePropertyStore from '@/stores/usePropertyStore'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DataMask } from '@/components/DataMask'

interface RoomListProps {
  hotelId: string
  towerId: string
}

export function RoomList({ hotelId, towerId }: RoomListProps) {
  const { properties } = usePropertyStore()

  const rooms = properties.filter(
    (p) =>
      p.hotelId === hotelId &&
      (towerId === 'none' || p.towerId === towerId) &&
      p.profileType === 'short_term',
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Number</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow key={room.id}>
            <TableCell className="font-bold">{room.roomNumber}</TableCell>
            <TableCell>{room.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{room.status}</Badge>
            </TableCell>
            <TableCell>
              <DataMask>${room.listingPrice}</DataMask>
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="ghost" asChild>
                <Link
                  to={
                    towerId !== 'none'
                      ? `/hotels/${hotelId}/towers/${towerId}/rooms/${room.id}`
                      : `/hotels/${hotelId}/rooms/${room.id}`
                  }
                >
                  View
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {rooms.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center py-4 text-muted-foreground"
            >
              No rooms found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
