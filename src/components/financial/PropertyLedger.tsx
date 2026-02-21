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
import { formatCurrency, formatDate } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import {
  ArrowDown,
  ArrowUp,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

interface PropertyLedgerProps {
  propertyId: string
  entries: LedgerEntry[]
}

export function PropertyLedger({ propertyId, entries }: PropertyLedgerProps) {
  const { t, language } = useLanguageStore()

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const balance = sortedEntries.reduce((acc, entry) => {
    return entry.type === 'income' ? acc + entry.amount : acc - entry.amount
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900">
          {t('financial.title')} - {t('common.history')}
        </h3>
        <div className="text-right">
          <span className="text-sm text-slate-500 mr-2">
            {t('common.total')}:
          </span>
          <span
            className={`text-xl font-bold ${balance >= 0 ? 'text-green-700' : 'text-red-700'}`}
          >
            <DataMask>{formatCurrency(balance, language)}</DataMask>
          </span>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>{t('common.date')}</TableHead>
              <TableHead>{t('common.type')}</TableHead>
              <TableHead>{t('common.category')}</TableHead>
              <TableHead>{t('common.description')}</TableHead>
              <TableHead className="text-right">{t('common.value')}</TableHead>
              <TableHead className="text-right">{t('common.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-slate-500"
                >
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              sortedEntries.map((entry) => (
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
                          ? t('analytics.revenue')
                          : t('analytics.expenses')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
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
                  <TableCell className="text-right">
                    {entry.status === 'cleared' || entry.status === 'paid' ? (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {t('common.paid')}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-50 text-yellow-800 border-yellow-200"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {t('common.pending')}
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
