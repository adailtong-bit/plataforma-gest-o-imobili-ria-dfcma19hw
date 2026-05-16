import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DataMask } from '@/components/DataMask'
import { BulkRoomManager } from './BulkRoomManager'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Edit, Save } from 'lucide-react'

interface RoomListProps {
  hotelId: string
  towerId: string
}

export function RoomList({ hotelId, towerId }: RoomListProps) {
  const [roomTypes, setRoomTypes] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRoom, setEditingRoom] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})
  const { toast } = useToast()

  const fetchRooms = async () => {
    let query = supabase.from('properties').select('*').eq('hotel_id', hotelId)

    if (towerId !== 'none') {
      query = query.eq('tower_id', towerId)
    }

    const { data } = await query
    if (data) {
      const sorted = data.sort((a, b) => {
        const nameA = a.room_number || a.name || ''
        const nameB = b.room_number || b.name || ''
        return nameA.localeCompare(nameB)
      })
      setRooms(sorted)
    }
    setLoading(false)
  }

  const fetchRoomTypes = async () => {
    const { data } = await supabase
      .from('room_types')
      .select('id, name, base_price')
      .eq('hotel_id', hotelId)
      .order('name')
    if (data) setRoomTypes(data)
  }

  useEffect(() => {
    fetchRoomTypes()
    fetchRooms()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties',
          filter: `hotel_id=eq.${hotelId}`,
        },
        () => {
          fetchRooms()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [hotelId, towerId])

  const handleUpdateCategory = async (roomId: string, typeId: string) => {
    const updatePayload =
      typeId === 'custom' ? { room_type_id: null } : { room_type_id: typeId }

    const selectedType = roomTypes.find((rt) => rt.id === typeId)
    if (selectedType) {
      ;(updatePayload as any).listing_price = selectedType.base_price
    }

    const { error } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', roomId)

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Room category updated successfully.',
      })
      setRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? {
                ...r,
                room_type_id: updatePayload.room_type_id,
                listing_price: selectedType
                  ? selectedType.base_price
                  : r.listing_price,
              }
            : r,
        ),
      )
    }
  }

  const handleSaveEdit = async () => {
    if (!editingRoom) return
    setLoading(true)

    const updatePayload: any = {
      room_number: editFormData.room_number,
      name: editFormData.name,
      room_type_id:
        editFormData.room_type_id === 'custom'
          ? null
          : editFormData.room_type_id,
    }

    const selectedType = roomTypes.find(
      (rt) => rt.id === updatePayload.room_type_id,
    )
    if (selectedType) {
      updatePayload.listing_price = selectedType.base_price
    }

    const { error } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', editingRoom.id)

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: 'Room updated successfully.',
      })
      fetchRooms()
      setEditingRoom(null)
    }
    setLoading(false)
  }

  if (loading && rooms.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-md border border-slate-100">
        <p className="text-sm font-medium text-slate-600 px-2">
          {rooms.length} Room{rooms.length !== 1 && 's'} Found
        </p>
        <BulkRoomManager
          hotelId={hotelId}
          defaultTowerId={towerId !== 'none' ? towerId : undefined}
          roomTypes={roomTypes}
        />
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Room Number / Name</TableHead>
              <TableHead>Pricing Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.map((room) => {
              const typeInfo = roomTypes.find(
                (rt) => rt.id === room.room_type_id,
              )
              const displayPrice = typeInfo
                ? typeInfo.base_price
                : room.listing_price

              return (
                <TableRow key={room.id}>
                  <TableCell className="font-bold text-slate-700">
                    {room.room_number || room.name || 'Unnamed Room'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={room.room_type_id || 'custom'}
                      onValueChange={(val) =>
                        handleUpdateCategory(room.id, val)
                      }
                    >
                      <SelectTrigger className="w-[220px] h-9 text-sm bg-white border-slate-300">
                        <SelectValue placeholder="Select Pricing Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="custom"
                          className="text-sm text-slate-500 italic"
                        >
                          None / Custom Price
                        </SelectItem>
                        {roomTypes.map((rt) => (
                          <SelectItem
                            key={rt.id}
                            value={rt.id}
                            className="text-sm font-medium text-slate-900"
                          >
                            {rt.name} - ${rt.base_price}/night
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        room.status === 'available' ? 'default' : 'secondary'
                      }
                      className="capitalize"
                    >
                      {room.status || 'available'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DataMask className="font-medium text-green-700">
                      ${displayPrice || 0}
                    </DataMask>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingRoom(room)
                          setEditFormData({
                            room_number: room.room_number || '',
                            name: room.name || '',
                            room_type_id: room.room_type_id || 'custom',
                          })
                        }}
                        className="text-trust-blue border-trust-blue/20 hover:bg-trust-blue/10 gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-500"
                        asChild
                      >
                        <Link
                          to={
                            towerId !== 'none'
                              ? `/hotels/${hotelId}/towers/${towerId}/rooms/${room.id}`
                              : `/hotels/${hotelId}/rooms/${room.id}`
                          }
                        >
                          Details
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {rooms.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No rooms found in this view.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editingRoom}
        onOpenChange={(open) => !open && setEditingRoom(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={editFormData.room_number || ''}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      room_number: e.target.value,
                    })
                  }
                  placeholder="e.g. 101"
                />
              </div>
              <div className="space-y-2">
                <Label>Room Name</Label>
                <Input
                  value={editFormData.name || ''}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  placeholder="e.g. Ocean View Suite"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category (Pricing)</Label>
              <Select
                value={editFormData.room_type_id}
                onValueChange={(val) =>
                  setEditFormData({ ...editFormData, room_type_id: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">None / Custom Price</SelectItem>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name} - ${rt.base_price}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Associating a category will automatically apply its base price
                to this room.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRoom(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-trust-blue text-white gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
