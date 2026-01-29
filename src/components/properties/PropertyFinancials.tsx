import { useState } from 'react'
import {
  Property,
  Owner,
  Partner,
  FixedExpense,
  LedgerEntry,
} from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Edit2, Upload, FileCheck } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { PropertyLedger } from '@/components/financial/PropertyLedger'
import useFinancialStore from '@/stores/useFinancialStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useToast } from '@/hooks/use-toast'
import { setDate, getDaysInMonth, parseISO, addMonths } from 'date-fns'
import { FileUpload } from '@/components/ui/file-upload'
import useLanguageStore from '@/stores/useLanguageStore'

interface PropertyFinancialsProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
  owners: Owner[]
  partners: Partner[]
}

export function PropertyFinancials({
  data,
  onChange,
  canEdit,
  owners,
  partners,
}: PropertyFinancialsProps) {
  const { toast } = useToast()
  const { t } = useLanguageStore()
  const { properties, updateProperty } = usePropertyStore()
  const {
    ledgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
  } = useFinancialStore()

  // Local state for Fixed Expense Dialog
  const [openExpense, setOpenExpense] = useState(false)
  const [confirmActionOpen, setConfirmActionOpen] = useState(false)
  const [actionType, setActionType] = useState<'add' | 'edit'>('add')
  const [currentExpenseId, setCurrentExpenseId] = useState<string | null>(null)

  // Form State - Expanded for Contracts
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    accountNumber: '',
    amount: 0,
    paymentDate: '',
    receiptUrl: '',
    contractStartDate: '',
    contractEndDate: '',
    recurringValue: 0,
  })

  const currentProperty = properties.find((p) => p.id === data.id) || data
  const propertyEntries = ledgerEntries.filter((e) => e.propertyId === data.id)

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      provider: '',
      accountNumber: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      receiptUrl: '',
      contractStartDate: '',
      contractEndDate: '',
      recurringValue: 0,
    })
    setCurrentExpenseId(null)
    setActionType('add')
    setOpenExpense(true)
  }

  const handleOpenEdit = (expense: FixedExpense) => {
    const today = new Date()
    const daysInMonth = getDaysInMonth(today)
    const validDay = Math.min(expense.dueDay, daysInMonth)
    const estimatedDate = setDate(today, validDay).toISOString().split('T')[0]

    setFormData({
      name: expense.name,
      provider: expense.provider || '',
      accountNumber: expense.accountNumber || '',
      amount: expense.amount,
      paymentDate: estimatedDate,
      receiptUrl: '',
      contractStartDate: expense.contractStartDate || '',
      contractEndDate: expense.contractEndDate || '',
      recurringValue: expense.recurringValue || expense.amount,
    })
    setCurrentExpenseId(expense.id)
    setActionType('edit')
    setOpenExpense(true)
  }

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.amount ||
      !formData.provider ||
      !formData.paymentDate
    ) {
      toast({
        title: 'Error',
        description: t('common.required'),
        variant: 'destructive',
      })
      return false
    }
    return true
  }

  const handlePreSubmit = () => {
    if (!validateForm()) return
    if (actionType === 'add') {
      executeSave()
    } else {
      setConfirmActionOpen(true)
    }
  }

  const getNextDueDate = (currentDate: Date, fixedDay: number) => {
    const nextMonth = addMonths(currentDate, 1)
    const daysInNext = getDaysInMonth(nextMonth)
    const day = Math.min(fixedDay, daysInNext)
    return setDate(nextMonth, day)
  }

  const executeSave = () => {
    const parts = formData.paymentDate.split('-')
    const dueDay = parseInt(parts[2])
    const initialDate = new Date(formData.paymentDate)

    const expenseId = currentExpenseId || `fe-${Date.now()}`

    const expense: FixedExpense = {
      id: expenseId,
      name: formData.name,
      amount: formData.amount,
      dueDay: dueDay,
      frequency: 'monthly',
      provider: formData.provider,
      accountNumber: formData.accountNumber,
      contractStartDate: formData.contractStartDate,
      contractEndDate: formData.contractEndDate,
      recurringValue: formData.recurringValue || formData.amount,
    }

    let updatedExpenses = [...(currentProperty.fixedExpenses || [])]

    if (actionType === 'add') {
      updatedExpenses.push(expense)

      const isPaid = !!formData.receiptUrl

      const entry: LedgerEntry = {
        id: `auto-fe-${expense.id}-${Date.now()}`,
        propertyId: data.id,
        date: new Date().toISOString(),
        dueDate: initialDate.toISOString(),
        type: 'expense',
        category: expense.name,
        amount: expense.amount,
        description: `${expense.name} - ${expense.provider || ''}`,
        referenceId: expense.id,
        status: isPaid ? 'cleared' : 'pending',
        paymentDate: isPaid ? initialDate.toISOString() : undefined,
        attachments: formData.receiptUrl
          ? [{ name: 'Comprovante', url: formData.receiptUrl }]
          : [],
        payee: expense.provider, // Added payee
      }

      addLedgerEntry(entry)

      if (isPaid) {
        const nextDate = getNextDueDate(initialDate, dueDay)
        const nextEntry: LedgerEntry = {
          id: `auto-fe-${expense.id}-${Date.now() + 1}`,
          propertyId: data.id,
          date: new Date().toISOString(),
          dueDate: nextDate.toISOString(),
          type: 'expense',
          category: expense.name,
          amount: expense.amount,
          description: `${expense.name} - ${expense.provider || ''} (Auto)`,
          referenceId: expense.id,
          status: 'pending',
          payee: expense.provider, // Added payee
        }
        setTimeout(() => addLedgerEntry(nextEntry), 100)
      }

      toast({
        title: t('common.success'),
        description: 'Fixed expense created.',
      })
    } else {
      updatedExpenses = updatedExpenses.map((e) =>
        e.id === expense.id ? expense : e,
      )

      const pendingEntries = ledgerEntries.filter(
        (e) => e.referenceId === expense.id && e.status === 'pending',
      )

      pendingEntries.forEach((entry) => {
        const entryDate = parseISO(entry.dueDate || entry.date)
        const daysInMonth = getDaysInMonth(entryDate)
        const validDay = Math.min(dueDay, daysInMonth)
        const newDueDate = setDate(entryDate, validDay)

        const updatedEntry: LedgerEntry = {
          ...entry,
          category: expense.name,
          amount: expense.amount,
          description: `${expense.name} - ${expense.provider || ''}`,
          dueDate: newDueDate.toISOString(),
          payee: expense.provider, // Update payee
        }
        updateLedgerEntry(updatedEntry)
      })

      toast({
        title: t('common.success'),
        description: 'Fixed expense updated.',
      })
    }

    updateProperty({
      ...currentProperty,
      fixedExpenses: updatedExpenses,
    })

    setConfirmActionOpen(false)
    setOpenExpense(false)
  }

  const handleRemoveExpense = (id: string) => {
    const updatedExpenses = (currentProperty.fixedExpenses || []).filter(
      (e) => e.id !== id,
    )

    updateProperty({
      ...currentProperty,
      fixedExpenses: updatedExpenses,
    })

    const pendingEntries = ledgerEntries.filter(
      (e) => e.referenceId === id && e.status === 'pending',
    )
    pendingEntries.forEach((entry) => deleteLedgerEntry(entry.id))

    toast({
      title: t('common.removed'),
      description: 'Record deleted.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Financeiras</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>{t('common.owners')}</Label>
            <Select
              value={data.ownerId}
              onValueChange={(v) => onChange('ownerId', v)}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {owners.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Agente Responsável</Label>
            <Select
              value={data.agentId || 'none'}
              onValueChange={(v) =>
                onChange('agentId', v === 'none' ? undefined : v)
              }
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                {partners
                  .filter((p) => p.type === 'agent')
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:col-span-2 pt-4">
            <h3 className="font-semibold text-sm">Associação (HOA)</h3>
          </div>
          <div className="grid gap-2">
            <Label>{t('properties.hoa_fee')} ($)</Label>
            <CurrencyInput
              value={data.hoaValue || 0}
              onChange={(val) => onChange('hoaValue', val)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('common.frequency')}</Label>
            <Select
              value={data.hoaFrequency || 'monthly'}
              onValueChange={(v) => onChange('hoaFrequency', v)}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="semi-annually">Semestral</SelectItem>
                <SelectItem value="annually">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Despesas Fixas</CardTitle>
          <Button onClick={handleOpenAdd} className="bg-trust-blue gap-2">
            <Plus className="h-4 w-4" /> {t('common.add_title')}
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.description')}</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Contrato</TableHead>
                <TableHead>{t('common.value')}</TableHead>
                <TableHead>Dia Venc.</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!currentProperty.fixedExpenses ||
                currentProperty.fixedExpenses.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              )}
              {currentProperty.fixedExpenses?.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.name}</TableCell>
                  <TableCell>{expense.provider || '-'}</TableCell>
                  <TableCell>
                    {expense.contractEndDate ? (
                      <span className="text-xs">
                        Até {expense.contractEndDate}
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.dueDay}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(expense)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('common.confirm_delete')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('common.delete_desc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveExpense(expense.id)}
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <PropertyLedger propertyId={data.id} entries={propertyEntries} />
        </CardContent>
      </Card>

      <Dialog open={openExpense} onOpenChange={setOpenExpense}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'add' ? t('common.new') : t('common.edit')}
            </DialogTitle>
            <DialogDescription>Configure details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>
                {t('common.name')} <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Internet, Luz, Água"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  Fornecedor <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  placeholder="Ex: Duke Energy"
                />
              </div>
              <div className="grid gap-2">
                <Label>Nº Registro / Conta</Label>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  placeholder="ID da Fatura ou Cliente"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>
                  {t('common.value')} ($){' '}
                  <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  value={formData.amount}
                  onChange={(val) =>
                    setFormData({
                      ...formData,
                      amount: val,
                      recurringValue: val,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>
                  {t('common.date')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Contract Fields */}
            <div className="border-t pt-4 mt-2">
              <h4 className="text-sm font-medium mb-3">Detalhes do Contrato</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Início do Contrato</Label>
                  <Input
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractStartDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Fim do Contrato</Label>
                  <Input
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contractEndDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Valor Recorrente Mensal</Label>
                  <CurrencyInput
                    value={formData.recurringValue}
                    onChange={(val) =>
                      setFormData({ ...formData, recurringValue: val })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2 pt-2">
              <Label className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Comprovante (Opcional)
              </Label>
              <FileUpload
                value={formData.receiptUrl}
                onChange={(url) =>
                  setFormData({ ...formData, receiptUrl: url })
                }
                accept=".pdf,.jpg,.png,.jpeg"
                label={t('common.upload')}
              />
              {actionType === 'add' && formData.receiptUrl && (
                <div className="bg-green-50 text-green-700 p-2 rounded text-xs flex items-center gap-2 border border-green-200">
                  <FileCheck className="h-4 w-4" />
                  Attached receipt will mark this as PAID.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenExpense(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handlePreSubmit} className="bg-trust-blue">
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmActionOpen} onOpenChange={setConfirmActionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Change</AlertDialogTitle>
            <AlertDialogDescription>
              Changing this expense will update future pending entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmActionOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={executeSave}>
              {t('common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
