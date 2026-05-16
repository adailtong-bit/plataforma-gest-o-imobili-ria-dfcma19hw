import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useFinancialStore from '@/stores/useFinancialStore'
import useAuthStore from '@/stores/useAuthStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { Task } from '@/lib/types'

export function TaskInvoiceDialog({
  task,
  open,
  onOpenChange,
}: {
  task?: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addInvoice, addLedgerEntry } = useFinancialStore()
  const { currentUser } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [form, setForm] = useState({ description: '', amount: '' })

  useEffect(() => {
    if (task && open) {
      let amt = 0
      let desc = `Fatura para ${task.title}`
      const role = currentUser?.role

      if (
        ['platform_owner', 'software_tenant', 'internal_user'].includes(
          role as string,
        )
      ) {
        amt = task.price || 0
        desc = `Fatura PM para Proprietário por ${task.title}`
      } else if (role === 'partner') {
        amt = task.laborCost || 0
        desc = `Fatura do Parceiro para PM por ${task.title}`
      } else if (role === 'partner_employee') {
        amt = task.teamMemberPayout || 0
        desc = `Fatura do Membro da Equipe para Parceiro por ${task.title}`
      } else if (role === 'property_owner') {
        amt = task.price || 0
        desc = `Registro de Fatura do Proprietário por ${task.title}`
      }

      setForm({ description: desc, amount: amt.toString() })
    } else if (open && !task) {
      setForm({ description: '', amount: '' })
    }
  }, [task, open, currentUser])

  const handleSave = () => {
    if (!form.description || !form.amount) {
      toast({
        title: t('common.error') || 'Erro',
        description:
          t('common.fill_all_fields') || 'Por favor preencha todos os campos',
        variant: 'destructive',
      })
      return
    }

    const invoiceId = `inv-${Date.now()}`
    const totalAmount = Number(form.amount)

    const partnerAmount = task?.laborCost || 0
    const pmCommission = totalAmount - partnerAmount

    if (task?.propertyId) {
      addLedgerEntry({
        id: `ledg-exp-${Date.now()}`,
        propertyId: task.propertyId,
        date: new Date().toISOString(),
        type: 'expense',
        category: task.type === 'cleaning' ? 'cleaning' : 'maintenance',
        amount: totalAmount,
        description: `Invoice: ${form.description}`,
        status: 'pending',
        costType: 'variable',
        referenceId: invoiceId,
      } as any)

      if (pmCommission > 0) {
        addLedgerEntry({
          id: `ledg-inc-${Date.now()}`,
          propertyId: 'none',
          date: new Date().toISOString(),
          type: 'income',
          category: 'commission',
          amount: pmCommission,
          description: `PM Commission for: ${task.title}`,
          status: 'pending',
          costType: 'variable',
          referenceId: invoiceId,
        } as any)
      }
    }

    addInvoice({
      id: invoiceId,
      description: form.description,
      amount: totalAmount,
      status: 'pending',
      date: new Date().toISOString(),
      propertyId: task?.propertyId,
      bookingId: task?.bookingId,
      type: 'generic',
    })

    toast({
      title:
        t('financial.invoice_generated') || 'Fatura Gerada e Contabilizada',
    })
    onOpenChange(false)
    setForm({ description: '', amount: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('automation.generate_invoice') || 'Gerar Fatura da Tarefa'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('common.description') || 'Descrição'}</Label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>
              {t('financial.total_amount_charged') ||
                'Valor Total (Cobrado do Proprietário)'}
            </Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          {task?.laborCost && (
            <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded-md border mt-2">
              <p>
                {t('financial.partner_cost') || 'Custo do Parceiro:'} $
                {task.laborCost}
              </p>
              <p>
                {t('financial.calculated_pm_commission') ||
                  'Comissão PM Calculada:'}{' '}
                ${Math.max(0, Number(form.amount) - task.laborCost)}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel') || 'Cancelar'}
          </Button>
          <Button onClick={handleSave}>
            {t('financial.generate_account') || 'Gerar & Contabilizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
