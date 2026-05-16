import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { LedgerEntry } from '@/lib/types'
import { formatCurrency, formatDate, exportToCSV } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import {
  ArrowDown,
  ArrowUp,
  AlertCircle,
  CheckCircle2,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PropertyLedgerProps {
  propertyId: string
  entries: LedgerEntry[]
}

export function PropertyLedger({ propertyId, entries }: PropertyLedgerProps) {
  const { t, language } = useLanguageStore()

  const sortedAsc = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )

  let currentBalance = 0
  const entriesWithBalance = sortedAsc
    .map((entry) => {
      currentBalance += entry.type === 'income' ? entry.amount : -entry.amount
      return { ...entry, runningBalance: currentBalance }
    })
    .reverse()

  const balance = currentBalance

  const handleExport = () => {
    const headers = [
      t('common.date') || 'Date',
      t('common.type') || 'Type',
      t('common.category') || 'Category',
      t('common.description') || 'Description',
      t('common.value') || 'Value',
      t('financial.running_balance') || 'Saldo Acumulado',
      t('common.status') || 'Status',
    ]
    const rows = entriesWithBalance.map((e) => [
      formatDate(e.date, language),
      e.type === 'income'
        ? t('analytics.revenue') || 'Receita'
        : t('analytics.expenses') || 'Despesa',
      e.category || '',
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      e.runningBalance.toFixed(2),
      e.status === 'cleared' || e.status === 'paid'
        ? t('common.paid') || 'Pago'
        : t('common.pending') || 'Pendente',
    ])
    exportToCSV(`property_${propertyId}_ledger.csv`, headers, rows)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h3 className="text-lg font-bold text-slate-900">
          {t('financial.title') || 'Financial'} -{' '}
          {t('common.history') || 'History'}
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-sm text-slate-500 mr-2">
              {t('common.total') || 'Total'}:
            </span>
            <span
              className={`text-xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}
            >
              <DataMask>{formatCurrency(balance, language)}</DataMask>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />{' '}
            {t('automation.export_csv') || 'Exportar para Contabilidade (CSV)'}
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>{t('common.date') || 'Date'}</TableHead>
              <TableHead>{t('common.type') || 'Type'}</TableHead>
              <TableHead>{t('common.category') || 'Category'}</TableHead>
              <TableHead>{t('common.description') || 'Description'}</TableHead>
              <TableHead className="text-right">
                {t('common.value') || 'Valor'}
              </TableHead>
              <TableHead className="text-right">
                {t('financial.running_balance') || 'Saldo Acumulado'}
              </TableHead>
              <TableHead className="text-right">
                {t('common.status') || 'Status'}
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
                  {t('common.empty') || 'No records found.'}
                </TableCell>
              </TableRow>
            ) : (
              entriesWithBalance.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {formatDate(entry.date, language)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {entry.type === 'income' ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className="capitalize text-sm">
                        {entry.type === 'income'
                          ? t('analytics.revenue') || 'Revenue'
                          : t('analytics.expenses') || 'Expense'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {entry.category === 'hoa'
                      ? 'HOA / Condomínio'
                      : entry.category === 'tax'
                        ? 'Impostos'
                        : entry.category}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate text-slate-700">
                    <DataMask>{entry.description}</DataMask>
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${entry.type === 'income' ? 'text-green-700' : 'text-red-700'}`}
                  >
                    <DataMask>
                      {entry.type === 'income' ? '+' : '-'}
                      {formatCurrency(entry.amount, language)}
                    </DataMask>
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${entry.runningBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}
                  >
                    <DataMask>
                      {formatCurrency(entry.runningBalance, language)}
                    </DataMask>
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.status === 'cleared' || entry.status === 'paid' ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('common.paid') || 'Pago'}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-50 text-yellow-800 border-yellow-200"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {t('common.pending') || 'Pendente'}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
