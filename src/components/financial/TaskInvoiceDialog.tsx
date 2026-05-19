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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const { currentUser, allUsers } = useAuthStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [form, setForm] = useState({
    description: '',
    amount: '',
    fromId: '',
    toId: '',
  })

  useEffect(() => {
    if (task && open) {
      let amt = 0
      let desc = `Invoice for ${task.title}`
      const role = currentUser?.role

      if (
        ['platform_owner', 'software_tenant', 'internal_user'].includes(
          role as string,
        )
      ) {
        amt = task.price || 0
        desc = `PM Invoice to Owner for ${task.title}`
      } else if (role === 'partner') {
        amt = task.laborCost || 0
        desc = `Partner Invoice to PM for ${task.title}`
      } else if (role === 'partner_employee') {
        amt = task.teamMemberPayout || 0
        desc = `Team Member Invoice to Partner for ${task.title}`
      } else if (role === 'property_owner') {
        amt = task.price || 0
        desc = `Owner Invoice record for ${task.title}`
      }

      setForm({
        description: desc,
        amount: amt.toString(),
        fromId: '',
        toId: '',
      })
    } else if (open && !task) {
      setForm({ description: '', amount: '', fromId: '', toId: '' })
    }
  }, [task, open, currentUser])

  const handleSave = () => {
    if (!form.description || !form.amount || !form.fromId || !form.toId) {
      toast({
        title: t('common.error') || 'Error',
        description:
          t('common.fill_all_fields') ||
          'Please fill in all fields including Payee and Payer',
        variant: 'destructive',
      })
      return
    }

    if (form.fromId === form.toId) {
      toast({
        title: 'Validation Error',
        description:
          'Payee and Payer must be distinct entities to prevent self-billing.',
        variant: 'destructive',
      })
      return
    }

    const invoiceId = crypto.randomUUID
      ? crypto.randomUUID()
      : '00000000-0000-0000-0000-000000000000'

    const totalAmount = Number(form.amount)

    const partnerAmount = task?.laborCost || 0
    const pmCommission = totalAmount - partnerAmount

    if (task?.propertyId) {
      addLedgerEntry({
        propertyId: task.propertyId,
        date: new Date().toISOString(),
        type: 'expense',
        category: task.type === 'cleaning' ? 'cleaning' : 'maintenance',
        amount: totalAmount,
        description: `Invoice: ${form.description}`,
        status: 'pending',
        costType: 'variable',
        referenceId: task.id,
        invoiceId,
      } as any)

      if (pmCommission > 0) {
        addLedgerEntry({
          propertyId: 'none',
          date: new Date().toISOString(),
          type: 'income',
          category: 'commission',
          amount: pmCommission,
          description: `PM Commission for: ${task.title}`,
          status: 'pending',
          costType: 'variable',
          referenceId: task.id,
          invoiceId,
        } as any)
      }
    }

    addInvoice({
      id: invoiceId,
      fromId: form.fromId,
      toId: form.toId,
      description: form.description,
      amount: totalAmount,
      status: 'pending',
      date: new Date().toISOString(),
      propertyId: task?.propertyId,
      bookingId: task?.bookingId,
      type: 'generic',
      items: [
        {
          description: form.description,
          quantity: 1,
          unitPrice: totalAmount,
          total: totalAmount,
          sourceId: task?.id,
          sourceType: 'task',
        },
      ],
      notes: `Generated from Task ID: ${task?.id}\nTraceability Engine: Auditable & Locked.`,
    })

    toast({
      title:
        t('financial.invoice_generated') || 'Invoice Generated and Accounted',
    })
    onOpenChange(false)
    setForm({ description: '', amount: '' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('automation.generate_invoice') || 'Generate Task Invoice'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('common.description') || 'Description'}</Label>
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
                'Total Amount (Charged from Owner)'}
            </Label>
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Billed By (Payee)</Label>
            <Select
              value={form.fromId}
              onValueChange={(v) => setForm({ ...form, fromId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payee" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Billed To (Payer)</Label>
            <Select
              value={form.toId}
              onValueChange={(v) => setForm({ ...form, toId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Payer" />
              </SelectTrigger>
              <SelectContent>
                {allUsers.map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {task?.laborCost && (
            <div className="text-xs text-muted-foreground bg-slate-50 p-2 rounded-md border mt-2">
              <p>
                {t('financial.partner_cost') || 'Partner Cost:'} $
                {task.laborCost}
              </p>
              <p>
                {t('financial.calculated_pm_commission') ||
                  'Calculated PM Commission:'}{' '}
                ${Math.max(0, Number(form.amount) - task.laborCost)}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button onClick={handleSave}>
            {t('financial.generate_account') || 'Generate & Account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
