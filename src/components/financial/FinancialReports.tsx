import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import usePropertyStore from '@/stores/usePropertyStore'
import usePartnerStore from '@/stores/usePartnerStore'
import useTenantStore from '@/stores/useTenantStore'
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
  const { properties } = usePropertyStore()
  const { tenants } = useTenantStore()
  const { partners } = usePartnerStore()
  const { toast } = useToast()

  const [period, setPeriod] = useState('1m') // 1m, 3m, 6m, ytd, 1y
  const [grouping, setGrouping] = useState<'category' | 'month' | 'supplier'>(
    'category',
  )
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')
  const [selectedPartnerId, setSelectedPartnerId] = useState('all')

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

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter((e) => {
      const dateValid = new Date(e.date) >= startDate
      const propertyValid =
        selectedPropertyId === 'all' || e.propertyId === selectedPropertyId
      // Partner filtering is heuristic based on beneficiaryId or description content if not explicitly linked in ledger (mock data limitation)
      // Assuming beneficiaryId might point to a partner for payments to them
      // Or looking at description/payee
      let partnerValid = true
      if (selectedPartnerId !== 'all') {
        const partner = partners.find((p) => p.id === selectedPartnerId)
        if (partner) {
          partnerValid =
            e.payee === partner.name ||
            e.description.includes(partner.name) ||
            e.beneficiaryId === partner.id
        }
      }

      return dateValid && propertyValid && partnerValid
    })
  }, [
    ledgerEntries,
    startDate,
    selectedPropertyId,
    selectedPartnerId,
    partners,
  ])

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
    const headers = [
      'Date',
      'Value',
      'Category',
      'Type',
      'Description',
      'Payee/Supplier',
      'Property Code',
      'Tenant Name',
    ]

    const rows = filteredEntries.map((entry) => {
      const property = properties.find((p) => p.id === entry.propertyId)
      // Attempt to find related tenant via beneficiaryId or other logic if needed
      // Here we assume beneficiaryId points to a tenant for income
      const tenant = tenants.find((t) => t.id === entry.beneficiaryId)

      return [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        entry.amount.toFixed(2),
        entry.category,
        entry.type,
        `"${entry.description.replace(/"/g, '""')}"`, // Escape quotes
        entry.payee || '',
        property?.id || 'N/A',
        tenant?.name || 'N/A',
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `financial_report_${Date.now()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({ title: 'Exportado', description: 'Relatório CSV baixado.' })
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
      {/* Filters Row */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">This Month</SelectItem>
                  <SelectItem value="q">This Quarter</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="ytd">Year to Date</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Property</label>
              <Select
                value={selectedPropertyId}
                onValueChange={setSelectedPropertyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Partner</label>
              <Select
                value={selectedPartnerId}
                onValueChange={setSelectedPartnerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Partners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Partners</SelectItem>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">
              Gross Revenue
            </div>
            <div className="text-2xl font-bold text-green-700">
              ${totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">
              Total Expenses
            </div>
            <div className="text-2xl font-bold text-red-700">
              ${totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">
              Net Profit
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
            <CardTitle>Consolidated Reports</CardTitle>
            <Select value={grouping} onValueChange={(v: any) => setGrouping(v)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="category">By Category</SelectItem>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="supplier">By Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ChartContainer
              config={{
                income: { label: 'Revenue', color: '#22c55e' },
                expense: { label: 'Expense', color: '#ef4444' },
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
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  name="Expense"
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
                      ? 'Month'
                      : grouping === 'category'
                        ? 'Category'
                        : 'Supplier'}
                  </TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expense</TableHead>
                  <TableHead className="text-right">Net</TableHead>
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
