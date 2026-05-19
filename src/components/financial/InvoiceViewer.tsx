import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Invoice } from '@/lib/types'
import { format, isValid } from 'date-fns'
import { Printer } from 'lucide-react'
import useFinancialStore from '@/stores/useFinancialStore'

export function InvoiceViewer({
  open,
  onOpenChange,
  invoice,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoice: Invoice | null
}) {
  const { formatAppCurrency } = useFinancialStore()
  if (!invoice) return null

  const formatDateSafe = (d?: string) => {
    if (!d) return ''
    const dt = new Date(d)
    return isValid(dt) ? format(dt, 'MM/dd/yyyy') : ''
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white text-black p-0 overflow-hidden shadow-2xl sm:rounded-xl">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center print:hidden">
          <DialogTitle className="text-lg text-slate-800">
            Invoice{' '}
            {invoice.id ? `#${invoice.id.split('-')[0].substring(0, 8)}` : ''}
          </DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
          </div>
        </div>

        <div className="p-10 space-y-8 print:p-0 print:m-0 bg-white max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                INVOICE
              </h2>
              <p className="text-sm text-slate-500 font-medium">
                #{invoice.id ? invoice.id.split('-')[0].substring(0, 8) : 'N/A'}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-sm">
                <span className="font-semibold text-slate-500 mr-2">
                  Issue Date:
                </span>
                <span className="font-medium text-slate-800">
                  {formatDateSafe(invoice.date)}
                </span>
              </div>
              {invoice.dueDate && (
                <div className="text-sm">
                  <span className="font-semibold text-slate-500 mr-2">
                    Due Date:
                  </span>
                  <span className="font-medium text-red-600">
                    {formatDateSafe(invoice.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 border-t border-b border-slate-100 py-8">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                From (Sender)
              </p>
              <div>
                <p className="font-bold text-slate-800 text-lg">
                  {invoice.fromName || 'N/A'}
                </p>
                {invoice.fromEmail && (
                  <p className="text-slate-600 text-sm mt-1">
                    {invoice.fromEmail}
                  </p>
                )}
                {invoice.fromPhone && (
                  <p className="text-slate-600 text-sm">{invoice.fromPhone}</p>
                )}
                {invoice.fromAddress && (
                  <p className="text-slate-600 text-sm mt-1">
                    {invoice.fromAddress}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Bill To (Recipient)
              </p>
              <div>
                <p className="font-bold text-slate-800 text-lg">
                  {invoice.toName || 'N/A'}
                </p>
                {invoice.toEmail && (
                  <p className="text-slate-600 text-sm mt-1">
                    {invoice.toEmail}
                  </p>
                )}
                {invoice.toPhone && (
                  <p className="text-slate-600 text-sm">{invoice.toPhone}</p>
                )}
                {invoice.toAddress && (
                  <p className="text-slate-600 text-sm mt-1">
                    {invoice.toAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {invoice.description && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Reference / General Description
              </p>
              <p className="text-slate-800 text-sm font-medium">
                {invoice.description}
              </p>
            </div>
          )}

          {/* Items Table */}
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold text-slate-700">
                    Service / Item Description
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-700 text-right w-24">
                    Qty
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-700 text-right w-32">
                    Unit Price
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-700 text-right w-32">
                    Total
                  </th>
                  <th className="py-3 px-4 font-semibold text-slate-700 text-center w-24 print:hidden">
                    Origin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item: any, idx: number) => (
                    <tr key={idx} className="bg-white">
                      <td className="py-4 px-4 text-slate-800 font-medium">
                        {item.description || '-'}
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-right">
                        {item.quantity || 1}
                      </td>
                      <td className="py-4 px-4 text-slate-600 text-right">
                        {formatAppCurrency(item.unitPrice || 0)}
                      </td>
                      <td className="py-4 px-4 text-slate-800 font-medium text-right">
                        {formatAppCurrency(item.total || 0)}
                      </td>
                      <td className="py-4 px-4 text-center print:hidden">
                        {item.sourceId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-blue-600 hover:text-blue-800"
                            onClick={() =>
                              window.open(
                                item.sourceType === 'booking'
                                  ? `/calendar`
                                  : `/tasks`,
                                '_blank',
                              )
                            }
                            title={`Trace back to ${item.sourceType || 'source'}`}
                          >
                            Trace
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td className="py-4 px-4 text-slate-800 font-medium">
                      General Services / Single Charge
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-right">1</td>
                    <td className="py-4 px-4 text-slate-600 text-right">
                      {formatAppCurrency(invoice.amount || 0)}
                    </td>
                    <td className="py-4 px-4 text-slate-800 font-medium text-right">
                      {formatAppCurrency(invoice.amount || 0)}
                    </td>
                    <td className="py-4 px-4 text-center text-xs text-slate-400 print:hidden">
                      N/A
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end pt-4">
            <div className="w-64 space-y-3">
              <div className="flex justify-between items-center border-t-2 border-slate-800 pt-3">
                <span className="font-bold text-slate-700">TOTAL</span>
                <span className="font-black text-xl text-trust-blue">
                  {formatAppCurrency(invoice.amount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-8 border-t border-slate-100 mt-8">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Notes / Terms / Traceability
              </p>
              <div className="bg-slate-50 p-4 rounded border border-slate-100 font-mono text-xs text-slate-600 whitespace-pre-wrap">
                {invoice.notes}
              </div>
            </div>
          )}

          <div className="pt-8 text-center text-xs text-slate-400">
            <p>
              Electronically generated document. Thank you for your business.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
