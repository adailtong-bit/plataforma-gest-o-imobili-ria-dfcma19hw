import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { RoomList } from '@/components/hotels/RoomList'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'

export default function TowerDetails() {
  const { id: hotelId, towerId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [hotel, setHotel] = useState<any>(null)
  const [tower, setTower] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!hotelId || !towerId) {
        setLoading(false)
        return
      }

      const [hotelRes, towerRes] = await Promise.all([
        supabase.from('hotels').select('*').eq('id', hotelId).single(),
        supabase.from('towers').select('*').eq('id', towerId).single(),
      ])

      if (hotelRes.data) setHotel(hotelRes.data)
      if (towerRes.data) setTower(towerRes.data)

      setLoading(false)
    }

    loadData()
  }, [hotelId, towerId])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  if (!hotel || !tower) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">
          Tower Not Found
        </h2>
        <p className="text-slate-500 mb-6">
          Could not locate the requested tower or wing.
        </p>
        <Button onClick={() => navigate(`/hotels/${hotelId}`)}>
          Back to Hotel
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/hotels/${hotelId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {tower.name}
          </h1>
          <p className="text-sm text-slate-500">{hotel.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rooms in {tower.name}</CardTitle>
          <CardDescription>
            Manage rooms specifically for this tower. You can link rooms to
            pricing categories below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomList hotelId={hotel.id} towerId={tower.id} />
        </CardContent>
      </Card>
    </div>
  )
}
