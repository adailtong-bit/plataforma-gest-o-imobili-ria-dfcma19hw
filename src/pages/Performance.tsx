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
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'

export default function Performance() {
  const { towers } = useHotelStore()
  const { bookings, feedbacks } = useShortTermStore()
  const { properties } = usePropertyStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedTower, setSelectedTower] = useState<string>('all')

  const metrics = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return []

    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to })

    return days.map((day) => {
      const dailyBookings = bookings.filter((b) => {
        const start = new Date(b.checkIn)
        const end = new Date(b.checkOut)
        return day >= start && day < end && b.status !== 'cancelled'
      })

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
      title: t('common.export_success'),
      description: 'Performance data downloaded.',
    })
  }

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
            {t('sidebar.performance')}
          </h1>
          <p className="text-muted-foreground">
            {t('common.filter')}:{' '}
            {selectedTower === 'all'
              ? t('common.all')
              : towers.find((t) => t.id === selectedTower)?.name}
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          <Select value={selectedTower} onValueChange={setSelectedTower}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Towers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
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
          <TabsTrigger value="overview">{t('common.financial')}</TabsTrigger>
          <TabsTrigger value="reviews">Guest Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('market_analysis.avg_occupancy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <DataMask>
                    {metrics.length > 0
                      ? Math.round(
                          metrics.reduce((a, b) => a + b.occupancy, 0) /
                            metrics.length,
                        )
                      : 0}
                    %
                  </DataMask>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('market_analysis.avg_daily_rate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  <DataMask>
                    {metrics.length > 0
                      ? Math.round(
                          metrics.reduce((a, b) => a + b.adr, 0) /
                            metrics.length,
                        )
                      : 0}
                  </DataMask>
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
                  <DataMask>
                    {metrics.length > 0
                      ? Math.round(
                          metrics.reduce((a, b) => a + b.revPar, 0) /
                            metrics.length,
                        )
                      : 0}
                  </DataMask>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('common.spending_trends')}</CardTitle>
              <CardDescription>{t('common.daily_metrics')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <DataMask className="w-full h-full block">
                  <ChartContainer
                    config={{
                      occupancy: {
                        label: t('market_analysis.avg_occupancy'),
                        color: '#3b82f6',
                      },
                      adr: {
                        label: t('market_analysis.avg_daily_rate'),
                        color: '#10b981',
                      },
                      revPar: { label: 'RevPAR 

`src/pages/Condominiums.tsx`
