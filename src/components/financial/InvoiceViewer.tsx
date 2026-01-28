import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Invoice, User } from '@/lib/types'
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
          {/* Header */}
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">
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
                {t('invoice_viewer.title')}
              </h2>
              <div className="mt-4 space-y-1 text-sm">
                <div className="flex justify-end gap-4">
                  <span className="font-semibold text-gray-600">
                    {t('invoice_viewer.invoice_no')}:
                  </span>
                  <span>{invoice.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-end gap-4">
                  <span className="font-semibold text-gray-600">
                    {t('invoice_viewer.date')}:
                  </span>
                  <span>{format(new Date(invoice.date), 'MMM dd, yyyy')}</span>
                </div>
                {/* Mock Due Date */}
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

          {/* Bill To */}
          <div className="mb-10 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {t('invoice_viewer.bill_to')}
              </h3>
              {receiver ? (
                <div className="text-sm space-y-1">
                  <p className="font-bold text-lg">{receiver.name}</p>
                  <p className="text-gray-600">{receiver.companyName || ''}</p>
                  <p className="text-gray-600">
                    {receiver.address || 'Address not on file'}
                  </p>
                  <p className="text-gray-600">{receiver.email}</p>
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  Client details not available
                </p>
              )}
            </div>
            {/* Optional Ship To or other details could go here */}
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase">
                    {t('invoice_viewer.item')} /{' '}
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
                {/* Mocking a single line item since Invoice type aggregates amount */}
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-800">
                      {invoice.description}
                    </p>
                    {/* Optional: Break down if invoice had items array */}
                  </td>
                  <td className="py-4 px-4 text-right">1</td>
                  <td className="py-4 px-4 text-right">
                    ${invoice.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right font-medium">
                    ${invoice.amount.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('invoice_viewer.subtotal')}:</span>
                <span>${invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (0%):</span>
                <span>$0.00</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>{t('invoice_viewer.total')}:</span>
                <span>${invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer / Terms */}
          <div className="text-sm text-gray-500 border-t pt-6">
            <h4 className="font-bold text-gray-700 mb-1">
              {t('invoice_viewer.notes')}
            </h4>
            <p className="mb-4">{t('invoice_viewer.thank_you')}</p>
            <h4 className="font-bold text-gray-700 mb-1">
              {t('invoice_viewer.terms')}
            </h4>
            <p>
              Please pay within 14 days. Checks payable to{' '}
              {sender?.companyName || 'COREPM'}.
            </p>
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
