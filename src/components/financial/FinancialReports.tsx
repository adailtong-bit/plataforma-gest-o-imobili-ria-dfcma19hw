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
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useFinancialStore from '@/stores/useFinancialStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useTenantStore from '@/stores/useTenantStore'
import useShortTermStore from '@/stores/useShortTermStore'
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
  const { tenants } = useTenantStore()
  const { bookings } = useShortTermStore()
  const { towers } = useHotelStore()
  const { toast } = useToast()
  const { language, t } = useLanguageStore()
  const context = useContext(AppContext)

  // Global property selection
  const globalPropertyId = context?.selectedPropertyId || 'all'

  const [selectedPropertyId, setSelectedPropertyId] =
    useState<string>(globalPropertyId)
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
      return dateValid && propertyValid
    })
  }, [ledgerEntries, dateRange, selectedPropertyId])

  // --- Breakdown by Category (Room, F&B, Services) ---
  const revenueByCategory = useMemo(() => {
    const data = { Room: 0, 'F&B': 0, Services: 0 }
    filteredEntries.forEach((e) => {
      if (e.type === 'income') {
        const cat = e.category as keyof typeof data
        if (data[cat] !== undefined) {
          data[cat] += e.amount
        }
      }
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredEntries])

  // --- Breakdown by Tower ---
  const revenueByTower = useMemo(() => {
    const data: Record<string, number> = {}
    towers.forEach((t) => (data[t.name] = 0))
    data['Other'] = 0

    filteredEntries.forEach((e) => {
      if (e.type === 'income') {
        const prop = properties.find((p) => p.id === e.propertyId)
        if (prop && prop.towerId) {
          const tower = towers.find((t) => t.id === prop.towerId)
          if (tower) {
            data[tower.name] = (data[tower.name] || 0) + e.amount
          } else {
            data['Other'] += e.amount
          }
        } else {
          data['Other'] += e.amount
        }
      }
    })

    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0)
  }, [filteredEntries, properties, towers])

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

  const handleExport = () => {
    const headers = [
      'Date',
      'Property',
      'Type',
      'Category',
      'Description',
      'Amount',
      'Status',
    ]
    const rows = filteredEntries.map((entry) => {
      const property = properties.find((p) => p.id === entry.propertyId)
      return [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        property?.name || 'Unknown',
        entry.type,
        entry.category,
        `"${entry.description.replace(/"/g, '""')}"`,
        entry.amount.toFixed(2),
        entry.status,
      ]
    })
    exportToCSV('financial_report', headers, rows)
    toast({
      title: t('common.export_success'),
      description: 'Financial data downloaded.',
    })
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t('common.date')} Range
              </Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t('common.property')}
              </Label>
              <Select
                value={selectedPropertyId}
                onValueChange={setSelectedPropertyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.all')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-start-4">
              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" /> {t('common.export_data')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart2 className="h-4 w-4 mr-2" /> Overview & P&L
          </TabsTrigger>
          <TabsTrigger value="towers">
            <Building2 className="h-4 w-4 mr-2" /> Tower Breakdown
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Globe className="h-4 w-4 mr-2" /> Channel Analytics
          </TabsTrigger>
          <TabsTrigger value="projection">
            <TrendingUp className="h-4 w-4 mr-2" /> Projected Cash Flow
          </TabsTrigger>
          <TabsTrigger value="category">
            <PieChartIcon className="h-4 w-4 mr-2" /> Profitability by Category
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">
                  Total Revenue
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
                  Total Expenses
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
                  Net Income
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
              <CardTitle>Revenue by Tower</CardTitle>
              <CardDescription>
                Financial performance split by building towers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{ revenue: { label: 'Revenue', color: '#8884d8' } }}
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
                      name="Revenue"
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>
                Room vs F&B vs Services distribution.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartContainer
                  config={{ value: { label: 'Value', color: '#82ca9d' } }}
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
              <CardTitle>Projected Cash Flow (6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ChartContainer
                  config={{
                    income: { label: 'Income', color: '#22c55e' },
                    expenses: { label: 'Expenses', color: '#ef4444' },
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
                      name="Income"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="expenses"
                      fill="#ef4444"
                      name="Expenses"
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
