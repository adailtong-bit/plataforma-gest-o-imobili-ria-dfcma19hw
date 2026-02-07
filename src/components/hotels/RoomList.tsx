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
import { Plus, Trash2, Edit2, Key, Eye, Filter } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import { Property, PropertyStatus } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Link } from 'react-router-dom'
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

  // Advanced Filters
  const [filterRoomNumber, setFilterRoomNumber] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterOccupancy, setFilterOccupancy] = useState<string>('all')
  const [filterService, setFilterService] = useState<string>('all')

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
    amenities: [],
  })

  // Filter Logic
  const filteredRooms = properties
    .filter((p) => {
      // Basic context filtering
      if (p.hotelId !== hotelId) return false
      // If towerId is 'none', we show rooms without a towerId or explicitly linked to 'none' if that was a thing.
      // But usually 'none' implies direct hotel rooms.
      // However, if we are in HotelDetails (no towers mode), we want ALL rooms of the hotel regardless of towerId (which should be undefined).
      if (towerId !== 'none' && p.towerId !== towerId) return false
      if (towerId === 'none' && p.towerId) return false // Only show direct rooms if no tower context

      // Advanced filters
      if (
        filterRoomNumber &&
        !p.roomNumber?.toLowerCase().includes(filterRoomNumber.toLowerCase())
      )
        return false
      if (filterStatus !== 'all' && p.status !== filterStatus) return false

      // Occupancy Filter (Mock logic: based on maxOccupancy)
      if (filterOccupancy !== 'all') {
        const capacity = p.roomCharacteristics?.maxOccupancy || 0
        if (filterOccupancy === 'single' && capacity !== 1) return false
        if (filterOccupancy === 'double' && capacity !== 2) return false
        if (filterOccupancy === 'family' && capacity < 3) return false
      }

      // Service/Amenities Filter
      if (filterService !== 'all') {
        if (!p.amenities?.includes(filterService)) return false
      }

      return true
    })
    .sort((a, b) => (a.roomNumber || '').localeCompare(b.roomNumber || ''))

  // Extract unique amenities for filter
  const allAmenities = Array.from(
    new Set(
      properties
        .filter((p) => p.hotelId === hotelId)
        .flatMap((p) => p.amenities || []),
    ),
  )

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
      updateProperty({
        ...editingRoom,
        ...formData,
      } as Property)
      toast({ title: t('common.success') })
    } else {
      addProperty({
        id: `room-${Date.now()}`,
        ...formData,
        hotelId,
        towerId: towerId === 'none' ? undefined : towerId,
        type: 'Hotel Room',
        profileType: 'short_term',
        ownerId: 'system',
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
      amenities: [],
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
      amenities: room.amenities || [],
    })
    setOpen(true)
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
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-lg border">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Filters */}
          <div className="relative">
            <Filter className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Room No."
              value={filterRoomNumber}
              onChange={(e) => setFilterRoomNumber(e.target.value)}
              className="pl-8 w-[120px] bg-white"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Ready</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterOccupancy} onValueChange={setFilterOccupancy}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Capacity</SelectItem>
              <SelectItem value="single">Single (1)</SelectItem>
              <SelectItem value="double">Double (2)</SelectItem>
              <SelectItem value="family">Family (3+)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-[130px] bg-white">
              <SelectValue placeholder="Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {allAmenities.map((am) => (
                <SelectItem key={am} value={am}>
                  {am}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                  Characteristics
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
                  <div className="flex items-center space-x-2 mt-4">
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
              <TableHead>Occupancy</TableHead>
              <TableHead className="text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No rooms found matching filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => (
                <TableRow key={room.id} className="hover:bg-slate-50">
                  <TableCell className="font-bold flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-500" />
                    {room.roomNumber}
                  </TableCell>
                  <TableCell>{room.roomCharacteristics?.bedType}</TableCell>
                  <TableCell>
                    <Select
                      value={room.status}
                      onValueChange={(v) =>
                        updateStatus(room, v as PropertyStatus)
                      }
                    >
                      <SelectTrigger
                        className={`h-8 w-[130px] border-0 ${getStatusColor(room.status)} font-bold`}
                      >
                        <SelectValue>{room.status}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Ready</SelectItem>
                        <SelectItem value="cleaning">In Cleaning</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {room.roomCharacteristics?.maxOccupancy || 2} Guests
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={
                          towerId !== 'none'
                            ? `/hotels/${hotelId}/towers/${towerId}/rooms/${room.id}`
                            : `/hotels/${hotelId}/rooms/${room.id}`
                        }
                      >
                        <Button variant="ghost" size="icon" title="View Detail">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(room)}
                        title="Quick Edit"
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
    </div>
  )
}
