import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import { Invoice } from '@/lib/types'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  description: string
  invoiceId?: string
  onSuccess: () => void
}

export function PaymentModal({
  open,
  onOpenChange,
  amount,
  description,
  invoiceId,
  onSuccess,
}: PaymentModalProps) {
  const { financialSettings, updateInvoice, financials } = useFinancialStore()
  const { toast } = useToast()
  const [selectedGateway, setSelectedGateway] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<
    'select' | 'processing' | 'success'
  >('select')

  const availableGateways = [
    {
      id: 'stripe',
      name: 'Stripe (Credit Card)',
      enabled: financialSettings.gateways?.stripe?.enabled,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      enabled: financialSettings.gateways?.paypal?.enabled,
    },
    {
      id: 'mercadoPago',
      name: 'Mercado Pago',
      enabled: financialSettings.gateways?.mercadoPago?.enabled,
    },
  ].filter((g) => g.enabled)

  // Default fallback if no gateway configured
  if (availableGateways.length === 0) {
    availableGateways.push({
      id: 'manual',
      name: 'Manual Transfer / Cash',
      enabled: true,
    })
  }

  const handlePayment = () => {
    if (!selectedGateway) return

    setPaymentStep('processing')
    setIsProcessing(true)

    // Simulate API call to gateway
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentStep('success')

      if (invoiceId) {
        const invoice = financials.invoices.find((i) => i.id === invoiceId)
        if (invoice) {
          updateInvoice({ ...invoice, status: 'paid' })
        }
      }

      toast({
        title: 'Payment Successful',
        description: `Transaction completed via ${selectedGateway}.`,
      })

      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        setPaymentStep('select') // Reset for next time
      }, 1500)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {paymentStep === 'select' && (
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between font-bold text-lg border-b pb-2">
              <span>Total to Pay:</span>
              <span>{formatCurrency(amount)}</span>
            </div>

            <div className="space-y-3">
              <Label>Select Payment Method</Label>
              <RadioGroup
                value={selectedGateway}
                onValueChange={setSelectedGateway}
              >
                {availableGateways.map((gateway) => (
                  <div
                    key={gateway.id}
                    className="flex items-center space-x-2 border p-3 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <RadioGroupItem value={gateway.id} id={gateway.id} />
                    <Label
                      htmlFor={gateway.id}
                      className="flex-1 cursor-pointer flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      {gateway.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-trust-blue" />
            <p className="text-muted-foreground">Processing payment...</p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in" />
            <p className="font-semibold text-lg">Payment Confirmed!</p>
          </div>
        )}

        <DialogFooter>
          {paymentStep === 'select' && (
            <Button
              onClick={handlePayment}
              disabled={!selectedGateway}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Pay {formatCurrency(amount)}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
