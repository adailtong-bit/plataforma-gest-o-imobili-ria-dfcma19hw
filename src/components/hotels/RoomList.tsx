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
import { Plus, Trash2, Edit2, Key } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import { Property, PropertyStatus } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Link } from 'react-router-dom'
import { DataMask } from '@/components/DataMask'

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
  const [formData, setFormData] = useState<Partial<Property>>({
    name: '',
    roomNumber: '',
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    status: 'available',
    listingPrice: 0,
  })

  const rooms = properties.filter(
    (p) => p.hotelId === hotelId && p.towerId === towerId,
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
        towerId,
        type: 'Hotel Room',
        profileType: 'short_term',
        address: 'Hotel Address', // Inherit from Hotel typically
        ownerId: 'system', // Default owner
        image: 'https://img.usecurling.com/p/400/300?q=hotel%20room',
      } as Property)
      toast({ title: t('common.success') })
    }
    setOpen(false)
    setEditingRoom(null)
    setFormData({
      name: '',
      roomNumber: '',
      bedrooms: 1,
      bathrooms: 1,
      guests: 2,
      status: 'available',
      listingPrice: 0,
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
    })
    setOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
      case 'rented':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-red-100 text-red-800'
      case 'cleaning':
        return 'bg-yellow-100 text-yellow-800'
      case 'available':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100'
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
              setFormData({
                name: '',
                roomNumber: '',
                bedrooms: 1,
                bathrooms: 1,
                guests: 2,
                status: 'available',
                listingPrice: 0,
              })
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('hotels.add_room')}
            </Button>
          </DialogTrigger>
          <DialogContent>
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
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label>{t('properties.features.bedrooms')}</Label>
                  <Input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bedrooms: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('properties.features.bathrooms')}</Label>
                  <Input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bathrooms: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('properties.features.guests')}</Label>
                  <Input
                    type="number"
                    value={formData.guests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        guests: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
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
              <TableHead>{t('common.name')}</TableHead>
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
                <TableRow key={room.id}>
                  <TableCell className="font-bold flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-500" />
                    {room.roomNumber}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/properties/${room.id}`}
                      className="hover:underline text-blue-600"
                    >
                      <DataMask>{room.name}</DataMask>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell>${room.listingPrice}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
    </div>
  )
}
