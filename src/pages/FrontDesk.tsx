import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FrontDeskGrid } from '@/components/front-desk/FrontDeskGrid'
import useHotelStore from '@/stores/useHotelStore'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'

export default function FrontDesk() {
  const { currentUser } = useAuthStore()
  const { toast } = useToast()
  const { hotels, towers } = useHotelStore()
  const [selectedHotel, setSelectedHotel] = useState<string>('all')
  const [selectedTower, setSelectedTower] = useState<string>('all')
  const [selectedFloor, setSelectedFloor] = useState<string>('all')
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const [properties, setProperties] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  const canApprove = ['master', 'platform_owner', 'manager'].includes(
    currentUser?.role || '',
  )
  const pendingApprovals = bookings.filter(
    (b: any) =>
      b.approval_status === 'pending' || b.status === 'pending_approval',
  )

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

  const handleApproval = async (bookingId: string, approved: boolean) => {
    try {
      const status = approved ? 'confirmed' : 'cancelled'
      const approvalStatus = approved ? 'approved' : 'rejected'

      const { error } = await supabase
        .from('bookings')
        .update({
          status,
          approval_status: approvalStatus,
        } as any)
        .eq('id', bookingId)

      if (error) throw error

      toast({
        title: approved ? 'Reserva Aprovada' : 'Reserva Rejeitada',
        description: `A reserva foi ${approved ? 'aprovada' : 'rejeitada'} com sucesso.`,
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

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

      {canApprove && pendingApprovals.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-slate-800">
            Aprovações Pendentes de Desconto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingApprovals.map((booking: any) => {
              const property = properties.find(
                (p) => p.id === booking.property_id,
              )
              return (
                <Card key={booking.id} className="border-amber-200 bg-amber-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span>{property?.room_number || property?.name}</span>
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                      >
                        Pendente
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>
                      <strong>Hóspede:</strong> {booking.guests?.name}
                    </div>
                    <div>
                      <strong>Período:</strong>{' '}
                      {format(new Date(booking.check_in), 'dd/MM/yyyy')} -{' '}
                      {format(new Date(booking.check_out), 'dd/MM/yyyy')}
                    </div>
                    <div className="bg-white p-2 rounded border mt-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Valor Base:</span>
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(booking.base_amount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-red-600 font-medium">
                        <span>Desconto Solicitado:</span>
                        <span>
                          -
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(booking.discount_amount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t mt-1">
                        <span>Total:</span>
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(booking.total_amount || 0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleApproval(booking.id, false)}
                      >
                        <XCircle className="w-4 h-4 mr-1" /> Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproval(booking.id, true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Aprovar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <FrontDeskGrid
        properties={filteredProperties}
        bookings={bookings}
        startDate={new Date(startDate)}
        onRefresh={fetchData}
      />
    </div>
  )
}
