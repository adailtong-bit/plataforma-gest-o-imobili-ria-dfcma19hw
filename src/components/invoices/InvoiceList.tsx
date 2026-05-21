import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit } from 'lucide-react'
import { translateStatus, formatCurrency, formatDate } from '@/lib/utils'

interface InvoiceListProps {
  invoices: any[]
  loading: boolean
  onEdit: (invoice: any) => void
  locale: string
  t: (key: string, fallback: string) => string
}

export function InvoiceList({
  invoices,
  loading,
  onEdit,
  locale,
  t,
}: InvoiceListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('table_header_number', 'Number')}
            </th>
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('table_header_recipient', 'Recipient')}
            </th>
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('table_header_date', 'Date')}
            </th>
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('table_header_due_date', 'Due Date')}
            </th>
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('table_header_amount', 'Amount')}
            </th>
            <th className="px-4 py-3 font-medium text-slate-500">
              {t('table_header_status', 'Status')}
            </th>
            <th className="px-4 py-3 font-medium text-slate-500 text-right">
              {t('common.actions', 'Actions')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {invoices.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                {t('common.no_data', 'No data available')}
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {invoice.invoice_number || '-'}
                </td>
                <td className="px-4 py-3 text-slate-900">
                  <div className="font-medium">{invoice.to_name || '-'}</div>
                  {invoice.to_email && (
                    <div className="text-xs text-slate-500">
                      {invoice.to_email}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatDate(invoice.date, locale)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {invoice.due_date
                    ? formatDate(invoice.due_date, locale)
                    : '-'}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {formatCurrency(invoice.amount || 0)}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      invoice.status === 'paid' ? 'default' : 'secondary'
                    }
                    className="capitalize font-medium"
                  >
                    {translateStatus(invoice.status, t)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(invoice)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
