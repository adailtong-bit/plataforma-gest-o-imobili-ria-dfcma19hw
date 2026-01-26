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
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { addDays, subDays, isWithinInterval } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { Download, Filter, FileText } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import useTaskStore from '@/stores/useTaskStore'
import { exportToCSV } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function Reports() {
  const { properties } = usePropertyStore()
  const { tasks } = useTaskStore()
  const { toast } = useToast()

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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

  // Aggregate Data for Charts
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

  const maintenanceStats = filteredTasks.reduce(
    (acc, task) => {
      if (task.type === 'maintenance') {
        const status = task.status
        if (acc[status]) acc[status]++
        else acc[status] = 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const maintenanceData = Object.entries(maintenanceStats).map(
    ([name, value]) => ({ name, value }),
  )

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  const handleExport = () => {
    // Generate CSV data based on current filters
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

    exportToCSV('maintenance_report', headers, rows)
    toast({
      title: 'Export Successful',
      description: 'The report has been downloaded.',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            Relatórios Avançados
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada de inventário, manutenção e condições das
            propriedades.
          </p>
        </div>
        <Button onClick={handleExport} className="bg-trust-blue gap-2">
          <Download className="h-4 w-4" /> Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-muted/30">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="grid gap-2">
            <span className="text-sm font-medium">Período</span>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium">Propriedade</span>
            <Select
              value={selectedProperty}
              onValueChange={setSelectedProperty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Propriedades</SelectItem>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <span className="text-sm font-medium">Categoria</span>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Appliances">Appliances</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" /> Aplicar Filtros
          </Button>
        </CardContent>
      </Card>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Condição do Inventário</CardTitle>
            <CardDescription>
              Distribuição de itens por estado de conservação
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
            <CardTitle>Danos por Propriedade</CardTitle>
            <CardDescription>
              Propriedades com maior número de itens danificados/ausentes
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
                  data={damageStats.slice(0, 10)} // Top 10
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredProperties.reduce(
                (acc, p) => acc + (p.inventory?.length || 0),
                0,
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              No período selecionado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Custo Estimado de Reparo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              $
              {filteredTasks
                .reduce((acc, t) => acc + (t.price || 0), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
