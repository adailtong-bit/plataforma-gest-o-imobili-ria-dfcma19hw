import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink, ClipboardList } from 'lucide-react'
import { Property, LedgerEntry, Task } from '@/lib/types'
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subYears,
  getYear,
} from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import useTaskStore from '@/stores/useTaskStore'
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'
import useLanguageStore from '@/stores/useLanguageStore'
import { exportToCSV } from '@/lib/utils'

interface OwnerStatementProps {
  ownerId: string
  properties: Property[]
  ledgerEntries: LedgerEntry[]
}

export function OwnerStatement({
  ownerId,
  properties,
  ledgerEntries,
}: OwnerStatementProps) {
  const { toast } = useToast()
  const { tasks } = useTaskStore()
  const { t } = useLanguageStore()
  const [period, setPeriod] = useState('current')
  const [selectedPropertyId, setSelectedPropertyId] = useState('all')
  const [viewingTask, setViewingTask] = useState<Task | null>(null)

  const ownerProperties = properties.filter((p) => p.ownerId === ownerId)
  const ownerPropertyIds = ownerProperties.map((p) => p.id)

  const getDateRange = () => {
    const now = new Date()
    if (period === 'current') {
      return { start: startOfMonth(now), end: endOfMonth(now) }
    } else if (period === 'last') {
      const last = subMonths(now, 1)
      return { start: startOfMonth(last), end: endOfMonth(last) }
    } else if (period === 'last3') {
      return { start: startOfMonth(subMonths(now, 3)), end: endOfMonth(now) }
    } else if (period === 'semester') {
      return { start: startOfMonth(subMonths(now, 6)), end: endOfMonth(now) }
    } else if (period === 'year') {
      return { start: startOfYear(now), end: endOfYear(now) }
    } else if (period === 'prevYear') {
      const prev = subYears(now, 1)
      return { start: startOfYear(prev), end: endOfYear(prev) }
    } else {
      return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  const range = getDateRange()

  const filteredEntries = ledgerEntries.filter((entry) => {
    const propertyMatch =
      selectedPropertyId === 'all'
        ? ownerPropertyIds.includes(entry.propertyId)
        : entry.propertyId === selectedPropertyId

    if (!propertyMatch) return false

    const date = new Date(entry.date)
    return date >= range.start && date <= range.end
  })

  const sortedAsc = [...filteredEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  let runningBal = 0
  const entriesWithBalance = sortedAsc
    .map((entry) => {
      runningBal += entry.type === 'income' ? entry.amount : -entry.amount
      return { ...entry, runningBalance: runningBal }
    })
    .reverse()

  const totalIncome = filteredEntries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalExpenses = filteredEntries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0)

  const netIncome = totalIncome - totalExpenses

  const handleDownloadCSV = () => {
    const headers = [
      'Date',
      'Property',
      'Description',
      'Category',
      'Type',
      'Status',
      'Amount',
      'Running Balance',
    ]
    const rows = entriesWithBalance.map((e) => {
      const prop = properties.find((p) => p.id === e.propertyId)
      return [
        format(new Date(e.date), 'yyyy-MM-dd'),
        prop ? `"${prop.name}"` : 'N/A',
        `"${e.description.replace(/"/g, '""')}"`,
        e.category,
        e.type,
        e.status,
        e.amount.toFixed(2),
        e.runningBalance.toFixed(2),
      ]
    })
    exportToCSV(`owner_${ownerId}_accounting.csv`, headers, rows)
    toast({
      title: 'Export Successful',
      description: 'Accounting report CSV downloaded successfully.',
    })
  }

  const currentYear = getYear(new Date())

  return (
    <Card>
      <TaskDetailsSheet
        task={viewingTask}
        open={!!viewingTask}
        onOpenChange={(open) => !open && setViewingTask(null)}
      />

      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
        <CardTitle>
          {t('financial.owner_statement') || 'Owner Statement'}
        </CardTitle>
        <div className="flex gap-2 flex-wrap justify-end">
          <Select
            value={selectedPropertyId}
            onValueChange={setSelectedPropertyId}
          >
            <SelectTrigger className="w-[180px] text-black">
              <SelectValue placeholder={t('common.property') || 'Property'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t('common.all_properties') ||
                  'Total Portfolio Balance (All Accounts)'}
              </SelectItem>
              {ownerProperties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] text-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">
                {t('financial.this_month') || 'This Month'}
              </SelectItem>
              <SelectItem value="last">
                {t('financial.last_month') || 'Last Month'}
              </SelectItem>
              <SelectItem value="last3">
                {t('financial.last_3_months') || 'Last 3 Months'}
              </SelectItem>
              <SelectItem value="semester">
                {t('financial.semester') || 'Semester'}
              </SelectItem>
              <SelectItem value="year">
                {t('financial.current_year') || 'Current Year'} ({currentYear})
              </SelectItem>
              <SelectItem value="prevYear">
                {t('financial.previous_year') || 'Previous Year'} (
                {currentYear - 1})
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleDownloadCSV}
            className="gap-2 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
          >
            <Download className="h-4 w-4" /> Export for Quickbooks (CSV)
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-slate-600 font-medium">
              {t('financial.gross_revenue') || 'Gross Revenue'}
            </p>
            <p className="text-2xl font-bold text-green-700">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-slate-600 font-medium">
              {t('financial.total_expenses') || 'Expenses'}
            </p>
            <p className="text-2xl font-bold text-red-700">
              ${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div
            className={`p-4 rounded-lg border ${netIncome < 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}
          >
            <p
              className={`text-sm font-medium ${netIncome < 0 ? 'text-red-800' : 'text-slate-600'}`}
            >
              {netIncome < 0
                ? 'Negative Payout / Balance Due'
                : t('financial.net_income') || 'Net Income (Payout)'}
            </p>
            <p
              className={`text-2xl font-bold ${netIncome < 0 ? 'text-red-700' : 'text-blue-700'}`}
            >
              ${netIncome.toFixed(2)}
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 border-b-2 border-slate-200">
              <TableHead className="font-bold text-black">
                {t('common.date') || 'Date'}
              </TableHead>
              <TableHead className="font-bold text-black">
                {t('common.property') || 'Property'}
              </TableHead>
              <TableHead className="font-bold text-black">
                {t('common.description') || 'Description'}
              </TableHead>
              <TableHead className="font-bold text-black">
                {t('common.category') || 'Category'}
              </TableHead>
              <TableHead className="font-bold text-black">
                {t('common.status') || 'Status'}
              </TableHead>
              <TableHead className="text-right font-bold text-black">
                {t('common.value') || 'Amount'}
              </TableHead>
              <TableHead className="text-right font-bold text-black">
                Running Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entriesWithBalance.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-slate-500"
                >
                  {t('common.empty') || 'No entries found.'}
                </TableCell>
              </TableRow>
            ) : (
              entriesWithBalance.map((entry) => {
                const prop = properties.find((p) => p.id === entry.propertyId)
                const associatedTask = tasks.find(
                  (t) => t.id === entry.referenceId,
                )

                return (
                  <TableRow key={entry.id} className="hover:bg-slate-50">
                    <TableCell className="text-black">
                      {format(new Date(entry.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="font-medium text-black">
                      {prop ? (
                        <Link
                          to={`/properties/${prop.id}`}
                          className="flex items-center gap-2 hover:text-blue-600 hover:underline"
                        >
                          {prop.name}
                          <ExternalLink className="h-3 w-3 opacity-50" />
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-black">
                      <div className="flex flex-col">
                        <span>{entry.description}</span>
                        {associatedTask && (
                          <div
                            className="flex items-center gap-1 text-xs text-blue-600 cursor-pointer hover:text-blue-800 mt-0.5 w-fit font-medium"
                            onClick={() => setViewingTask(associatedTask)}
                          >
                            <ClipboardList className="h-3 w-3" />
                            View Task
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-black">
                        {entry.category}
                      </span>
                    </TableCell>
                    <TableCell>
                      {entry.status === 'cleared' ? (
                        <Badge className="bg-green-600">
                          {t('common.paid') || 'Paid'}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-black border-slate-300"
                        >
                          {t('common.pending') || 'Pending'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        entry.type === 'income'
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}$
                      {entry.amount.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${
                        entry.runningBalance >= 0
                          ? 'text-blue-700'
                          : 'text-red-700'
                      }`}
                    >
                      ${entry.runningBalance.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
