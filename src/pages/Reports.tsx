import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { subDays, isWithinInterval } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Download, Filter } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import { exportToCSV } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { MaintenanceReport } from '@/components/maintenance/MaintenanceReport'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'

export default function Reports() {
  const { properties } = usePropertyStore()
  const { tasks } = useTaskStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90),
    to: new Date(),
  })
  const [selectedProperty, setSelectedProperty] = useState<string>('all')

  // Filter Data
  const filteredProperties = properties.filter((p) =>
    selectedProperty === 'all' ? true : p.id === selectedProperty,
  )

  const propertyIds = filteredProperties.map((p) => p.id)

  const filteredTasks = tasks.filter((t) => {
    const matchesProperty = propertyIds.includes(t.propertyId)
    const matchesDate =
      dateRange?.from && dateRange?.to
        ? isWithinInterval(new Date(t.date), {
            start: dateRange.from,
            end: dateRange.to,
          })
        : true
    return matchesProperty && matchesDate
  })

  // Aggregate Data for Inventory Charts
  const damageStats = filteredProperties.reduce(
    (acc, prop) => {
      const damagedItems =
        prop.inventory?.filter((i) =>
          ['Damaged', 'Broken', 'Missing', 'Poor'].includes(i.condition),
        ).length || 0
      if (damagedItems > 0) {
        acc.push({ name: prop.name, count: damagedItems })
      }
      return acc
    },
    [] as { name: string; count: number }[],
  )

  const conditionDistribution = filteredProperties.reduce(
    (acc, prop) => {
      prop.inventory?.forEach((item) => {
        const condition = item.condition
        if (acc[condition]) acc[condition]++
        else acc[condition] = 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const conditionData = Object.entries(conditionDistribution).map(
    ([name, value]) => ({ name, value }),
  )

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  const handleExport = () => {
    const headers = [
      'Property',
      'Task Title',
      'Status',
      'Date',
      'Cost ($)',
      'Description',
    ]
    const rows = filteredTasks.map((t) => [
      t.propertyName,
      t.title,
      t.status,
      t.date,
      t.price || 0,
      t.description || '',
    ])

    exportToCSV('full_report', headers, rows)
    toast({
      title: t('common.export_success_title'),
      description: t('common.export_success'),
    })
  }

  const totalItems = filteredProperties.reduce(
    (acc, p) => acc + (p.inventory?.length || 0),
    0,
  )

  const totalDamaged = filteredProperties.reduce(
    (acc, p) =>
      acc +
      (p.inventory?.filter((i) =>
        ['Damaged', 'Poor', 'Broken'].includes(i.condition),
      ).length || 0),
    0,
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('reports.title')}
          </h1>
          <p className="text-muted-foreground">{t('reports.subtitle')}</p>
        </div>
        <Button onClick={handleExport} className="bg-trust-blue gap-2">
          <Download className="h-4 w-4" /> {t('common.export_data')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="grid gap-2">
            <span className="text-sm font-medium">{t('reports.period')}</span>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium">{t('reports.property')}</span>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
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
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> {t('reports.apply_filters')}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList>
          <TabsTrigger value="maintenance">
            {t('reports.maintenance_analytics')}
          </TabsTrigger>
          <TabsTrigger value="inventory">
            {t('reports.inventory_health')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="maintenance">
          <MaintenanceReport
            tasks={filteredTasks}
            title={t('reports.maintenance_efficiency')}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('reports.inventory_condition')}</CardTitle>
                <CardDescription>
                  {t('reports.inventory_condition')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      value: { label: 'Items', color: '#8884d8' },
                    }}
                    className="h-full w-full"
                  >
                    <PieChart>
                      <Pie
                        data={conditionData}
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
                        {conditionData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltipContent />} />
                      <Legend />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('reports.damage_by_property')}</CardTitle>
                <CardDescription>
                  {t('reports.damage_by_property')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ChartContainer
                    config={{
                      count: { label: 'Damaged Items', color: '#ef4444' },
                    }}
                    className="h-full w-full"
                  >
                    <BarChart
                      data={damageStats.slice(0, 10)}
                      layout="vertical"
                      margin={{ left: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="count"
                        fill="#ef4444"
                        radius={[0, 4, 4, 0]}
                        name="Items"
                      />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.total_items')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <DataMask>{totalItems}</DataMask>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('reports.damaged_poor')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  <DataMask>{totalDamaged}</DataMask>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
