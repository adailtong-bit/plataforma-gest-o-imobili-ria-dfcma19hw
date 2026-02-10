import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Invoice } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'
import { Printer, Download } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { DataMask } from '@/components/DataMask'

interface InvoiceViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}

export function InvoiceViewer({
  open,
  onOpenChange,
  invoice,
}: InvoiceViewerProps) {
  const { t, language } = useLanguageStore()

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white text-black">
        <DialogHeader>
          <DialogTitle>{t('invoices.invoice_viewer.title')}</DialogTitle>
        </DialogHeader>
        <div className="p-6 border rounded-md shadow-sm bg-white">
          <div className="flex justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-navy">
                INVOICE
              </h2>
              <p className="text-sm text-slate-500 font-medium">COREPM Inc.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">
                {t('invoices.invoice_viewer.invoice_no')}
              </p>
              <p className="font-bold text-lg">
                <DataMask>#{invoice.id.slice(-6).toUpperCase()}</DataMask>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {t('invoices.invoice_viewer.date')}:{' '}
                {formatDate(invoice.date, language)}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm text-slate-500 mb-1">
              {t('invoices.invoice_viewer.bill_to')}:
            </p>
            <p className="font-bold text-lg">
              <DataMask>Client / Owner</DataMask>
            </p>
          </div>

          <div className="border-t border-b py-4 mb-4">
            <div className="grid grid-cols-4 font-bold text-sm mb-2 text-slate-900">
              <div className="col-span-2">
                {t('invoices.invoice_viewer.description')}
              </div>
              <div className="text-right">
                {t('invoices.invoice_viewer.quantity')}
              </div>
              <div className="text-right">
                {t('invoices.invoice_viewer.amount')}
              </div>
            </div>
            <div className="grid grid-cols-4 text-sm text-slate-700">
              <div className="col-span-2">
                <DataMask>{invoice.description}</DataMask>
              </div>
              <div className="text-right">1</div>
              <div className="text-right font-medium">
                <DataMask>{formatCurrency(invoice.amount, language)}</DataMask>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('invoices.invoice_viewer.subtotal')}</span>
                <span>
                  <DataMask>
                    {formatCurrency(invoice.amount, language)}
                  </DataMask>
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg text-slate-900">
                <span>{t('invoices.invoice_viewer.total')}</span>
                <span>
                  <DataMask>
                    {formatCurrency(invoice.amount, language)}
                  </DataMask>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t text-center text-sm text-slate-500">
            <p className="font-medium">
              {t('invoices.invoice_viewer.thank_you')}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />{' '}
            {t('invoices.invoice_viewer.print')}
          </Button>
          <Button className="bg-trust-blue">
            <Download className="h-4 w-4 mr-2" />{' '}
            {t('invoices.invoice_viewer.download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
