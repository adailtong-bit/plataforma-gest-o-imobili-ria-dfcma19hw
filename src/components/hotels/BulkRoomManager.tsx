import { useState, useContext } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, ListPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { AppContext } from '@/stores/AppContext'
import usePropertyStore from '@/stores/usePropertyStore'

interface BulkRoomManagerProps {
  hotelId: string
  defaultTowerId?: string
  roomTypes: any[]
}

export function BulkRoomManager({
  hotelId,
  defaultTowerId,
  roomTypes,
}: BulkRoomManagerProps) {
  const { towers } = useContext(AppContext)!
  const hotelTowers = towers.filter((t) => t.hotelId === hotelId)
  const { toast } = useToast()
  const { fetchProperties } = usePropertyStore()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Default row structure
  const createEmptyRow = () => ({
    id: Date.now().toString() + Math.random().toString(),
    roomNumber: '',
    floor: '',
    towerId:
      defaultTowerId || (hotelTowers.length > 0 ? hotelTowers[0].id : ''),
    roomTypeId: '',
  })

  const [rows, setRows] = useState<any[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ])

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow()])
  }

  const handleRemoveRow = (id: string) => {
    setRows(rows.filter((r) => r.id !== id))
  }

  const handleChange = (id: string, field: string, value: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const handleSave = async () => {
    // Filter out rows without room number
    const validRows = rows.filter((r) => r.roomNumber.trim() !== '')

    if (validRows.length === 0) {
      toast({
        title: 'Warning',
        description: 'No valid rooms to save.',
        variant: 'destructive',
      })
      return
    }

    // Check if categories are assigned
    const missingTypes = validRows.some((r) => !r.roomTypeId)
    if (missingTypes) {
      toast({
        title: 'Warning',
        description: 'Please assign a Category to all rooms.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    // Fetch hotel data to get name and location context
    const { data: hotelData } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', hotelId)
      .single()

    const inserts = validRows.map((r) => {
      const roomType = roomTypes.find((rt) => rt.id === r.roomTypeId)
      return {
        hotel_id: hotelId,
        tower_id: r.towerId || null,
        room_type_id: r.roomTypeId,
        room_number: r.roomNumber,
        floor: r.floor,
        name: `Room ${r.roomNumber} - ${roomType?.name || ''}`,
        type: 'Hotel Room',
        profile_type: 'short_term',
        status: 'available',
        listing_price: roomType?.base_price || 0,
        bedrooms: roomType?.bedrooms || 1,
        bathrooms: roomType?.bathrooms || 1,
        guests: roomType?.capacity || 2,
        address: hotelData?.address || '',
        city: hotelData?.city || '',
        state: hotelData?.state || '',
        country: hotelData?.country || 'US',
      }
    })

    const { error } = await supabase.from('properties').insert(inserts)

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Success',
        description: `${validRows.length} rooms created successfully.`,
      })
      if (typeof fetchProperties === 'function') {
        fetchProperties()
      } else {
        window.location.reload()
      }
      setOpen(false)
      setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()])
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setRows([createEmptyRow(), createEmptyRow(), createEmptyRow()])
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-trust-blue text-white gap-2">
          <ListPlus className="h-4 w-4" /> Bulk Registration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Room Registration</DialogTitle>
          <DialogDescription>
            Quickly add multiple rooms by assigning them to predefined Room
            Categories.
          </DialogDescription>
        </DialogHeader>

        {roomTypes.length === 0 ? (
          <div className="py-8 text-center text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-semibold mb-2">No Room Categories Found</p>
            <p className="text-sm">
              Please create Room Categories in the "Room Types & Rates" tab
              before registering rooms in bulk.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="border rounded-md">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[150px]">Room # *</TableHead>
                    <TableHead className="w-[120px]">Floor</TableHead>
                    {hotelTowers.length > 0 && (
                      <TableHead>Tower/Wing</TableHead>
                    )}
                    <TableHead>Category/Type *</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="p-2">
                        <Input
                          placeholder="e.g. 101"
                          value={row.roomNumber}
                          onChange={(e) =>
                            handleChange(row.id, 'roomNumber', e.target.value)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          placeholder="e.g. 1"
                          value={row.floor}
                          onChange={(e) =>
                            handleChange(row.id, 'floor', e.target.value)
                          }
                        />
                      </TableCell>
                      {hotelTowers.length > 0 && (
                        <TableCell className="p-2">
                          <Select
                            value={row.towerId}
                            onValueChange={(val) =>
                              handleChange(row.id, 'towerId', val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {hotelTowers.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )}
                      <TableCell className="p-2">
                        <Select
                          value={row.roomTypeId}
                          onValueChange={(val) =>
                            handleChange(row.id, 'roomTypeId', val)
                          }
                        >
                          <SelectTrigger
                            className={
                              !row.roomTypeId ? 'border-amber-300' : ''
                            }
                          >
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {roomTypes.map((rt) => (
                              <SelectItem key={rt.id} value={rt.id}>
                                {rt.name} - ${rt.base_price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveRow(row.id)}
                          className="text-slate-400 hover:text-red-500"
                          disabled={rows.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="w-full border-dashed"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Row
            </Button>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || roomTypes.length === 0}
            className="bg-trust-blue text-white"
          >
            Save Rooms
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
