import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { translateStatus, formatCurrency, formatDate } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export default function Invoices() {
  const { t, locale } = useDbTranslations()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchInvoices = async () => {
      const { data } = await supabase
        .from('invoices')
        .select('id, invoice_number, date, amount, status')
        .order('date', { ascending: false })
        .limit(50)
      if (isMounted) {
        setInvoices(data || [])
        setLoading(false)
      }
    }
    fetchInvoices()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('invoices.title', 'Invoices')}
        </h1>
        <p className="text-slate-500">
          {t('invoices.subtitle', 'Manage your invoices')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('invoices.list', 'Invoice List')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="border rounded-md overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_number', 'Number')}
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_date', 'Date')}
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_amount', 'Amount')}
                    </th>
                    <th className="px-4 py-3 font-medium text-slate-500">
                      {t('table_header_status', 'Status')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-slate-500"
                      >
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
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(invoice.date, locale)}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {formatCurrency(invoice.amount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              invoice.status === 'paid'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize font-medium"
                          >
                            {translateStatus(invoice.status, t)}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
