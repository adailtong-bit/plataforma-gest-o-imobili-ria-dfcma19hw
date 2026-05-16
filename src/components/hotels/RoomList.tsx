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
import { BulkRoomManager } from './BulkRoomManager'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface RoomListProps {
  hotelId: string
  towerId: string
}

export function RoomList({ hotelId, towerId }: RoomListProps) {
  const { properties } = usePropertyStore()
  const [roomTypes, setRoomTypes] = useState<any[]>([])

  useEffect(() => {
    const fetchRoomTypes = async () => {
      const { data } = await supabase
        .from('room_types')
        .select('id, name, base_price')
        .eq('hotel_id', hotelId)
      if (data) setRoomTypes(data)
    }
    fetchRoomTypes()
  }, [hotelId])

  const rooms = properties.filter(
    (p) =>
      p.hotelId === hotelId &&
      (towerId === 'none' || p.towerId === towerId) &&
      p.profileType === 'short_term',
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <BulkRoomManager
          hotelId={hotelId}
          defaultTowerId={towerId !== 'none' ? towerId : undefined}
          roomTypes={roomTypes}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>Category/Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Base Price</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => {
            const typeInfo = roomTypes.find(
              (rt) => rt.id === (room as any).room_type_id,
            )
            const displayPrice = typeInfo
              ? typeInfo.base_price
              : room.listingPrice

            return (
              <TableRow key={room.id}>
                <TableCell className="font-bold">{room.roomNumber}</TableCell>
                <TableCell>
                  {typeInfo ? (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      {typeInfo.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">
                      {room.name} (Custom)
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{room.status}</Badge>
                </TableCell>
                <TableCell>
                  <DataMask>${displayPrice}</DataMask>
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
            )
          })}
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
    </div>
  )
}
