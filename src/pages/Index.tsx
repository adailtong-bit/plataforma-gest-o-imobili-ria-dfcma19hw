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
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { tasks, financials } from '@/lib/mockData'
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
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'

const chartConfig = {
  maintenance: {
    label: 'Manutenção',
    color: 'hsl(var(--chart-1))',
  },
  cleaning: {
    label: 'Limpeza',
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

export default function Index() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-navy">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral das operações e desempenho financeiro.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total (Mês)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,000</div>
            <p className="text-xs text-muted-foreground">
              +20.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Ocupação (STR)
            </CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">
              +4% desde a última semana
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Ativas
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter((t) => t.status !== 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">3 alta prioridade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inadimplência (LTR)
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4%</div>
            <p className="text-xs text-muted-foreground">
              -0.5% desde o último mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Receita vs Despesas</CardTitle>
            <CardDescription>Visão geral dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                revenue: { label: 'Receita', color: 'hsl(var(--primary))' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={financials.revenue}>
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
            <CardTitle>Calendário Rápido</CardTitle>
            <CardDescription>Check-ins e Check-outs de hoje</CardDescription>
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
            <CardTitle>Aprovações Pendentes</CardTitle>
            <CardDescription>
              Faturas e tarefas aguardando sua ação
            </CardDescription>
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
                        Revisar
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
                      <Badge variant="secondary">Pendente</Badge>
                      <Button size="sm" variant="default">
                        Aprovar
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
            <CardTitle>Distribuição de Despesas</CardTitle>
            <CardDescription>Por categoria este mês</CardDescription>
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
