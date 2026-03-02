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
  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white text-black p-0 overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <DialogTitle>Invoice Details</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-trust-blue">INVOICE</h2>
              <p className="text-sm text-slate-500 mt-1">#{invoice.id}</p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">Date</p>
              <p>{format(new Date(invoice.date), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
          <div className="border-t border-b py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-500 mb-1">Bill To:</p>
                <p className="font-medium">Client / Property Owner</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-500 mb-1">Status:</p>
                <p className="uppercase font-bold text-slate-800">
                  {invoice.status}
                </p>
              </div>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-semibold text-slate-600">
                  Description
                </th>
                <th className="text-right py-2 font-semibold text-slate-600">
                  Amount
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
                  Total
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
