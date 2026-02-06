import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Edit2, Key, Eye } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import { Property, PropertyStatus, RoomCharacteristics } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Link } from 'react-router-dom'
import { DataMask } from '@/components/DataMask'
import { RoomDetailsSheet } from '@/components/hotels/RoomDetailsSheet'
import { Checkbox } from '@/components/ui/checkbox'

interface RoomListProps {
  hotelId: string
  towerId: string
}

export function RoomList({ hotelId, towerId }: RoomListProps) {
  const { properties, addProperty, updateProperty, deleteProperty } =
    usePropertyStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Property | null>(null)

  // Detail Sheet State
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<Property | null>(null)

  const [formData, setFormData] = useState<Partial<Property>>({
    name: '',
    roomNumber: '',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    status: 'available',
    listingPrice: 0,
    roomCharacteristics: {
      bedType: 'Queen',
      view: 'Standard',
      hasBalcony: false,
      maxOccupancy: 2,
      sizeSqFt: 0,
    },
  })

  const rooms = properties
    .filter((p) => p.hotelId === hotelId && p.towerId === towerId)
    .sort((a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''))

  const handleSave = () => {
    if (!formData.name || !formData.roomNumber) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }

    if (editingRoom) {
      // Check if price changed to record history
      let newHistory = editingRoom.priceHistory || []
      if (editingRoom.listingPrice !== formData.listingPrice) {
        newHistory = [
          ...newHistory,
          {
            date: new Date().toISOString(),
            price: editingRoom.listingPrice || 0,
            changedBy: 'User', // ideally current user name
          },
        ]
      }

      updateProperty({
        ...editingRoom,
        ...formData,
        priceHistory: newHistory,
      } as Property)
      toast({ title: t('common.success') })
    } else {
      addProperty({
        id: `room-${Date.now()}`,
        ...formData,
        hotelId,
        towerId,
        type: 'Hotel Room',
        profileType: 'short_term',
        address: 'Hotel Address', // Inherit from Hotel typically
        ownerId: 'system', // Default owner
        image: 'https://img.usecurling.com/p/400/300?q=hotel%20room',
        priceHistory: [],
      } as Property)
      toast({ title: t('common.success') })
    }
    setOpen(false)
    setEditingRoom(null)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      roomNumber: '',
      bedrooms: 1,
      bathrooms: 1,
      guests: 2,
      status: 'available',
      listingPrice: 0,
      roomCharacteristics: {
        bedType: 'Queen',
        view: 'Standard',
        hasBalcony: false,
        maxOccupancy: 2,
        sizeSqFt: 0,
      },
    })
  }

  const handleDelete = (id: string) => {
    if (confirm(t('common.delete_title'))) {
      deleteProperty(id)
      toast({ title: t('common.success') })
    }
  }

  const openEdit = (room: Property) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      roomNumber: room.roomNumber,
      bedrooms: room.bedrooms,
      bathrooms: room.bathrooms,
      guests: room.guests,
      status: room.status,
      listingPrice: room.listingPrice,
      roomCharacteristics: room.roomCharacteristics || {
        bedType: 'Queen',
        view: 'Standard',
        hasBalcony: false,
        maxOccupancy: 2,
        sizeSqFt: 0,
      },
    })
    setOpen(true)
  }

  const openDetails = (room: Property) => {
    setSelectedRoom(room)
    setDetailsOpen(true)
  }

  const updateStatus = (room: Property, newStatus: PropertyStatus) => {
    updateProperty({ ...room, status: newStatus })
    toast({ title: 'Status Updated' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
      case 'rented':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'cleaning':
        return 'bg-blue-100 text-blue-800 border-blue-300' // "In Cleaning" often associated with blue/cyan
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300' // "Ready"
      default:
        return 'bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Ready'
      case 'occupied':
        return 'Occupied'
      case 'maintenance':
        return 'Maintenance'
      case 'cleaning':
        return 'In Cleaning'
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('hotels.rooms')}</h3>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v)
            if (!v) {
              setEditingRoom(null)
              resetForm()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('hotels.add_room')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRoom ? t('common.edit') : t('hotels.new_room')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('hotels.room_number')}</Label>
                  <Input
                    value={formData.roomNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, roomNumber: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.name')}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Deluxe Suite"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('common.status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v as PropertyStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Ready</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="cleaning">In Cleaning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Nightly Rate ($)</Label>
                  <Input
                    type="number"
                    value={formData.listingPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        listingPrice: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Characteristics */}
              <div className="border-t pt-4">
                <Label className="mb-2 block font-semibold">
                  Unit Characteristics
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Bed Type</Label>
                    <Select
                      value={formData.roomCharacteristics?.bedType}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          roomCharacteristics: {
                            ...formData.roomCharacteristics!,
                            bedType: v,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="King">King</SelectItem>
                        <SelectItem value="Queen">Queen</SelectItem>
                        <SelectItem value="Double">Double</SelectItem>
                        <SelectItem value="Twin">Twin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>View Type</Label>
                    <Select
                      value={formData.roomCharacteristics?.view}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          roomCharacteristics: {
                            ...formData.roomCharacteristics!,
                            view: v,
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="City View">City View</SelectItem>
                        <SelectItem value="Sea View">Sea View</SelectItem>
                        <SelectItem value="Garden View">Garden View</SelectItem>
                        <SelectItem value="Pool View">Pool View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Max Occupancy</Label>
                    <Input
                      type="number"
                      value={formData.roomCharacteristics?.maxOccupancy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          roomCharacteristics: {
                            ...formData.roomCharacteristics!,
                            maxOccupancy: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end mb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="balcony"
                        checked={formData.roomCharacteristics?.hasBalcony}
                        onCheckedChange={(c) =>
                          setFormData({
                            ...formData,
                            roomCharacteristics: {
                              ...formData.roomCharacteristics!,
                              hasBalcony: c as boolean,
                            },
                          })
                        }
                      />
                      <Label htmlFor="balcony">Has Balcony</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('hotels.room_number')}</TableHead>
              <TableHead>{t('common.type')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead>{t('common.value')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  {t('hotels.no_rooms')}
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow
                  key={room.id}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => openDetails(room)}
                >
                  <TableCell className="font-bold flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-500" />
                    {room.roomNumber}
                  </TableCell>
                  <TableCell>
                    {room.roomCharacteristics?.bedType} /{' '}
                    {room.roomCharacteristics?.view}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={room.status}
                      onValueChange={(v) =>
                        updateStatus(room, v as PropertyStatus)
                      }
                    >
                      <SelectTrigger
                        className={`h-8 w-[130px] border-0 ${getStatusColor(room.status)} font-bold`}
                      >
                        <SelectValue>{getStatusLabel(room.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Ready</SelectItem>
                        <SelectItem value="cleaning">In Cleaning</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>${room.listingPrice}</TableCell>
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDetails(room)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(room)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(room.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RoomDetailsSheet
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        room={selectedRoom}
      />
    </div>
  )
}
