import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Invoice } from '@/lib/types'
import { Printer, Download, X } from 'lucide-react'
import { format } from 'date-fns'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import { useMemo } from 'react'

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
  const { t } = useLanguageStore()
  const { allUsers, currentUser } = useAuthStore()

  const handlePrint = () => {
    window.print()
  }

  // Resolve sender and receiver details
  const sender = useMemo(() => {
    if (!invoice?.fromId) return currentUser
    return allUsers.find((u) => u.id === invoice.fromId) || currentUser
  }, [invoice, allUsers, currentUser])

  const receiver = useMemo(() => {
    if (!invoice?.toId) return null
    return allUsers.find((u) => u.id === invoice.toId)
  }, [invoice, allUsers])

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  })

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('invoice_viewer.title')}</DialogTitle>
          <DialogDescription>
            {t('invoice_viewer.invoice_no')} {invoice.id}
          </DialogDescription>
        </DialogHeader>

        <div
          className="border p-8 rounded-md bg-white text-black print:border-none print:p-0 font-sans"
          id="invoice-content"
        >
          {/* US Standard Invoice Header */}
          <div className="flex justify-between items-start mb-8 border-b-2 border-gray-100 pb-6">
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold text-navy mb-2 tracking-tight">
                {sender?.companyName || 'COREPM Property Management'}
              </h1>
              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  {sender?.address || '123 Business Rd, Tech City, FL 32801'}
                </p>
                <p>{sender?.email}</p>
                <p>{sender?.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-light text-gray-300 uppercase tracking-widest">
                INVOICE
              </h2>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-end gap-4">
                  <span className="font-semibold text-gray-600">
                    {t('invoice_viewer.invoice_no')}:
                  </span>
                  <span className="font-mono text-gray-800">
                    {invoice.id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-end gap-4">
                  <span className="font-semibold text-gray-600">
                    {t('invoice_viewer.date')}:
                  </span>
                  <span>{format(new Date(invoice.date), 'MMM dd, yyyy')}</span>
                </div>
                {/* Due Date (Standard Net 14 or Net 30) */}
                <div className="flex justify-end gap-4">
                  <span className="font-semibold text-gray-600">
                    {t('invoice_viewer.due_date')}:
                  </span>
                  <span>
                    {format(
                      new Date(
                        new Date(invoice.date).getTime() + 14 * 86400000,
                      ),
                      'MMM dd, yyyy',
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To & Ship To Grid */}
          <div className="mb-10 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {t('invoice_viewer.bill_to')}
              </h3>
              {receiver ? (
                <div className="text-sm space-y-1 text-gray-800">
                  <p className="font-bold text-lg">{receiver.name}</p>
                  {receiver.companyName && (
                    <p className="font-medium">{receiver.companyName}</p>
                  )}
                  <p>{receiver.address || 'Address not on file'}</p>
                  <p className="text-gray-500">{receiver.email}</p>
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  Client details not available
                </p>
              )}
            </div>
            {/* Can add Ship To here if needed, keeping it balanced for layout */}
            <div className="text-right">
              {/* Optional: Reference PO or other metadata */}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">
                    {t('invoice_viewer.description')}
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right w-24">
                    {t('invoice_viewer.quantity')}
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right w-32">
                    {t('invoice_viewer.rate')}
                  </th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase text-right w-32">
                    {t('invoice_viewer.amount')}
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {/* Aggregate single item for this view, or map items if available */}
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-800">
                      {invoice.description}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-right text-gray-600">1</td>
                  <td className="py-4 px-4 text-right text-gray-600">
                    {currencyFormatter.format(invoice.amount)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium text-gray-800">
                    {currencyFormatter.format(invoice.amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('invoice_viewer.subtotal')}:</span>
                <span>{currencyFormatter.format(invoice.amount)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('common.taxes')} (0%):</span>
                <span>$0.00</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3 flex justify-between text-xl font-bold text-navy">
                <span>{t('invoice_viewer.total')}:</span>
                <span>{currencyFormatter.format(invoice.amount)}</span>
              </div>
            </div>
          </div>

          {/* Footer / Terms */}
          <div className="text-sm text-gray-500 border-t pt-6 bg-gray-50/50 p-4 rounded-b-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-gray-700 mb-1">
                  {t('invoice_viewer.notes')}
                </h4>
                <p>{t('invoice_viewer.thank_you')}</p>
              </div>
              <div className="text-right">
                <h4 className="font-bold text-gray-700 mb-1">
                  {t('invoice_viewer.terms')}
                </h4>
                <p>
                  Please pay within 14 days. Checks payable to{' '}
                  {sender?.companyName || 'COREPM'}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 print:hidden">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" /> {t('invoice_viewer.close')}
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> {t('invoice_viewer.download')}
          </Button>
          <Button onClick={handlePrint} className="bg-trust-blue gap-2">
            <Printer className="h-4 w-4" /> {t('invoice_viewer.print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
