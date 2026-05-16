import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FrontDeskGrid } from '@/components/front-desk/FrontDeskGrid'
import useHotelStore from '@/stores/useHotelStore'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

export default function FrontDesk() {
  const { hotels, towers } = useHotelStore()
  const [selectedHotel, setSelectedHotel] = useState<string>('all')
  const [selectedTower, setSelectedTower] = useState<string>('all')
  const [selectedFloor, setSelectedFloor] = useState<string>('all')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [allProps, bookRes] = await Promise.all([
      supabase.from('properties').select('*'),
      supabase.from('bookings').select('*, guests(*)'),
    ])
    if (allProps.data) setProperties(allProps.data)
    if (bookRes.data) setBookings(bookRes.data)
  }

  const filteredTowers = towers.filter(
    (t) => selectedHotel === 'all' || t.hotel_id === selectedHotel,
  )
  const availableFloors = Array.from(
    new Set(
      properties
        .filter(
          (p) =>
            (selectedHotel === 'all' || p.hotel_id === selectedHotel) &&
            (selectedTower === 'all' || p.tower_id === selectedTower),
        )
        .map((p) => p.floor)
        .filter(Boolean),
    ),
  ) as string[]

  const filteredProperties = properties
    .filter((p) => {
      if (selectedHotel !== 'all' && p.hotel_id !== selectedHotel) return false
      if (selectedTower !== 'all' && p.tower_id !== selectedTower) return false
      if (selectedFloor !== 'all' && p.floor !== selectedFloor) return false
      return true
    })
    .sort((a, b) => (a.room_number || '').localeCompare(b.room_number || ''))

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Gestão de Reservas (Front Desk)
        </h1>
        <p className="text-muted-foreground">
          Controle de disponibilidade, ocupação e cadastro de hóspedes.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 flex gap-4 flex-wrap items-end">
          <div className="grid gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-600">
              Hotel
            </label>
            <Select value={selectedHotel} onValueChange={setSelectedHotel}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Hotéis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Hotéis</SelectItem>
                {hotels.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 flex-1 min-w-[200px]">
            <label className="text-xs font-semibold text-slate-600">
              Torre
            </label>
            <Select value={selectedTower} onValueChange={setSelectedTower}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as Torres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Torres</SelectItem>
                {filteredTowers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-semibold text-slate-600">
              Andar
            </label>
            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os Andares" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Andares</SelectItem>
                {availableFloors.map((f) => (
                  <SelectItem key={f} value={f}>
                    Andar {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5 flex-1 min-w-[150px]">
            <label className="text-xs font-semibold text-slate-600">
              Data Inicial
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <FrontDeskGrid
        properties={filteredProperties}
        bookings={bookings}
        startDate={new Date(startDate)}
        onRefresh={fetchData}
      />
    </div>
  )
}
