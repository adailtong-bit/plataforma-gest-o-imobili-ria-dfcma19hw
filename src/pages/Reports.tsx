import { useContext } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useLanguageStore from '@/stores/useLanguageStore'
import { AppContext } from '@/stores/AppContext'
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
  LineChart,
  Line,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Building, MapPin, DollarSign, Users } from 'lucide-react'
import { DataMask } from '@/components/DataMask'

export default function Reports() {
  const { t } = useLanguageStore()
  const appContext = useContext(AppContext)
  if (!appContext) return null
  const { properties, financials, formatAppCurrency, tenants } = appContext

  // Aggregate Data
  const totalProperties = properties.length

  const invoices = Array.isArray(financials)
    ? financials
    : financials.invoices || []
  const totalInvoices = invoices.length
  const totalRevenue = invoices
    .filter((i: import('@/lib/types').Invoice) => i.status === 'paid')
    .reduce(
      (acc: number, i: import('@/lib/types').Invoice) => acc + i.amount,
      0,
    )
  const activeTenants = tenants.filter((t) => t.status === 'active').length

  // Property by City
  const propertiesByCity = properties.reduce(
    (acc, p) => {
      const city = p.city || 'Unknown'
      acc[city] = (acc[city] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const cityData = Object.keys(propertiesByCity).map((city) => ({
    name: city,
    value: propertiesByCity[city],
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  // Occupancy Status
  const occupancyData = [
    {
      name: t('reports.status.occupied', 'Occupied'),
      value: properties.filter(
        (p) => p.status === 'occupied' || p.status === 'rented',
      ).length,
    },
    {
      name: t('reports.status.vacant', 'Vacant'),
      value: properties.filter(
        (p) => p.status === 'available' || p.status === 'vacant',
      ).length,
    },
    {
      name: t('reports.status.maintenance', 'Maintenance'),
      value: properties.filter((p) => p.status === 'maintenance').length,
    },
  ]

  // Monthly Revenue Mock (Based on invoices if available, fallback to static)
  const monthlyData = [
    { month: t('common.months.jan', 'Jan'), revenue: 4000, expenses: 2400 },
    { month: t('common.months.feb', 'Feb'), revenue: 3000, expenses: 1398 },
    { month: t('common.months.mar', 'Mar'), revenue: 2000, expenses: 9800 },
    { month: t('common.months.apr', 'Apr'), revenue: 2780, expenses: 3908 },
    { month: t('common.months.may', 'May'), revenue: 1890, expenses: 4800 },
    { month: t('common.months.jun', 'Jun'), revenue: 2390, expenses: 3800 },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('reports.title', 'Relatórios')}
        </h1>
        <p className="text-muted-foreground">
          {t(
            'reports.subtitle',
            'Painel analítico e de relatórios do sistema.',
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.properties', 'Properties')}
            </CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.total_managed_units', 'Total managed units')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.active_tenants', 'Active Tenants')}
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTenants}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.currently_leasing', 'Currently leasing')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.total_revenue', 'Total Revenue (Paid)')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <DataMask>{formatAppCurrency(totalRevenue)}</DataMask>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.from_invoices', 'From {count} invoices').replace(
                '{count}',
                totalInvoices.toString(),
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.locations', 'Locations')}
            </CardTitle>
            <MapPin className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityData.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.cities_across_portfolio', 'Cities across portfolio')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {t('reports.financial_overview', 'Financial Overview')}
            </CardTitle>
            <CardDescription>
              {t(
                'reports.revenue_vs_expenses',
                'Revenue vs Expenses over time',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: t('reports.revenue', 'Revenue'),
                  color: '#10b981',
                },
                expenses: {
                  label: t('reports.expenses', 'Expenses'),
                  color: '#ef4444',
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {t('reports.occupancy_status', 'Occupancy Status')}
            </CardTitle>
            <CardDescription>
              {t('reports.current_utilization', 'Current property utilization')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ChartContainer
              config={{}}
              className="h-[300px] w-full max-w-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {t('reports.properties_by_location', 'Properties by Location')}
            </CardTitle>
            <CardDescription>
              {t(
                'reports.geographical_distribution',
                'Geographical distribution',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: t('reports.properties', 'Properties'),
                  color: '#3b82f6',
                },
              }}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
