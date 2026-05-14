import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import usePropertyStore from '@/stores/usePropertyStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { formatCurrency } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'
import {
  Building2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Home,
  Percent,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'

export default function Dashboard() {
  const { properties } = usePropertyStore()
  const { ledgerEntries } = useFinancialStore()
  const { t } = useLanguageStore()

  // Properties Metrics
  const totalProperties = properties.length
  const rentedProperties = properties.filter(
    (p) => p.status === 'rented' || p.status === 'occupied',
  ).length
  const availableProperties = properties.filter(
    (p) => p.status === 'available' || p.status === 'vacant',
  ).length

  const occupancyRate =
    totalProperties > 0 ? (rentedProperties / totalProperties) * 100 : 0

  // Financial Metrics
  const incomes = ledgerEntries.filter((e) => e.type === 'income')
  const totalRevenue = incomes
    .filter((e) => e.status === 'cleared')
    .reduce((acc, e) => acc + e.amount, 0)

  const pendingIncomes = incomes.filter((e) => e.status === 'pending')
  const defaultAmount = pendingIncomes.reduce((acc, e) => acc + e.amount, 0)
  const defaultRate =
    incomes.length > 0 ? (pendingIncomes.length / incomes.length) * 100 : 0

  // Charts Data
  const propertyStatusData = [
    { name: 'Alugado', value: rentedProperties, color: '#10b981' },
    { name: 'Disponível', value: availableProperties, color: '#3b82f6' },
    {
      name: 'Manutenção',
      value: properties.filter((p) => p.status === 'maintenance').length,
      color: '#f59e0b',
    },
  ]

  // Mock revenue over time based on entries
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']
  const revenueData = months.map((m) => ({
    name: m,
    revenue: Math.floor(Math.random() * 50000) + 10000,
    expenses: Math.floor(Math.random() * 20000) + 5000,
  }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.dashboard') || 'Painel Principal'}
          </h1>
          <p className="text-muted-foreground">
            Visão geral das suas propriedades e finanças.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-trust-blue shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-trust-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12.5% em relação ao mês
              anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Ocupação
            </CardTitle>
            <Percent className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {occupancyRate.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {rentedProperties} de {totalProperties} imóveis ocupados
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inadimplência
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {defaultRate.toFixed(1)}%
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {formatCurrency(defaultAmount)} pendente
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Propriedades
            </CardTitle>
            <Building2 className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {totalProperties}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {availableProperties} disponíveis para locação
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Fluxo de Caixa (Receitas vs Despesas)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 h-[300px]">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="Receita"
                  />
                  <Bar
                    dataKey="expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    name="Despesa"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Status das Propriedades</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center relative">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyStatusData}
                    cx="40%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {propertyStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="absolute flex flex-col gap-3 right-8 top-1/3">
              {propertyStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    {item.name}
                  </span>
                  <span className="text-sm font-bold ml-auto">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
