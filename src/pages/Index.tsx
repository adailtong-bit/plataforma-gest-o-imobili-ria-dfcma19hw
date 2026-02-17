import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Activity,
  DollarSign,
  Settings2,
  Trophy,
  Building,
  TrendingUp,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { useState, useContext } from 'react'
import { Button } from '@/components/ui/button'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  Cell,
  Pie,
  PieChart,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import useTaskStore from '@/stores/useTaskStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useVisitStore from '@/stores/useVisitStore'
import useShortTermStore from '@/stores/useShortTermStore'
import { AppContext } from '@/stores/AppContext'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import { DataMask } from '@/components/DataMask'

export default function Index() {
  return <DashboardContent />
}

function DashboardContent() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { tasks } = useTaskStore()
  const { ledgerEntries, financials } = useFinancialStore()
  const { properties } = usePropertyStore()
  const { visits } = useVisitStore()
  const { bookings } = useShortTermStore()
  const { t, language } = useLanguageStore()
  const context = useContext(AppContext)
  const selectedPropertyId = context?.selectedPropertyId || 'all'

  // Dashboard Widget State
  const [widgets, setWidgets] = useState({
    kpi: true,
    revenueChart: true,
    calendar: true,
    pending: true,
    expenseChart: true,
    health: true,
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filter Data based on selectedPropertyId
  const filteredEntries = ledgerEntries.filter((e) =>
    selectedPropertyId === 'all' ? true : e.propertyId === selectedPropertyId,
  )

  const filteredTasks = tasks.filter((t) =>
    selectedPropertyId === 'all' ? true : t.propertyId === selectedPropertyId,
  )

  // Calculate real metrics from ledger
  const totalRevenue = filteredEntries
    .filter((e) => e.type === 'income')
    .reduce((acc, curr) => acc + curr.value || curr.amount, 0)

  // Chart Data preparation
  const locale =
    language === 'es' ? 'es-ES' : language === 'pt' ? 'pt-BR' : 'en-US'

  const chartData = filteredEntries.reduce(
    (acc, entry) => {
      const month = new Date(entry.date).toLocaleString(locale, {
        month: 'short',
      })
      const existing = acc.find((d) => d.month === month)
      if (existing) {
        existing.value += entry.amount
      } else {
        acc.push({ month, value: entry.amount })
      }
      return acc
    },
    [] as { month: string; value: number }[],
  )

  const revenueData =
    chartData.length > 0 ? chartData : financials.revenue || []

  const chartConfig = {
    maintenance: {
      label: t('common.maintenance'),
      color: 'hsl(var(--chart-1))',
    },
    cleaning: {
      label: t('common.cleaning'),
      color: 'hsl(var(--chart-2))',
    },
    taxes: {
      label: t('common.taxes'),
      color: 'hsl(var(--chart-3))',
    },
    utilities: {
      label: t('common.utilities'),
      color: 'hsl(var(--chart-4))',
    },
  }

  // Real Estate Specific Metrics
  const totalProperties = properties.length
  const activeListings = properties.filter(
    (p) => p.status === 'available',
  ).length
  const pendingVisits = visits.filter((v) => v.status === 'scheduled').length

  // Hotel Specific Metrics
  const totalRooms = properties.filter(
    (p) => p.profileType === 'short_term',
  ).length
  const occupiedRooms = properties.filter(
    (p) => p.profileType === 'short_term' && p.status === 'occupied',
  ).length
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  // Calculate ADR (Average Daily Rate) and RevPAR
  const confirmedBookings = bookings.filter((b) => b.status !== 'cancelled')
  const totalBookingRevenue = confirmedBookings.reduce(
    (acc, b) => acc + b.totalAmount,
    0,
  )
  const totalNights = confirmedBookings.reduce((acc, b) => {
    const nights =
      (new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) /
      (1000 * 60 * 60 * 24)
    return acc + Math.max(1, nights)
  }, 0)

  const adr = totalNights > 0 ? totalBookingRevenue / totalNights : 0
  const revPar = totalRooms > 0 ? totalBookingRevenue / (totalRooms * 30) : 0 // Rough monthly estimate

  // Gamification: Calculate Global Health Score
  const relevantProperties =
    selectedPropertyId === 'all'
      ? properties
      : properties.filter((p) => p.id === selectedPropertyId)

  const avgHealthScore =
    relevantProperties.reduce((acc, p) => acc + (p.healthScore || 80), 0) /
    (relevantProperties.length || 1)

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {t('common.real_estate_dashboard')}
          </h1>
          <p className="text-black font-medium">{t('dashboard.subtitle')}</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-slate-300 text-black font-bold"
            >
              <Settings2 className="h-4 w-4" /> {t('dashboard.customize')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dashboard.customize_view')}</DialogTitle>
              <DialogDescription>
                {t('dashboard.customize_desc')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kpi"
                  checked={widgets.kpi}
                  onCheckedChange={() => toggleWidget('kpi')}
                />
                <Label htmlFor="kpi">{t('dashboard.kpi_indicators')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="health"
                  checked={widgets.health}
                  onCheckedChange={() => toggleWidget('health')}
                />
                <Label htmlFor="health">{t('gamification.health_score')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="revenueChart"
                  checked={widgets.revenueChart}
                  onCheckedChange={() => toggleWidget('revenueChart')}
                />
                <Label htmlFor="revenueChart">
                  {t('dashboard.revenue_chart')}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>
                {t('common.done')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Real Estate KPI Cards */}
      {widgets.kpi && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-black">
                {t('common.total_revenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                {formatCurrency(totalRevenue, language)}
              </div>
              <p className="text-xs text-black font-bold">
                +20.1% {t('dashboard.from_last_month')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-black">
                {t('common.analytics.occupancy')}
              </CardTitle>
              <Building className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                <DataMask>{occupancyRate}%</DataMask>
              </div>
              <p className="text-xs text-black font-bold">
                {occupiedRooms} / {totalRooms} {t('hotels.rooms')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-black">
                {t('common.analytics.adr')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                <DataMask>{formatCurrency(adr, language)}</DataMask>
              </div>
              <p className="text-xs text-black font-bold">
                {t('market_analysis.avg_daily_rate')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-black">
                RevPAR
              </CardTitle>
              <Activity className="h-4 w-4 text-black" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">
                <DataMask>{formatCurrency(revPar, language)}</DataMask>
              </div>
              <p className="text-xs text-black font-bold">
                {t('performance.financial_performance')}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gamification Widget */}
      {widgets.health && (
        <Card className="bg-white text-black animate-in fade-in zoom-in-95 duration-500 shadow-md border-2 border-trust-blue">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-black font-bold">
              <Trophy className="h-6 w-6 text-yellow-600" />
              {t('gamification.portfolio_health')}
            </CardTitle>
            <CardDescription className="text-black font-medium">
              {t('gamification.desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-black">
                <DataMask>{avgHealthScore.toFixed(0)}</DataMask>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs text-black font-bold">
                  <span>
                    {t('gamification.level')}: {t('gamification.expert')}
                  </span>
                  <span>{t('gamification.target')}: 100</span>
                </div>
                <Progress value={avgHealthScore} className="h-3 bg-slate-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        {widgets.revenueChart && (
          <Card
            className={`${widgets.calendar ? 'col-span-4' : 'col-span-7'} animate-in fade-in zoom-in-95 duration-500 border-slate-200 shadow-sm bg-white`}
          >
            <CardHeader>
              <CardTitle className="text-black">
                {t('dashboard.revenue_vs_expenses')}
              </CardTitle>
              <CardDescription className="text-black font-medium">
                {t('dashboard.revenue_overview')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <DataMask className="w-full h-[300px] block">
                <ChartContainer
                  config={{
                    revenue: {
                      label: t('common.total'),
                      color: 'hsl(var(--primary))',
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={revenueData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tick={{ fill: 'black', fontSize: 12, fontWeight: 'bold' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      fill="var(--color-revenue)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </DataMask>
            </CardContent>
          </Card>
        )}

        {/* Mini Calendar & Activity */}
        {widgets.calendar && (
          <Card
            className={`${widgets.revenueChart ? 'col-span-3' : 'col-span-7'} animate-in fade-in zoom-in-95 duration-500 delay-100 border-slate-200 shadow-sm bg-white`}
          >
            <CardHeader>
              <CardTitle className="text-black">
                {t('dashboard.quick_calendar')}
              </CardTitle>
              <CardDescription className="text-black font-medium">
                {t('dashboard.todays_activity')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border border-slate-200 text-black font-medium"
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Approvals */}
        {widgets.pending && (
          <Card
            className={`${widgets.expenseChart ? 'col-span-4' : 'col-span-7'} animate-in fade-in slide-in-from-left-4 duration-500 delay-200 border-slate-200 shadow-sm bg-white`}
          >
            <CardHeader>
              <CardTitle className="text-black">
                {t('dashboard.pending_approvals')}
              </CardTitle>
              <CardDescription className="text-black font-medium">
                {t('dashboard.pending_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financials.invoices
                  .filter((i) => i.status === 'pending')
                  .filter((i) =>
                    selectedPropertyId === 'all'
                      ? true
                      : i.propertyId === selectedPropertyId,
                  )
                  .map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <Activity className="h-5 w-5 text-orange-700" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-black">
                            <DataMask>{invoice.description}</DataMask>
                          </p>
                          <p className="text-xs text-black font-bold">
                            {invoice.date} • <DataMask>{invoice.id}</DataMask>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-black">
                          <DataMask>
                            {formatCurrency(invoice.amount, language)}
                          </DataMask>
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-300 text-black font-bold"
                        >
                          {t('dashboard.review')}
                        </Button>
                      </div>
                    </div>
                  ))}
                {filteredTasks
                  .filter((t) => t.status === 'pending')
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Activity className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-black">
                            <DataMask>{task.title}</DataMask>
                          </p>
                          <p className="text-xs text-black font-bold">
                            <DataMask>{task.propertyName}</DataMask> •{' '}
                            <DataMask>{task.assignee}</DataMask>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-black border border-slate-300 font-bold"
                        >
                          {t('common.pending')}
                        </Badge>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-trust-blue text-white font-bold"
                        >
                          {t('dashboard.approve')}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Expenses Chart */}
        {widgets.expenseChart && (
          <Card
            className={`${widgets.pending ? 'col-span-3' : 'col-span-7'} animate-in fade-in slide-in-from-right-4 duration-500 delay-300 border-slate-200 shadow-sm bg-white`}
          >
            <CardHeader>
              <CardTitle className="text-black">
                {t('dashboard.expense_distribution')}
              </CardTitle>
              <CardDescription className="text-black font-medium">
                {t('dashboard.expense_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataMask className="w-full h-[250px] block">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <Pie
                      data={financials.expenses}
                      dataKey="value"
                      nameKey="category"
                      innerRadius={60}
                      strokeWidth={5}
                    >
                      {financials.expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ChartContainer>
              </DataMask>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
