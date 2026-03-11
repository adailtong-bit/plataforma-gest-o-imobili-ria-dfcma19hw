import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AppContext } from '@/stores/AppContext'
import { RoomList } from '@/components/hotels/RoomList'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

export default function TowerDetails() {
  const { id: hotelId, towerId } = useParams()
  const navigate = useNavigate()
  const { hotels, towers } = useContext(AppContext)!

  const hotel = hotels.find((h) => h.id === hotelId)
  const tower = towers.find((t) => t.id === towerId)

  if (!hotel || !tower) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Tower Not Found</h2>
        <Button onClick={() => navigate(`/hotels/${hotelId}`)}>
          Back to Hotel
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto">
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
            Manage rooms specifically for this tower.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RoomList hotelId={hotel.id} towerId={tower.id} />
        </CardContent>
      </Card>
    </div>
  )
}
