import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Activity, DollarSign, Home, AlertCircle } from 'lucide-react'
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

export default function Index() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { tasks } = useTaskStore()
  const { ledgerEntries, financials } = useFinancialStore()
  const { t } = useLanguageStore()

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

  // Use mock data if ledger is empty for demo purposes, otherwise use real data
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          {t('dashboard.title')}
        </h1>
        <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {t('dashboard.occupancy_rate')}
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +4% {t('dashboard.from_last_week')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.active_tasks')}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter((t) => t.status !== 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              3 {t('dashboard.high_priority')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.defaulters')}
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4%</div>
            <p className="text-xs text-muted-foreground">
              -0.5% {t('dashboard.from_last_month')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t('dashboard.revenue_vs_expenses')}</CardTitle>
            <CardDescription>{t('dashboard.revenue_overview')}</CardDescription>
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

        {/* Mini Calendar & Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t('dashboard.quick_calendar')}</CardTitle>
            <CardDescription>{t('dashboard.todays_activity')}</CardDescription>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pending Approvals */}
        <Card className="col-span-4">
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

        {/* Expenses Chart */}
        <Card className="col-span-3">
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
      </div>
    </div>
  )
}
