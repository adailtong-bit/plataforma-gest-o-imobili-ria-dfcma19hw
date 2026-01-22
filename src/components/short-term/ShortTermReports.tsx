import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
} from 'recharts'
import useShortTermStore from '@/stores/useShortTermStore'
import useTaskStore from '@/stores/useTaskStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  format,
  subMonths,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  parseISO,
} from 'date-fns'

export function ShortTermReports() {
  const { bookings } = useShortTermStore()
  const { tasks } = useTaskStore()
  const { properties } = usePropertyStore()
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y'>('6m')

  // Filter Short Term Properties
  const shortTermProperties = properties.filter(
    (p) => p.profileType === 'short_term',
  )
  const shortTermPropIds = shortTermProperties.map((p) => p.id)

  const chartData = useMemo(() => {
    const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12
    const data = []

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const monthStart = startOfMonth(date)
      const monthEnd = endOfMonth(date)
      const monthLabel = format(date, 'MMM')

      // Revenue
      const monthlyRevenue = bookings
        .filter((b) => shortTermPropIds.includes(b.propertyId))
        .filter((b) => {
          const checkIn = parseISO(b.checkIn)
          return isWithinInterval(checkIn, { start: monthStart, end: monthEnd })
        })
        .reduce((acc, curr) => acc + curr.totalAmount, 0)

      // Expenses (Tasks)
      const monthlyExpenses = tasks
        .filter((t) => shortTermPropIds.includes(t.propertyId))
        .filter((t) => {
          const taskDate = parseISO(t.date)
          return isWithinInterval(taskDate, {
            start: monthStart,
            end: monthEnd,
          })
        })
        .reduce((acc, curr) => acc + (curr.price || 0), 0)

      // Occupancy
      // Simplified: Count nights booked starting in this month
      const nightsBooked = bookings
        .filter((b) => shortTermPropIds.includes(b.propertyId))
        .filter((b) => {
          const checkIn = parseISO(b.checkIn)
          return isWithinInterval(checkIn, { start: monthStart, end: monthEnd })
        })
        .reduce((acc, curr) => {
          const start = parseISO(curr.checkIn)
          const end = parseISO(curr.checkOut)
          const diff = Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
          )
          return acc + diff
        }, 0)

      const totalCapacity = shortTermProperties.length * 30 // Approx capacity
      const occupancyRate =
        totalCapacity > 0 ? (nightsBooked / totalCapacity) * 100 : 0

      // ADR
      const adr = nightsBooked > 0 ? monthlyRevenue / nightsBooked : 0

      data.push({
        month: monthLabel,
        revenue: monthlyRevenue,
        profit: monthlyRevenue - monthlyExpenses,
        expenses: monthlyExpenses,
        occupancy: occupancyRate,
        adr: adr,
      })
    }
    return data
  }, [bookings, tasks, timeRange, shortTermProperties])

  // Pie Chart for Booking Sources
  const sourceData = useMemo(() => {
    const sources: Record<string, number> = {}
    bookings
      .filter((b) => shortTermPropIds.includes(b.propertyId))
      .forEach((b) => {
        const source = b.platform || 'Direct'
        sources[source] = (sources[source] || 0) + 1
      })
    return Object.entries(sources).map(([name, value]) => ({ name, value }))
  }, [bookings, shortTermPropIds])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue & Profit */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Profitability</CardTitle>
            <CardDescription>
              Gross revenue vs estimated profit (Revenue - Task Costs)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: 'Revenue', color: '#2563eb' },
                profit: { label: 'Profit', color: '#16a34a' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="revenue"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
                <Bar
                  dataKey="profit"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                  name="Profit"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate (%)</CardTitle>
            <CardDescription>
              Percentage of nights booked per month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ occupancy: { label: 'Occupancy', color: '#f97316' } }}
              className="h-[300px] w-full"
            >
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Occupancy %"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* ADR */}
        <Card>
          <CardHeader>
            <CardTitle>Average Daily Rate (ADR)</CardTitle>
            <CardDescription>Average revenue per booked night</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{ adr: { label: 'ADR', color: '#8b5cf6' } }}
              className="h-[300px] w-full"
            >
              <LineChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="adr"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="ADR ($)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Booking Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Sources</CardTitle>
            <CardDescription>Distribution by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] w-full mx-auto">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
