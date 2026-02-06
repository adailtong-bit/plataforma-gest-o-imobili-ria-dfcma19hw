import { useParams, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building, Layers } from 'lucide-react'
import useHotelStore from '@/stores/useHotelStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { RoomList } from '@/components/hotels/RoomList'
import { DataMask } from '@/components/DataMask'

export default function TowerDetails() {
  const { id, towerId } = useParams()
  const { hotels, towers } = useHotelStore()
  const { t } = useLanguageStore()

  const hotel = hotels.find((h) => h.id === id)
  const tower = towers.find((t) => t.id === towerId)

  if (!hotel || !tower) return <div>Tower not found</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link to={`/hotels/${hotel.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            <DataMask>{tower.name}</DataMask>
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/hotels" className="hover:underline">
              {t('hotels.title')}
            </Link>
            <span>/</span>
            <Link to={`/hotels/${hotel.id}`} className="hover:underline">
              <DataMask>{hotel.name}</DataMask>
            </Link>
            <span>/</span>
            <span>
              <DataMask>{tower.name}</DataMask>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t('hotels.tower_details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border">
              <Building className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold text-sm">
                  {t('common.description')}
                </p>
                <p className="text-sm text-muted-foreground">
                  <DataMask>{tower.description || '-'}</DataMask>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border">
              <Layers className="h-8 w-8 text-indigo-500" />
              <div>
                <p className="font-semibold text-sm">{t('hotels.floors')}</p>
                <p className="text-sm text-muted-foreground">{tower.floors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t('hotels.rooms')}</CardTitle>
            <CardDescription>Manage rooms for {tower.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <RoomList hotelId={hotel.id} towerId={tower.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
