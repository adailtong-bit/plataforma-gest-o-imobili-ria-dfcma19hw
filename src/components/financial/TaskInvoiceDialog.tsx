import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CurrencyInput } from '@/components/ui/currency-input'
import { useState } from 'react'
import useFinancialStore from '@/stores/useFinancialStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useAuthStore from '@/stores/useAuthStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Invoice } from '@/lib/types'

interface TaskInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTask?: any
}

export function TaskInvoiceDialog({
  open,
  onOpenChange,
  initialTask,
}: TaskInvoiceDialogProps) {
  const { addInvoice } = useFinancialStore()
  const { properties } = usePropertyStore()
  const { currentUser } = useAuthStore()
  const { toast } = useToast()
  const { t } = useLanguageStore()

  const [description, setDescription] = useState(
    initialTask ? `Invoice for ${initialTask.title}` : '',
  )
  const [amount, setAmount] = useState(initialTask ? initialTask.price || 0 : 0)
  const [propertyId, setPropertyId] = useState(
    initialTask ? initialTask.propertyId : '',
  )
  const [billTo, setBillTo] = useState('')

  const handleSave = () => {
    if (!description || !amount || !propertyId) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      description,
      amount,
      status: 'pending',
      date: new Date().toISOString(),
      fromId: currentUser.id,
      toId: billTo || 'owner', // Default or selected
      propertyId,
      type: 'generic',
    }

    addInvoice(newInvoice)
    toast({ title: t('common.success'), description: 'Invoice created.' })
    onOpenChange(false)
    setDescription('')
    setAmount(0)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('invoices.create_new')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t('common.property')}</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                {properties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>{t('common.description')}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('common.value')}</Label>
            <CurrencyInput value={amount} onChange={setAmount} />
          </div>
          <div className="grid gap-2">
            <Label>{t('invoices.bill_to')}</Label>
            <Input value={billTo} onChange={(e) => setBillTo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
