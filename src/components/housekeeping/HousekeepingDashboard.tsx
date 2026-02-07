import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import usePropertyStore from '@/stores/usePropertyStore'
import useHotelStore from '@/stores/useHotelStore'
import { Property, PropertyStatus } from '@/lib/types'
import { Check, Clock, Wrench, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DataMask } from '@/components/DataMask'
import { useToast } from '@/hooks/use-toast'

export function HousekeepingDashboard() {
  const { properties, updateProperty } = usePropertyStore()
  const { hotels } = useHotelStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filterHotel, setFilterHotel] = useState('all')

  const housekeepingStatuses: PropertyStatus[] = [
    'cleaning',
    'maintenance',
    'occupied',
    'available',
  ]

  const relevantProperties = properties.filter(
    (p) =>
      p.profileType === 'short_term' && housekeepingStatuses.includes(p.status),
  )

  const filteredProperties = relevantProperties.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.roomNumber?.toLowerCase().includes(search.toLowerCase())
    const matchesHotel = filterHotel === 'all' || p.hotelId === filterHotel
    return matchesSearch && matchesHotel
  })

  const tasksByStatus = {
    cleaning: filteredProperties.filter((p) => p.status === 'cleaning'),
    maintenance: filteredProperties.filter((p) => p.status === 'maintenance'),
    ready: filteredProperties.filter((p) => p.status === 'available'),
  }

  const handleStatusChange = (room: Property, status: PropertyStatus) => {
    updateProperty({ ...room, status })
    toast({
      title: 'Status Updated',
      description: `${room.name} is now ${status}.`,
    })
  }

  const RoomCard = ({ room }: { room: Property }) => (
    <Card className="mb-4 shadow-sm border-l-4 border-l-primary">
      <CardHeader className="p-4 pb-2 flex flex-row justify-between items-start space-y-0">
        <div>
          <CardTitle className="text-lg">
            <DataMask>{room.roomNumber}</DataMask>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            <DataMask>{room.name}</DataMask>
          </p>
        </div>
        <Badge
          className={
            room.status === 'cleaning'
              ? 'bg-blue-100 text-blue-800'
              : room.status === 'maintenance'
                ? 'bg-red-100 text-red-800'
                : 'bg-green-100 text-green-800'
          }
        >
          {room.status}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm">
        <p className="text-muted-foreground">
          Type: {room.roomCharacteristics?.bedType || 'Standard'}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        {room.status === 'cleaning' && (
          <Button
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleStatusChange(room, 'available')}
          >
            <Check className="mr-2 h-4 w-4" /> Mark Ready
          </Button>
        )}
        {room.status === 'available' && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-blue-600 border-blue-200"
            onClick={() => handleStatusChange(room, 'cleaning')}
          >
            <Clock className="mr-2 h-4 w-4" /> Start Cleaning
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="px-2 text-red-600"
          onClick={() => handleStatusChange(room, 'maintenance')}
        >
          <Wrench className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Housekeeping
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search room..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterHotel} onValueChange={setFilterHotel}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select Hotel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hotels</SelectItem>
              {hotels.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="cleaning" className="flex-1">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger
            value="cleaning"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
          >
            Cleaning ({tasksByStatus.cleaning.length})
          </TabsTrigger>
          <TabsTrigger
            value="ready"
            className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
          >
            Ready ({tasksByStatus.ready.length})
          </TabsTrigger>
          <TabsTrigger
            value="maintenance"
            className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700"
          >
            Maintenance ({tasksByStatus.maintenance.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cleaning" className="space-y-4">
          {tasksByStatus.cleaning.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No rooms pending cleaning.
            </p>
          )}
          {tasksByStatus.cleaning.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          {tasksByStatus.ready.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No ready rooms found.
            </p>
          )}
          {tasksByStatus.ready.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          {tasksByStatus.maintenance.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No rooms in maintenance.
            </p>
          )}
          {tasksByStatus.maintenance.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
