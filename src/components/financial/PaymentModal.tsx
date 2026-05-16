import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, Banknote, Landmark } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import useLanguageStore from '@/stores/useLanguageStore'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  description: string
  onSuccess: () => void
}

export function PaymentModal({
  open,
  onOpenChange,
  amount,
  description,
  onSuccess,
}: PaymentModalProps) {
  const { toast } = useToast()
  const { language, t } = useLanguageStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      onSuccess()
      onOpenChange(false)
      toast({
        title: t('financial.payment_successful') || 'Pagamento Realizado',
        description: `${t('financial.transaction_id') || 'ID da Transação:'} 123456789`,
      })
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t('financial.secure_payment') || 'Pagamento Seguro'}
          </DialogTitle>
          <DialogDescription>
            {t('financial.complete_payment_for') || 'Concluir pagamento de:'}{' '}
            <span className="font-semibold">{description}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(amount, language)}
          </p>
        </div>

        <Tabs defaultValue="card" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card">
              <CreditCard className="h-4 w-4 mr-2" />{' '}
              {t('financial.card') || 'Cartão'}
            </TabsTrigger>
            <TabsTrigger value="bank">
              <Landmark className="h-4 w-4 mr-2" />{' '}
              {t('financial.bank') || 'Banco'}
            </TabsTrigger>
            <TabsTrigger value="cash">
              <Banknote className="h-4 w-4 mr-2" />{' '}
              {t('common.other') || 'Outro'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label>{t('financial.card_number') || 'Número do Cartão'}</Label>
              <Input placeholder="0000 0000 0000 0000" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('financial.expiry') || 'Validade'}</Label>
                <Input placeholder="MM/YY" />
              </div>
              <div className="grid gap-2">
                <Label>{t('financial.cvc') || 'CVC'}</Label>
                <Input placeholder="123" />
              </div>
            </div>
            <Button
              className="w-full bg-trust-blue"
              onClick={handlePay}
              disabled={isProcessing}
            >
              {isProcessing
                ? t('common.loading') || 'Processando...'
                : t('financial.pay_now') || 'Pagar Agora'}
            </Button>
          </TabsContent>

          <TabsContent
            value="bank"
            className="pt-4 text-center text-sm text-muted-foreground"
          >
            {t('financial.bank_transfer_details') ||
              'Detalhes da transferência bancária (PIX/TED) aparecerão aqui.'}
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={handlePay}
            >
              {t('financial.simulate_transfer') || 'Simular Transferência'}
            </Button>
          </TabsContent>

          <TabsContent
            value="cash"
            className="pt-4 text-center text-sm text-muted-foreground"
          >
            {t('financial.record_manual_payment') ||
              'Registrar pagamento manual (Dinheiro/Cheque).'}
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={handlePay}
            >
              {t('financial.record_payment') || 'Registrar Pagamento'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
