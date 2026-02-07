import { useParams, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Building,
  Layers,
  Home,
  Users,
  Wrench,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import useHotelStore from '@/stores/useHotelStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { RoomList } from '@/components/hotels/RoomList'
import { DataMask } from '@/components/DataMask'
import { Badge } from '@/components/ui/badge'

export default function TowerDetails() {
  const { id, towerId } = useParams()
  const { hotels, towers } = useHotelStore()
  const { properties } = usePropertyStore()
  const { t } = useLanguageStore()

  const hotel = hotels.find((h) => h.id === id)
  const tower = towers.find((t) => t.id === towerId)

  if (!hotel || !tower) return <div>Tower not found</div>

  // Calculate Stats for Header
  const towerRooms = properties.filter((p) => p.towerId === towerId)
  const totalRooms = towerRooms.length
  const occupiedRooms = towerRooms.filter((r) => r.status === 'occupied').length
  const maintenanceRooms = towerRooms.filter(
    (r) => r.status === 'maintenance',
  ).length
  const cleaningRooms = towerRooms.filter((r) => r.status === 'cleaning').length
  const availableRooms = towerRooms.filter(
    (r) => r.status === 'available',
  ).length
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <Link to={`/hotels/${hotel.id}`}>
          <Button variant="ghost" size="icon" className="hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <DataMask>{tower.name}</DataMask>
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/hotels" className="hover:underline hover:text-slate-700">
              {t('hotels.title')}
            </Link>
            <span>/</span>
            <Link
              to={`/hotels/${hotel.id}`}
              className="hover:underline hover:text-slate-700"
            >
              <DataMask>{hotel.name}</DataMask>
            </Link>
            <span>/</span>
            <span className="text-slate-900">
              <DataMask>{tower.name}</DataMask>
            </span>
          </div>
        </div>
      </div>

      {/* Tower Information Header - Top Section */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
            {/* Tower Details */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Tower Overview
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    <DataMask>
                      {tower.description || 'Tower details and configuration.'}
                    </DataMask>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-2 pl-11">
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border-slate-200"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span className="font-semibold">{tower.floors}</span>{' '}
                  {t('hotels.floors')}
                </Badge>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1.5 px-3 py-1 border-slate-300 text-slate-700"
                >
                  <Home className="h-3.5 w-3.5" />
                  <span className="font-semibold">{totalRooms}</span> Total
                  Rooms
                </Badge>
              </div>
            </div>

            {/* Quick Stats Dashboard */}
            <div className="flex flex-wrap gap-4 w-full lg:w-auto justify-start lg:justify-end">
              <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg min-w-[110px] shadow-sm">
                <div className="flex items-center gap-1 text-slate-500 mb-1">
                  <Users className="h-3 w-3" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Occupancy
                  </span>
                </div>
                <span className="text-2xl font-bold text-slate-900">
                  {occupancyRate}%
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-green-50/50 border border-green-100 rounded-lg min-w-[110px] shadow-sm">
                <div className="flex items-center gap-1 text-green-600 mb-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Available
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-700">
                  {availableRooms}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-red-50/50 border border-red-100 rounded-lg min-w-[110px] shadow-sm">
                <div className="flex items-center gap-1 text-red-600 mb-1">
                  <Wrench className="h-3 w-3" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Service
                  </span>
                </div>
                <span className="text-2xl font-bold text-red-700">
                  {maintenanceRooms + cleaningRooms}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Room List View - Full Width */}
      <Card className="flex-1 border-slate-200 shadow-sm bg-white flex flex-col">
        <CardHeader className="pb-4 border-b">
          <CardTitle>{t('hotels.rooms')}</CardTitle>
          <CardDescription>
            Manage and view all rooms associated with {tower.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <RoomList hotelId={hotel.id} towerId={tower.id} />
        </CardContent>
      </Card>
    </div>
  )
}
