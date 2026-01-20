import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Advertiser, Advertisement } from '@/lib/types'
import { Printer } from 'lucide-react'
import { format } from 'date-fns'

interface InvoiceGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  advertiser: Advertiser
  ad: Advertisement
}

export function InvoiceGenerator({
  open,
  onOpenChange,
  advertiser,
  ad,
}: InvoiceGeneratorProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            Generated invoice for advertisement services.
          </DialogDescription>
        </DialogHeader>

        <div
          className="border p-8 rounded-md bg-white text-black print:border-none print:p-0"
          id="invoice-content"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-navy">COREPM</h1>
              <p className="text-sm text-gray-500">
                123 Platform Way
                <br />
                Tech City, FL 32801
                <br />
                invoicing@corepm.com
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold uppercase tracking-widest text-gray-400">
                Invoice
              </h2>
              <p className="text-sm font-medium mt-1">#{ad.id.slice(-6)}</p>
              <p className="text-xs text-gray-500">
                Date: {format(new Date(), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">
              Bill To:
            </h3>
            <p className="font-bold">{advertiser.name}</p>
            <p className="text-sm text-gray-600">{advertiser.address}</p>
            <p className="text-sm text-gray-600">{advertiser.email}</p>
            <p className="text-sm text-gray-600">{advertiser.phone}</p>
          </div>

          {/* Items */}
          <table className="w-full mb-8">
            <thead className="border-b-2 border-gray-200">
              <tr>
                <th className="text-left py-2 font-semibold text-sm">
                  Description
                </th>
                <th className="text-right py-2 font-semibold text-sm">
                  Period
                </th>
                <th className="text-right py-2 font-semibold text-sm">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4">
                  <p className="font-medium">{ad.title}</p>
                  <p className="text-xs text-gray-500">
                    Placement: {ad.placement || 'Footer'}
                  </p>
                </td>
                <td className="text-right py-4 text-sm">
                  {ad.startDate
                    ? format(new Date(ad.startDate), 'MMM dd')
                    : 'N/A'}{' '}
                  -{' '}
                  {ad.endDate ? format(new Date(ad.endDate), 'MMM dd') : 'N/A'}
                  <br />
                  <span className="text-xs text-gray-500 capitalize">
                    {ad.validity} Plan
                  </span>
                </td>
                <td className="text-right py-4 font-medium">
                  ${ad.price?.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-1/3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${ad.price?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>${ad.price?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-xs text-gray-400">
            <p>Thank you for your business!</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Print Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
