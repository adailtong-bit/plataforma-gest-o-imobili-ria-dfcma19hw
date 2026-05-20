import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, Users, BedDouble, Bath } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { BulkPricingModal } from '@/components/hotels/BulkPricingModal'
import { DollarSign } from 'lucide-react'

interface RoomType {
  id: string
  hotel_id: string
  name: string
  description: string
  base_price: number
  capacity: number
  bedrooms: number
  bathrooms: number
}

export function RoomTypesManager({ hotelId }: { hotelId: string }) {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [editingType, setEditingType] = useState<Partial<RoomType>>({})

  useEffect(() => {
    const handleUpdate = () => fetchRoomTypes()
    window.addEventListener('roomTypesUpdated', handleUpdate)
    return () => window.removeEventListener('roomTypesUpdated', handleUpdate)
  }, [hotelId])

  const fetchRoomTypes = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('hotel_id', hotelId)
      .order('name')
    if (!error && data) {
      setRoomTypes(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRoomTypes()
  }, [hotelId])

  const handleSave = async () => {
    if (!editingType.name) {
      toast({
        title: 'Error',
        description: 'Name is required',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      hotel_id: hotelId,
      name: editingType.name,
      description: editingType.description || '',
      base_price: Number(editingType.base_price) || 0,
      capacity: Number(editingType.capacity) || 1,
      bedrooms: Number(editingType.bedrooms) || 1,
      bathrooms: Number(editingType.bathrooms) || 1,
    }

    if (editingType.id) {
      const { error } = await supabase
        .from('room_types')
        .update(payload)
        .eq('id', editingType.id)
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Success', description: 'Room category updated.' })
      }
    } else {
      const { error } = await supabase.from('room_types').insert(payload)
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Success', description: 'Room category created.' })
      }
    }

    setIsDialogOpen(false)
    setEditingType({})
    fetchRoomTypes()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('room_types').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Success', description: 'Room category deleted.' })
      fetchRoomTypes()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {t('hotels.room_types') || 'Room Categories & Rates'}
          </CardTitle>
          <CardDescription>
            Define categories (e.g. Standard, Sea View) with their base prices
            to apply them in bulk to rooms.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsBulkOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" /> Bulk Pricing
          </Button>
          <Button
            onClick={() => {
              setEditingType({})
              setIsDialogOpen(true)
            }}
            className="bg-trust-blue text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </CardHeader>
      <BulkPricingModal
        hotelId={hotelId}
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
      />
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Beds/Baths</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomTypes.map((rt) => (
                <TableRow key={rt.id}>
                  <TableCell className="font-medium">
                    {rt.name}
                    {rt.description && (
                      <div className="text-xs text-slate-500 font-normal">
                        {rt.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Users className="h-4 w-4" /> {rt.capacity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-slate-600">
                      <span className="flex items-center gap-1">
                        <BedDouble className="h-4 w-4" /> {rt.bedrooms}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" /> {rt.bathrooms}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-green-700">
                    ${Number(rt.base_price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingType(rt)
                        setIsDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rt.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {roomTypes.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No categories defined. Create one to apply to rooms.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType.id ? 'Edit Category' : 'New Room Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Category Name *</Label>
              <Input
                placeholder="e.g. Deluxe Sea View"
                value={editingType.name || ''}
                onChange={(e) =>
                  setEditingType({ ...editingType, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of characteristics"
                value={editingType.description || ''}
                onChange={(e) =>
                  setEditingType({
                    ...editingType,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Base Rate ($) *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={editingType.base_price || ''}
                  onChange={(e) =>
                    setEditingType({
                      ...editingType,
                      base_price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Max Guests</Label>
                <Input
                  type="number"
                  value={editingType.capacity || 1}
                  onChange={(e) =>
                    setEditingType({
                      ...editingType,
                      capacity: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Bedrooms</Label>
                <Input
                  type="number"
                  value={editingType.bedrooms || 1}
                  onChange={(e) =>
                    setEditingType({
                      ...editingType,
                      bedrooms: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Bathrooms</Label>
                <Input
                  type="number"
                  value={editingType.bathrooms || 1}
                  onChange={(e) =>
                    setEditingType({
                      ...editingType,
                      bathrooms: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-trust-blue text-white">
              Save Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
