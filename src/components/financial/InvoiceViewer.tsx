import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Invoice } from '@/lib/types'
import { format } from 'date-fns'
import { Download, Printer } from 'lucide-react'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'

export function InvoiceViewer({
  open,
  onOpenChange,
  invoice,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}) {
  const { formatCurrency } = useFinancialStore()
  const { t } = useLanguageStore()
  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white text-black p-0 overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <DialogTitle>
            {t('invoices.invoice_viewer.title') || 'Detalhes da Fatura'}
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />{' '}
              {t('invoices.invoice_viewer.print') || 'Imprimir'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />{' '}
              {t('invoices.invoice_viewer.download') || 'Baixar PDF'}
            </Button>
          </div>
        </div>
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-trust-blue">
                {t('common.invoices')?.toUpperCase() || 'FATURA'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">#{invoice.id}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{t('common.date') || 'Data'}</p>
              <p>{format(new Date(invoice.date), 'dd/MM/yyyy')}</p>
            </div>
          </div>
          <div className="border-t border-b py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-500 mb-1">
                  {t('invoices.bill_to') || 'Faturar Para:'}
                </p>
                <p className="font-medium">
                  {t('roles.property_owner') || 'Cliente / Proprietário'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-500 mb-1">
                  {t('common.status') || 'Status:'}
                </p>
                <p className="uppercase font-bold text-slate-800">
                  {invoice.status === 'paid'
                    ? t('common.paid') || 'Pago'
                    : t('common.pending') || 'Pendente'}
                </p>
              </div>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-semibold text-slate-600">
                  {t('common.description') || 'Descrição'}
                </th>
                <th className="text-right py-2 font-semibold text-slate-600">
                  {t('common.value') || 'Valor'}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 text-slate-800">{invoice.description}</td>
                <td className="py-4 text-right font-medium">
                  {formatCurrency(invoice.amount)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-800">
                <td className="py-4 text-right font-bold text-slate-600">
                  {t('common.total') || 'Total'}
                </td>
                <td className="py-4 text-right font-bold text-lg text-trust-blue">
                  {formatCurrency(invoice.amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
