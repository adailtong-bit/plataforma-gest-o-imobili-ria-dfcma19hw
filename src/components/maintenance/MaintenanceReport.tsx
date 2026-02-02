import { useState, useMemo } from 'react'
import { Task } from '@/lib/types'
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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Clock, Wrench, DollarSign, Calendar } from 'lucide-react'
import { exportToCSV, formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { differenceInDays, parseISO, format } from 'date-fns'

interface MaintenanceReportProps {
  tasks: Task[]
  title?: string
}

export function MaintenanceReport({ tasks, title }: MaintenanceReportProps) {
  const { t, language } = useLanguageStore()
  const { toast } = useToast()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Filter Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Basic type filter + category if needed
      if (
        t.type !== 'maintenance' &&
        t.type !== 'cleaning' &&
        t.type !== 'inspection'
      )
        return false
      if (categoryFilter !== 'all' && t.type !== categoryFilter) return false
      return true
    })
  }, [tasks, categoryFilter])

  // Metrics Calculation
  const metrics = useMemo(() => {
    const completedTasks = filteredTasks.filter((t) => t.status === 'completed')

    const totalCost = completedTasks.reduce((acc, t) => acc + (t.price || 0), 0)
    const avgCost = completedTasks.length
      ? totalCost / completedTasks.length
      : 0

    // Efficiency: Time from Request (date) to Completion (completedDate)
    const efficiencyData = completedTasks
      .filter((t) => t.completedDate && t.date)
      .map((t) => {
        const start = parseISO(t.date)
        const end = parseISO(t.completedDate!)
        return differenceInDays(end, start)
      })

    const avgDaysToComplete = efficiencyData.length
      ? efficiencyData.reduce((acc, days) => acc + days, 0) /
        efficiencyData.length
      : 0

    return {
      totalCost,
      avgCost,
      avgDaysToComplete,
      totalTasks: filteredTasks.length,
      completedCount: completedTasks.length,
    }
  }, [filteredTasks])

  // Chart Data: Cost by Category
  const costByCategory = useMemo(() => {
    const data: Record<string, number> = {}
    filteredTasks.forEach((t) => {
      const cat = t.type
      const cost = t.price || 0
      data[cat] = (data[cat] || 0) + cost
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredTasks])

  // Chart Data: Cost Over Time (Monthly)
  const costOverTime = useMemo(() => {
    const data: Record<string, number> = {}
    filteredTasks.forEach((t) => {
      if (!t.date) return
      const month = format(parseISO(t.date), 'MMM yyyy')
      const cost = t.price || 0
      data[month] = (data[month] || 0) + cost
    })
    // Sort by date would be better, simplistic for now
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }, [filteredTasks])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  const handleExport = () => {
    const headers = [
      'ID',
      'Title',
      'Date',
      'Type',
      'Status',
      'Cost',
      'Completed Date',
      'Duration (Days)',
    ]
    const rows = filteredTasks.map((t) => [
      t.id,
      t.title,
      format(parseISO(t.date), 'yyyy-MM-dd'),
      t.type,
      t.status,
      (t.price || 0).toFixed(2),
      t.completedDate ? format(parseISO(t.completedDate), 'yyyy-MM-dd') : 'N/A',
      t.completedDate
        ? differenceInDays(
            parseISO(t.completedDate),
            parseISO(t.date),
          ).toString()
        : 'N/A',
    ])

    exportToCSV('maintenance_report', headers, rows)
    toast({
      title: t('common.success'),
      description: t('common.export_success'),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">
          {title || t('reports.maintenance_analytics')}
        </h3>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('common.category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all')}</SelectItem>
              <SelectItem value="maintenance">
                {t('partners.maintenance')}
              </SelectItem>
              <SelectItem value="cleaning">{t('partners.cleaning')}</SelectItem>
              <SelectItem value="inspection">Inspection</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title={t('common.export')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> {t('reports.total_spend')}
            </span>
            <span className="text-2xl font-bold">
              {formatCurrency(metrics.totalCost, language)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" /> {t('reports.total_tasks')}
            </span>
            <span className="text-2xl font-bold">{metrics.totalTasks}</span>
            <span className="text-xs text-muted-foreground">
              {metrics.completedCount} {t('common.completed').toLowerCase()}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> {t('reports.avg_resolution')}
            </span>
            <span className="text-2xl font-bold">
              {metrics.avgDaysToComplete.toFixed(1)} Days
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {t('reports.avg_cost_task')}
            </span>
            <span className="text-2xl font-bold">
              {formatCurrency(metrics.avgCost, language)}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.cost_breakdown')}</CardTitle>
            <CardDescription>
              {t('reports.distribution_expenses')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  maintenance: {
                    label: t('partners.maintenance'),
                    color: '#0088FE',
                  },
                  cleaning: { label: t('partners.cleaning'), color: '#00C49F' },
                  inspection: { label: 'Inspection', color: '#FFBB28' },
                }}
                className="h-full w-full"
              >
                <PieChart>
                  <Pie
                    data={costByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {costByCategory.map((entry, index) => (
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
            <CardTitle>{t('reports.monthly_expenditure')}</CardTitle>
            <CardDescription>{t('reports.spending_trends')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  value: { label: t('common.value'), color: '#8884d8' },
                }}
                className="h-full w-full"
              >
                <BarChart data={costOverTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#000" />
                  <YAxis stroke="#000" />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="value"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                    name={t('common.value')}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
