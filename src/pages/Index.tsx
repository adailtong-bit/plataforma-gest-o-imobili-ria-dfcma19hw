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
  Home,
  Bell,
  Settings2,
  AlertCircle,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
  Cell,
  Pie,
  PieChart,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import useTaskStore from '@/stores/useTaskStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useNotificationStore from '@/stores/useNotificationStore'
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

export default function Index() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { tasks } = useTaskStore()
  const { ledgerEntries, financials } = useFinancialStore()
  const { properties } = usePropertyStore()
  const { notifications } = useNotificationStore()
  const { t } = useLanguageStore()

  // Dashboard Widget State
  const [widgets, setWidgets] = useState({
    kpi: true,
    revenueChart: true,
    calendar: true,
    pending: true,
    expenseChart: true,
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  // Calculate real metrics from ledger
  const totalRevenue = ledgerEntries
    .filter((e) => e.type === 'income')
    .reduce((acc, curr) => acc + curr.value || curr.amount, 0)

  // Chart Data preparation
  const chartData = ledgerEntries.reduce(
    (acc, entry) => {
      const month = new Date(entry.date).toLocaleString('default', {
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
      label: t('partners.cleaning'),
      color: 'hsl(var(--chart-2))',
    },
    taxes: {
      label: 'Impostos',
      color: 'hsl(var(--chart-3))',
    },
    utilities: {
      label: 'Utilidades',
      color: 'hsl(var(--chart-4))',
    },
  }

  const pendingCleanings = tasks.filter(
    (t) => t.type === 'cleaning' && t.status === 'pending',
  )
  const activePropertiesCount = properties.filter(
    (p) => p.status === 'rented' || p.status === 'available',
  ).length
  const unreadNotifications = notifications.filter((n) => !n.read)

  const toggleWidget = (key: keyof typeof widgets) => {
    setWidgets((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('dashboard.title')}
          </h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings2 className="h-4 w-4" /> Personalizar Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personalizar Visualização</DialogTitle>
              <DialogDescription>
                Selecione os widgets que deseja ver no painel.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kpi"
                  checked={widgets.kpi}
                  onCheckedChange={() => toggleWidget('kpi')}
                />
                <Label htmlFor="kpi">Indicadores KPI (Topo)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="revenueChart"
                  checked={widgets.revenueChart}
                  onCheckedChange={() => toggleWidget('revenueChart')}
                />
                <Label htmlFor="revenueChart">Gráfico de Receita</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="calendar"
                  checked={widgets.calendar}
                  onCheckedChange={() => toggleWidget('calendar')}
                />
                <Label htmlFor="calendar">Calendário Rápido</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pending"
                  checked={widgets.pending}
                  onCheckedChange={() => toggleWidget('pending')}
                />
                <Label htmlFor="pending">Aprovações e Pendências</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="expenseChart"
                  checked={widgets.expenseChart}
                  onCheckedChange={() => toggleWidget('expenseChart')}
                />
                <Label htmlFor="expenseChart">Distribuição de Despesas</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Concluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      {widgets.kpi && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.total_revenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% {t('dashboard.from_last_month')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.pending_cleanings')}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pendingCleanings.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.high_priority')}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.active_properties')}
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePropertiesCount}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.new_notifications')}
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {unreadNotifications.length}
              </div>
              <p className="text-xs text-muted-foreground">Não lidas</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        {widgets.revenueChart && (
          <Card
            className={`${widgets.calendar ? 'col-span-4' : 'col-span-7'} animate-in fade-in zoom-in-95 duration-500`}
          >
            <CardHeader>
              <CardTitle>{t('dashboard.revenue_vs_expenses')}</CardTitle>
              <CardDescription>
                {t('dashboard.revenue_overview')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer
                config={{
                  revenue: {
                    label: 'Receita',
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
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Mini Calendar & Activity */}
        {widgets.calendar && (
          <Card
            className={`${widgets.revenueChart ? 'col-span-3' : 'col-span-7'} animate-in fade-in zoom-in-95 duration-500 delay-100`}
          >
            <CardHeader>
              <CardTitle>{t('dashboard.quick_calendar')}</CardTitle>
              <CardDescription>
                {t('dashboard.todays_activity')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Approvals */}
        {widgets.pending && (
          <Card
            className={`${widgets.expenseChart ? 'col-span-4' : 'col-span-7'} animate-in fade-in slide-in-from-left-4 duration-500 delay-200`}
          >
            <CardHeader>
              <CardTitle>{t('dashboard.pending_approvals')}</CardTitle>
              <CardDescription>{t('dashboard.pending_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financials.invoices
                  .filter((i) => i.status === 'pending')
                  .map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-orange-100 p-2 rounded-full">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {invoice.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.date} • {invoice.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">
                          ${invoice.amount.toFixed(2)}
                        </span>
                        <Button size="sm" variant="outline">
                          {t('dashboard.review')}
                        </Button>
                      </div>
                    </div>
                  ))}
                {tasks
                  .filter((t) => t.status === 'pending')
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Activity className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.propertyName} • {task.assignee}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{t('common.pending')}</Badge>
                        <Button size="sm" variant="default">
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
            className={`${widgets.pending ? 'col-span-3' : 'col-span-7'} animate-in fade-in slide-in-from-right-4 duration-500 delay-300`}
          >
            <CardHeader>
              <CardTitle>{t('dashboard.expense_distribution')}</CardTitle>
              <CardDescription>{t('dashboard.expense_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
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
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
