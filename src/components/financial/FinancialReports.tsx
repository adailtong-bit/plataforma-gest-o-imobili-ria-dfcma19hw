import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Download, Filter } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import useFinancialStore from '@/stores/useFinancialStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { useToast } from '@/hooks/use-toast'

export function FinancialReports() {
  const { ledgerEntries } = useFinancialStore()
  const { properties } = usePropertyStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [period, setPeriod] = useState('6m') // 1m, 3m, 6m, ytd
  const [propertyFilter, setPropertyFilter] = useState('all')

  // Filter Logic
  const getStartDate = () => {
    const now = new Date()
    switch (period) {
      case '1m':
        return startOfMonth(now)
      case '3m':
        return subMonths(now, 3)
      case '6m':
        return subMonths(now, 6)
      case 'ytd':
        return new Date(now.getFullYear(), 0, 1)
      default:
        return subMonths(now, 6)
    }
  }

  const filteredEntries = ledgerEntries.filter((entry) => {
    const entryDate = new Date(entry.date)
    const startDate = getStartDate()
    const matchesPeriod = entryDate >= startDate && entryDate <= new Date()
    const matchesProperty =
      propertyFilter === 'all' || entry.propertyId === propertyFilter
    return matchesPeriod && matchesProperty
  })

  // Summary Metrics
  const totalIncome = filteredEntries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)
  const totalExpense = filteredEntries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)
  const netIncome = totalIncome - totalExpense

  // Chart Data Aggregation
  const chartData = filteredEntries.reduce(
    (acc, entry) => {
      const month = format(new Date(entry.date), 'MMM yyyy')
      const existing = acc.find((d) => d.month === month)
      if (existing) {
        if (entry.type === 'income') existing.income += entry.amount
        else existing.expense += entry.amount
      } else {
        acc.push({
          month,
          income: entry.type === 'income' ? entry.amount : 0,
          expense: entry.type === 'expense' ? entry.amount : 0,
        })
      }
      return acc
    },
    [] as { month: string; income: number; expense: number }[],
  )

  chartData.reverse()

  const handleExport = () => {
    // Mock export function
    toast({
      title: t('common.export_success'),
      description: 'Relatório financeiro (CSV/PDF) gerado e baixado.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>{t('financial.title')} - Relatório</CardTitle>
              <CardDescription>
                Análise detalhada de fluxo de caixa
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Propriedade" />
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
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Este Mês</SelectItem>
                  <SelectItem value="3m">3 Meses</SelectItem>
                  <SelectItem value="6m">6 Meses</SelectItem>
                  <SelectItem value="ytd">Ano Atual (YTD)</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" /> {t('common.export_data')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold text-green-700">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm text-muted-foreground">Despesa Total</p>
              <p className="text-2xl font-bold text-red-700">
                ${totalExpense.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
              <p className="text-2xl font-bold text-blue-700">
                ${netIncome.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="h-[350px] w-full mb-8">
            <ChartContainer
              config={{
                income: { label: 'Receita', color: '#22c55e' },
                expense: { label: 'Despesa', color: '#ef4444' },
              }}
              className="h-full w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="income"
                  name="Receita"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Despesa"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Propriedade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {properties.find((p) => p.id === entry.propertyId)
                        ?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        entry.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}$
                      {entry.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === 'cleared' ? 'default' : 'secondary'
                        }
                      >
                        {entry.status === 'cleared'
                          ? t('common.paid')
                          : t('common.pending')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
