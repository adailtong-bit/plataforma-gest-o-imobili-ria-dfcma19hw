import { useState, useMemo, useContext, useEffect } from 'react'
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
  Download,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart2,
  Globe,
  Building2,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip,
} from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useFinancialStore from '@/stores/useFinancialStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useTenantStore from '@/stores/useTenantStore'
import useShortTermStore from '@/stores/useShortTermStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import useOwnerStore from '@/stores/useOwnerStore'
import useHotelStore from '@/stores/useHotelStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { AppContext } from '@/stores/AppContext'
import {
  format,
  startOfMonth,
  addMonths,
  eachMonthOfInterval,
  endOfMonth,
  isWithinInterval,
  parseISO,
  subMonths,
} from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { exportToCSV, formatCurrency } from '@/lib/utils'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { Label } from '@/components/ui/label'

export function FinancialReports() {
  const { ledgerEntries } = useFinancialStore()
  const { properties } = usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { owners } = useOwnerStore()
  const { tenants } = useTenantStore()
  const { bookings } = useShortTermStore()
  const { towers } = useHotelStore()
  const { toast } = useToast()
  const { language, t } = useLanguageStore()
  const context = useContext(AppContext)

  const effectiveRole =
    context?.simulationMode && context?.simulationRole
      ? context.simulationRole
      : context?.currentUser?.role

  const effectiveUserId =
    context?.simulationMode && context?.simulationRole === 'property_owner'
      ? context.allUsers?.find((u) => u.role === 'property_owner')?.id ||
        context.currentUser?.id
      : context?.currentUser?.id

  const isOwner = effectiveRole === 'property_owner'

  // Global property selection
  const globalPropertyId = context?.selectedPropertyId || 'all'

  const [selectedPropertyId, setSelectedPropertyId] =
    useState<string>(globalPropertyId)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>(
    isOwner && effectiveUserId ? effectiveUserId : 'all',
  )
  const [selectedCondoId, setSelectedCondoId] = useState<string>('all')

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 12),
    to: new Date(),
  })

  useEffect(() => {
    setSelectedPropertyId(globalPropertyId)
  }, [globalPropertyId])

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((e) => {
      let dateValid = true
      if (dateRange?.from && dateRange?.to) {
        dateValid = isWithinInterval(new Date(e.date), {
          start: dateRange.from,
          end: dateRange.to,
        })
      } else if (dateRange?.from) {
        dateValid = new Date(e.date) >= dateRange.from
      }

      const propertyValid =
        selectedPropertyId === 'all' || e.propertyId === selectedPropertyId

      const prop = properties.find((p) => p.id === e.propertyId)
      const ownerValid =
        selectedOwnerId === 'all' || prop?.ownerId === selectedOwnerId
      const condoValid =
        selectedCondoId === 'all' || prop?.condominiumId === selectedCondoId

      return dateValid && propertyValid && ownerValid && condoValid
    })
  }, [
    ledgerEntries,
    dateRange,
    selectedPropertyId,
    selectedOwnerId,
    selectedCondoId,
    properties,
  ])

  // --- Breakdown by Category (Room, F&B, Services) ---
  const revenueByCategory = useMemo(() => {
    const data = {
      [t('common.room') || 'Room']: 0,
      [t('common.fb') || 'F&B']: 0,
      [t('common.services') || 'Services']: 0,
    }
    filteredEntries.forEach((e) => {
      if (e.type === 'income') {
        const cat = e.category as keyof typeof data
        if (data[cat] !== undefined) {
          data[cat] += e.amount
        }
      }
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredEntries, t])

  // --- Breakdown by Tower ---
  const revenueByTower = useMemo(() => {
    const data: Record<string, number> = {}
    towers.forEach((tw) => (data[tw.name] = 0))
    const otherLabel = t('common.other') || 'Other'
    data[otherLabel] = 0

    filteredEntries.forEach((e) => {
      if (e.type === 'income') {
        const prop = properties.find((p) => p.id === e.propertyId)
        if (prop && prop.towerId) {
          const tower = towers.find((tw) => tw.id === prop.towerId)
          if (tower) {
            data[tower.name] = (data[tower.name] || 0) + e.amount
          } else {
            data[otherLabel] += e.amount
          }
        } else {
          data[otherLabel] += e.amount
        }
      }
    })

    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
  }, [filteredEntries, properties, towers, t])

  const projectedCashFlow = useMemo(() => {
    const months = eachMonthOfInterval({
      start: startOfMonth(new Date()),
      end: endOfMonth(addMonths(new Date(), 5)),
    })

    return months.map((month) => {
      const monthLabel = format(month, 'MMM yyyy')
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)

      const ltrIncome = tenants.reduce((acc, t) => {
        if (
          t.status === 'active' &&
          (selectedPropertyId === 'all' ||
            t.propertyId === selectedPropertyId) &&
          t.leaseEnd &&
          new Date(t.leaseEnd) >= monthStart
        ) {
          const leaseStart = t.leaseStart ? new Date(t.leaseStart) : new Date(0)
          if (leaseStart <= monthEnd) {
            return acc + (t.rentValue || 0)
          }
        }
        return acc
      }, 0)

      const strIncome = bookings.reduce((acc, b) => {
        if (
          b.status !== 'cancelled' &&
          (selectedPropertyId === 'all' || b.propertyId === selectedPropertyId)
        ) {
          const checkIn = parseISO(b.checkIn)
          if (isWithinInterval(checkIn, { start: monthStart, end: monthEnd })) {
            return acc + (b.totalAmount || 0)
          }
        }
        return acc
      }, 0)

      const fixedExpenses = properties.reduce((acc, p) => {
        if (selectedPropertyId !== 'all' && p.id !== selectedPropertyId)
          return acc
        const expenseSum = (p.fixedExpenses || []).reduce(
          (eAcc, fe) => eAcc + (fe.amount || 0),
          0,
        )
        const hoa = p.hoaValue && p.hoaFrequency === 'monthly' ? p.hoaValue : 0
        return acc + expenseSum + hoa
      }, 0)

      const totalProjectedIncome = ltrIncome + strIncome
      const estimatedMaintenance = totalProjectedIncome * 0.1

      return {
        month: monthLabel,
        income: totalProjectedIncome,
        expenses: fixedExpenses + estimatedMaintenance,
        netCashFlow:
          totalProjectedIncome - (fixedExpenses + estimatedMaintenance),
      }
    })
  }, [tenants, bookings, properties, selectedPropertyId])

  // --- Channel Analytics (Simulated Traffic Data) ---
  const channelData = useMemo(() => {
    return [
      { month: 'Jan', airbnb: 4000, booking: 2400, vrbo: 2400, direct: 1000 },
      { month: 'Feb', airbnb: 3000, booking: 1398, vrbo: 2210, direct: 1200 },
      { month: 'Mar', airbnb: 2000, booking: 9800, vrbo: 2290, direct: 1100 },
      { month: 'Apr', airbnb: 2780, booking: 3908, vrbo: 2000, direct: 1500 },
      { month: 'May', airbnb: 1890, booking: 4800, vrbo: 2181, direct: 1700 },
      { month: 'Jun', airbnb: 2390, booking: 3800, vrbo: 2500, direct: 2000 },
    ]
  }, [])

  const handleExport = () => {
    const headers = [
      t('common.date') || 'Date',
      t('common.property') || 'Property',
      t('common.type') || 'Type',
      t('common.category') || 'Category',
      t('common.description') || 'Description',
      t('common.value') || 'Value',
      t('common.status') || 'Status',
    ]
    const rows = filteredEntries.map((entry) => {
      const property = properties.find((p) => p.id === entry.propertyId)
      return [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        property?.name || t('common.unknown') || 'Unknown',
        entry.type === 'income'
          ? t('financial.income') || 'Income'
          : t('financial.expense') || 'Expense',
        entry.category,
        `"${entry.description.replace(/"/g, '""')}"`,
        entry.amount.toFixed(2),
        entry.status === 'cleared'
          ? t('common.paid') || 'Paid'
          : t('common.pending') || 'Pending',
      ]
    })
    exportToCSV('financial_report', headers, rows)
    toast({
      title: t('common.export_success_title') || 'Success',
      description: t('common.export_success') || 'Data exported successfully.',
    })
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t('common.date') || 'Date'}
              </Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t('common.property') || 'Property'}
              </Label>
              <Select
                value={selectedPropertyId}
                onValueChange={setSelectedPropertyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.all') || 'All'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('common.all') || 'All'}
                  </SelectItem>
                  {properties.map((p) => {
                    if (isOwner && p.ownerId !== effectiveUserId) return null
                    return (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {!isOwner && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t('sidebar.owners') || 'Owners'}
                </Label>
                <Select
                  value={selectedOwnerId}
                  onValueChange={setSelectedOwnerId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('financial.all_owners') || 'All Owners'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t('financial.all_owners') || 'All Owners'}
                    </SelectItem>
                    {owners.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t('sidebar.condominiums') || 'Condominiums'}
              </Label>
              <Select
                value={selectedCondoId}
                onValueChange={setSelectedCondoId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      t('financial.all_condos') || 'All Condominiums'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('financial.all_condos') || 'All Condominiums'}
                  </SelectItem>
                  {condominiums.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />{' '}
                {t('common.export_data') || 'Export Data'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart2 className="h-4 w-4 mr-2" />{' '}
            {t('financial.overview_pnl') || 'Overview & P&L'}
          </TabsTrigger>
          <TabsTrigger value="towers">
            <Building2 className="h-4 w-4 mr-2" />{' '}
            {t('financial.tower_breakdown') || 'Tower Breakdown'}
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Globe className="h-4 w-4 mr-2" />{' '}
            {t('financial.channel_analytics') || 'Channel Analytics'}
          </TabsTrigger>
          <TabsTrigger value="projection">
            <TrendingUp className="h-4 w-4 mr-2" />{' '}
            {t('financial.projected_cash_flow') || 'Projected Cash Flow'}
          </TabsTrigger>
          <TabsTrigger value="category">
            <PieChartIcon className="h-4 w-4 mr-2" />{' '}
            {t('financial.profitability_by_category') ||
              'Profitability by Category'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('common.total_revenue') || 'Total Revenue'}
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(
                    filteredEntries
                      .filter((e) => e.type === 'income')
                      .reduce((acc, curr) => acc + curr.amount, 0),
                    language,
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('financial.total_expenses') || 'Total Expenses'}
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(
                    filteredEntries
                      .filter((e) => e.type === 'expense')
                      .reduce((acc, curr) => acc + curr.amount, 0),
                    language,
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">
                  {t('financial.net_income') || 'Net Income'}
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(
                    filteredEntries
                      .filter((e) => e.type === 'income')
                      .reduce((acc, curr) => acc + curr.amount, 0) -
                      filteredEntries
                        .filter((e) => e.type === 'expense')
                        .reduce((acc, curr) => acc + curr.amount, 0),
                    language,
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="towers">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.tower_breakdown') || 'Tower Breakdown'}
              </CardTitle>
              <CardDescription>
                {t('financial.tower_breakdown_desc') ||
                  'Financial performance divided by building towers.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{
                    revenue: {
                      label: t('common.revenue') || 'Revenue',
                      color: '#8884d8',
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart
                    data={revenueByTower}
                    layout="vertical"
                    margin={{ left: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      fill="#8884d8"
                      radius={[0, 4, 4, 0]}
                      name={t('common.revenue') || 'Revenue'}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.channel_analytics') ||
                  'Channel Analytics (Traffic and Performance)'}
              </CardTitle>
              <CardDescription>
                {t('financial.channel_analytics_desc') ||
                  'Simulated external OTA traffic and conversion data.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    airbnb: { label: 'Airbnb', color: '#ff5a5f' },
                    booking: { label: 'Booking.com', color: '#003580' },
                    vrbo: { label: 'VRBO', color: '#00619b' },
                    direct: {
                      label: t('common.direct') || 'Direct',
                      color: '#10b981',
                    },
                  }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={channelData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="airbnb"
                        stroke="#ff5a5f"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="booking"
                        stroke="#003580"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="vrbo"
                        stroke="#00619b"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="direct"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.revenue_by_category') || 'Revenue by Category'}
              </CardTitle>
              <CardDescription>
                {t('financial.revenue_by_category_desc') ||
                  'Distribution across Room, F&B, and Services.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{
                    value: {
                      label: t('common.value') || 'Value',
                      color: '#82ca9d',
                    },
                  }}
                  className="h-full w-full"
                >
                  <PieChart>
                    <Pie
                      data={revenueByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#82ca9d"
                      label
                    >
                      {revenueByCategory.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projection">
          <Card>
            <CardHeader>
              <CardTitle>
                {t('financial.projected_cash_flow') || 'Projected Cash Flow'} (6{' '}
                {t('common.months') || 'Months'})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    income: {
                      label: t('common.revenue') || 'Revenue',
                      color: '#22c55e',
                    },
                    expenses: {
                      label: t('financial.total_expenses') || 'Expenses',
                      color: '#ef4444',
                    },
                  }}
                  className="h-full w-full"
                >
                  <BarChart data={projectedCashFlow}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="income"
                      fill="#22c55e"
                      name={t('common.revenue') || 'Revenue'}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      fill="#ef4444"
                      name={t('financial.total_expenses') || 'Expenses'}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
