import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import useHotelStore from '@/stores/useHotelStore'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Download, Star } from 'lucide-react'
import { exportToCSV } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default function Performance() {
  const { towers } = useHotelStore()
  const { bookings, feedbacks } = useShortTermStore()
  const { properties } = usePropertyStore()
  const { toast } = useToast()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedTower, setSelectedTower] = useState<string>('all')

  // Calculate Metrics
  const metrics = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []

    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

    return days.map((day) => {
      // Filter bookings active on this day
      const dailyBookings = bookings.filter((b) => {
        const start = new Date(b.checkIn)
        const end = new Date(b.checkOut)
        return day >= start && day < end && b.status !== 'cancelled'
      })

      // Filter rooms based on tower selection
      const totalRooms = properties.filter((p) => {
        if (p.profileType !== 'short_term') return false
        if (selectedTower === 'all') return true
        return p.towerId === selectedTower
      }).length

      const occupiedRooms = dailyBookings.filter((b) => {
        const property = properties.find((p) => p.id === b.propertyId)
        if (!property) return false
        if (selectedTower === 'all') return true
        return property.towerId === selectedTower
      }).length

      const dailyRevenue = dailyBookings.reduce((acc, b) => {
        const property = properties.find((p) => p.id === b.propertyId)
        if (!property) return acc
        if (selectedTower !== 'all' && property.towerId !== selectedTower)
          return acc

        // Simplified daily rate extraction
        const nights = Math.max(
          1,
          (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) /
            (1000 * 60 * 60 * 24),
        )
        return acc + b.totalAmount / nights
      }, 0)

      const occupancy = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0
      const adr = occupiedRooms > 0 ? dailyRevenue / occupiedRooms : 0
      const revPar = totalRooms > 0 ? dailyRevenue / totalRooms : 0

      return {
        date: format(day, 'MMM dd'),
        occupancy: Math.round(occupancy),
        adr: Math.round(adr),
        revPar: Math.round(revPar),
        revenue: Math.round(dailyRevenue),
      }
    })
  }, [dateRange, bookings, properties, selectedTower])

  const handleExport = () => {
    const headers = [
      'Date',
      'Occupancy (%)',
      'ADR ($)',
      'RevPAR ($)',
      'Revenue ($)',
    ]
    const rows = metrics.map((m) => [
      m.date,
      m.occupancy,
      m.adr,
      m.revPar,
      m.revenue,
    ])
    exportToCSV('performance_report', headers, rows)
    toast({
      title: 'Export Successful',
      description: 'Performance data downloaded.',
    })
  }

  // Reviews Calc
  const reviews = feedbacks.filter((f) => {
    const prop = properties.find((p) => p.id === f.propertyId)
    if (!prop) return false
    if (selectedTower !== 'all' && prop.towerId !== selectedTower) return false
    return true
  })

  const avgRating = reviews.length
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Performance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time metrics for RevPAR, ADR, and Occupancy.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Select value={selectedTower} onValueChange={setSelectedTower}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Towers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Towers</SelectItem>
              {towers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Financials</TabsTrigger>
          <TabsTrigger value="reviews">Guest Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.length > 0
                    ? Math.round(
                        metrics.reduce((a, b) => a + b.occupancy, 0) /
                          metrics.length,
                      )
                    : 0}
                  %
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg ADR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {metrics.length > 0
                    ? Math.round(
                        metrics.reduce((a, b) => a + b.adr, 0) / metrics.length,
                      )
                    : 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg RevPAR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {metrics.length > 0
                    ? Math.round(
                        metrics.reduce((a, b) => a + b.revPar, 0) /
                          metrics.length,
                      )
                    : 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Daily metrics over selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    occupancy: { label: 'Occupancy %', color: '#3b82f6' },
                    adr: { label: 'ADR $', color: '#10b981' },
                    revPar: { label: 'RevPAR $', color: '#f59e0b' },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" unit="%" />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="occupancy"
                        stroke="#3b82f6"
                        name="Occupancy %"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="adr"
                        stroke="#10b981"
                        name="ADR $"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revPar"
                        stroke="#f59e0b"
                        name="RevPAR $"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="bg-yellow-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <div className="text-4xl font-bold text-yellow-600">
                  {avgRating.toFixed(1)}
                </div>
                <div className="flex flex-col">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          avgRating >= star
                            ? 'fill-yellow-500 text-yellow-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Based on {reviews.length} reviews
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4">
            {reviews.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
                No reviews yet.
              </div>
            ) : (
              reviews.map((rev) => (
                <Card key={rev.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{rev.guestName}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  rev.rating >= star
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(rev.date), 'PP')}
                        </span>
                      </div>
                      <Badge variant="outline">{rev.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{rev.comment}</p>
                    {rev.response && (
                      <div className="mt-3 bg-slate-50 p-2 rounded text-sm text-slate-600 border-l-2 border-blue-500">
                        <span className="font-semibold">Response:</span>{' '}
                        {rev.response}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
