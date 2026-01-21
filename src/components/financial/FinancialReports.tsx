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
import { Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import useFinancialStore from '@/stores/useFinancialStore'
import {
  format,
  subMonths,
  startOfMonth,
  startOfQuarter,
  startOfYear,
} from 'date-fns'
import { useToast } from '@/hooks/use-toast'

export function FinancialReports() {
  const { ledgerEntries } = useFinancialStore()
  const { toast } = useToast()

  const [period, setPeriod] = useState('1m') // 1m, 3m, 6m, ytd, 1y
  const [grouping, setGrouping] = useState<'category' | 'month' | 'supplier'>(
    'category',
  )

  const getStartDate = () => {
    const now = new Date()
    switch (period) {
      case '1m':
        return startOfMonth(now)
      case '3m':
        return subMonths(now, 3)
      case '6m':
        return subMonths(now, 6)
      case 'q':
        return startOfQuarter(now)
      case 'ytd':
        return startOfYear(now)
      case '1y':
        return subMonths(now, 12)
      default:
        return startOfMonth(now)
    }
  }

  const startDate = getStartDate()
  const filteredEntries = ledgerEntries.filter(
    (e) => new Date(e.date) >= startDate,
  )

  // Consolidate data based on grouping
  const consolidatedData = filteredEntries.reduce(
    (acc, entry) => {
      let key = ''
      if (grouping === 'month') {
        key = format(new Date(entry.date), 'MMM yyyy')
      } else if (grouping === 'category') {
        key = entry.category || 'Uncategorized'
      } else if (grouping === 'supplier') {
        key = entry.payee || entry.description || 'Unknown'
      }

      if (!acc[key]) acc[key] = { name: key, income: 0, expense: 0 }

      if (entry.type === 'income') acc[key].income += entry.amount
      else acc[key].expense += entry.amount

      return acc
    },
    {} as Record<string, { name: string; income: number; expense: number }>,
  )

  const chartData = Object.values(consolidatedData)

  const handleExport = () => {
    toast({ title: 'Exportado', description: 'Relatório baixado.' })
  }

  const totalIncome = filteredEntries
    .filter((e) => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpenses = filteredEntries
    .filter((e) => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const netProfit = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">
              Receita Total
            </div>
            <div className="text-2xl font-bold text-green-700">
              ${totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">
              Despesas Totais
            </div>
            <div className="text-2xl font-bold text-red-700">
              ${totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </div>
            <div className="text-2xl font-bold text-blue-700">
              ${netProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Relatórios Consolidados</CardTitle>
            <div className="flex gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Mês Atual</SelectItem>
                  <SelectItem value="q">Trimestre</SelectItem>
                  <SelectItem value="6m">Semestre</SelectItem>
                  <SelectItem value="ytd">Ano Atual</SelectItem>
                  <SelectItem value="1y">Últimos 12 Meses</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={grouping}
                onValueChange={(v: any) => setGrouping(v)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Por Categoria</SelectItem>
                  <SelectItem value="month">Por Mês</SelectItem>
                  <SelectItem value="supplier">Por Fornecedor</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ChartContainer
              config={{
                income: { label: 'Receita', color: '#22c55e' },
                expense: { label: 'Despesa', color: '#ef4444' },
              }}
              className="h-full w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="#22c55e"
                  name="Receita"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  name="Despesa"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="mt-8 border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {grouping === 'month'
                      ? 'Mês'
                      : grouping === 'category'
                        ? 'Categoria'
                        : 'Fornecedor'}
                  </TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Despesa</TableHead>
                  <TableHead className="text-right">Líquido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chartData.map((d) => (
                  <TableRow key={d.name}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-right text-green-600">
                      ${d.income.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      ${d.expense.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-blue-600">
                      ${(d.income - d.expense).toFixed(2)}
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
