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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import useHotelStore from '@/stores/useHotelStore'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function Performance() {
  const { towers } = useHotelStore()
  const { bookings } = useShortTermStore()
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
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
            <CardTitle className="text-sm font-medium">Avg RevPAR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {metrics.length > 0
                ? Math.round(
                    metrics.reduce((a, b) => a + b.revPar, 0) / metrics.length,
                  )
                : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Daily metrics over selected period</CardDescription>
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
    </div>
  )
}
