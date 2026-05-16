import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Loader2, BedDouble } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function HotelRoomDetails() {
  const { hotelId, towerId, roomId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [room, setRoom] = useState<any>(null)
  const [roomTypes, setRoomTypes] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      const [roomRes, typesRes] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .eq('id', roomId as string)
          .single(),
        supabase
          .from('room_types')
          .select('*')
          .eq('hotel_id', hotelId as string),
      ])

      if (roomRes.error) {
        console.error(roomRes.error)
        toast({
          title: 'Error',
          description: 'Room not found.',
          variant: 'destructive',
        })
      } else {
        setRoom(roomRes.data)
      }

      if (typesRes.data) {
        setRoomTypes(typesRes.data)
      }

      setLoading(false)
    }

    if (roomId) fetchData()
  }, [roomId, hotelId])

  const handleSave = async () => {
    setSaving(true)
    const typeInfo = roomTypes.find((rt) => rt.id === room.room_type_id)

    const updatePayload: any = {
      room_number: room.room_number,
      name: room.name,
      floor: room.floor,
      room_type_id: room.room_type_id === 'custom' ? null : room.room_type_id,
      status: room.status,
    }

    if (typeInfo) {
      updatePayload.listing_price = typeInfo.base_price
      updatePayload.bedrooms = typeInfo.bedrooms
      updatePayload.bathrooms = typeInfo.bathrooms
      updatePayload.guests = typeInfo.capacity
    }

    const { error } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', roomId as string)

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Success', description: 'Room updated successfully.' })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="p-6 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">
          Room Not Found
        </h2>
        <p className="text-slate-500 mb-6">
          Could not locate the requested room details.
        </p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-trust-blue text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <BedDouble className="h-6 w-6 text-trust-blue" />
              Edit Room {room.room_number || room.name}
            </h1>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-trust-blue text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room Details</CardTitle>
          <CardDescription>
            Update room information and link it to a Pricing Category.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Number</Label>
              <Input
                value={room.room_number || ''}
                onChange={(e) =>
                  setRoom({ ...room, room_number: e.target.value })
                }
                placeholder="e.g. 101"
              />
            </div>
            <div className="space-y-2">
              <Label>Internal Name</Label>
              <Input
                value={room.name || ''}
                onChange={(e) => setRoom({ ...room, name: e.target.value })}
                placeholder="e.g. Presidential Suite"
              />
            </div>
            <div className="space-y-2">
              <Label>Floor</Label>
              <Input
                value={room.floor || ''}
                onChange={(e) => setRoom({ ...room, floor: e.target.value })}
                placeholder="e.g. 1st Floor"
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={room.status || 'available'}
                onValueChange={(val) => setRoom({ ...room, status: val })}
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
          </div>

          <div className="p-4 bg-slate-50 border rounded-lg space-y-4">
            <div>
              <Label className="text-base font-semibold text-slate-800">
                Pricing Category (Room Type)
              </Label>
              <p className="text-sm text-slate-500 mb-4 mt-1">
                Link this room to a Pricing Category. The nightly rate,
                capacity, and bed arrangements will automatically sync from the
                category settings, updating instantly when prices change.
              </p>
              <Select
                value={room.room_type_id || 'custom'}
                onValueChange={(val) => setRoom({ ...room, room_type_id: val })}
              >
                <SelectTrigger className="w-full max-w-md bg-white border-slate-300 shadow-sm">
                  <SelectValue placeholder="Select a Pricing Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom" className="text-slate-500 italic">
                    None / Custom Category
                  </SelectItem>
                  {roomTypes.map((rt) => (
                    <SelectItem
                      key={rt.id}
                      value={rt.id}
                      className="font-medium text-slate-900"
                    >
                      {rt.name} - ${rt.base_price}/night
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
