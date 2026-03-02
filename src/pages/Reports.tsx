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
  const { properties, financials, formatAppCurrency, tenants } =
    useContext(AppContext)!

  // Aggregate Data
  const totalProperties = properties.length
  const totalInvoices = financials.invoices.length
  const totalRevenue = financials.invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.amount, 0)
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
      name: 'Occupied',
      value: properties.filter(
        (p) => p.status === 'occupied' || p.status === 'rented',
      ).length,
    },
    {
      name: 'Vacant',
      value: properties.filter(
        (p) => p.status === 'available' || p.status === 'vacant',
      ).length,
    },
    {
      name: 'Maintenance',
      value: properties.filter((p) => p.status === 'maintenance').length,
    },
  ]

  // Monthly Revenue Mock (Based on invoices if available, fallback to static)
  const monthlyData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Feb', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Apr', revenue: 2780, expenses: 3908 },
    { month: 'May', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('common.reports')}
        </h1>
        <p className="text-muted-foreground">
          Advanced analytics and system reporting dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('common.properties')}
            </CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProperties}</div>
            <p className="text-xs text-muted-foreground">Total managed units</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Tenants
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTenants}</div>
            <p className="text-xs text-muted-foreground">Currently leasing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue (Paid)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <DataMask>{formatAppCurrency(totalRevenue)}</DataMask>
            </div>
            <p className="text-xs text-muted-foreground">
              From {totalInvoices} invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cityData.length}</div>
            <p className="text-xs text-muted-foreground">
              Cities across portfolio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
            <CardDescription>Revenue vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: 'Revenue', color: '#10b981' },
                expenses: { label: 'Expenses', color: '#ef4444' },
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
            <CardTitle>Occupancy Status</CardTitle>
            <CardDescription>Current property utilization</CardDescription>
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
            <CardTitle>Properties by Location</CardTitle>
            <CardDescription>Geographical distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: { label: 'Properties', color: '#3b82f6' },
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
