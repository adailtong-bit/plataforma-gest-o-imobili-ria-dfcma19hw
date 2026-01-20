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
import { useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { setDate, getDaysInMonth, parseISO, addMonths } from 'date-fns'
import { FileUpload } from '@/components/ui/file-upload'
import { Badge } from '@/components/ui/badge'

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
  const [openExpense, setOpenExpense] = useState(false)
  const [confirmActionOpen, setConfirmActionOpen] = useState(false)
  const [actionType, setActionType] = useState<'add' | 'edit'>('add')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    accountNumber: '',
    amount: 0,
    paymentDate: '',
    receiptUrl: '',
  })
  const [currentExpenseId, setCurrentExpenseId] = useState<string | null>(null)

  const {
    ledgerEntries,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
  } = useFinancialStore()
  const propertyEntries = ledgerEntries.filter((e) => e.propertyId === data.id)

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      provider: '',
      accountNumber: '',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      receiptUrl: '',
    })
    setCurrentExpenseId(null)
    setActionType('add')
    setOpenExpense(true)
  }

  const handleOpenEdit = (expense: FixedExpense) => {
    // Estimate current month date based on dueDay
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
    })
    setCurrentExpenseId(expense.id)
    setActionType('edit')
    setOpenExpense(true)
  }

  const handleSubmitExpense = () => {
    if (
      !formData.name ||
      !formData.amount ||
      !formData.provider ||
      !formData.paymentDate
    ) {
      toast({
        title: 'Campos Obrigatórios',
        description: 'Preencha Nome, Fornecedor, Valor e Data.',
        variant: 'destructive',
      })
      return
    }
    setConfirmActionOpen(true)
  }

  const getNextDueDate = (currentDate: Date, fixedDay: number) => {
    const nextMonth = addMonths(currentDate, 1)
    const daysInNext = getDaysInMonth(nextMonth)
    const day = Math.min(fixedDay, daysInNext)
    return setDate(nextMonth, day)
  }

  const handleConfirmSubmit = () => {
    // Extract Due Day from payment date
    const parts = formData.paymentDate.split('-')
    const dueDay = parseInt(parts[2])

    const expense: FixedExpense = {
      id: currentExpenseId || `fe-${Date.now()}`,
      name: formData.name,
      amount: formData.amount,
      dueDay: dueDay,
      frequency: 'monthly',
      provider: formData.provider,
      accountNumber: formData.accountNumber,
    }

    let updatedExpenses = [...(data.fixedExpenses || [])]

    if (actionType === 'add') {
      updatedExpenses.push(expense)

      // Initial Ledger Entry Logic
      const isPaid = !!formData.receiptUrl
      const initialDate = new Date(formData.paymentDate)

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
      }

      addLedgerEntry(entry)

      // If initial entry is PAID, schedule next month immediately
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
        }
        setTimeout(() => addLedgerEntry(nextEntry), 100)
      }

      toast({
        title: 'Despesa Fixa Criada',
        description: 'Despesa adicionada e lançada no financeiro.',
      })
    } else {
      // Edit Mode
      updatedExpenses = updatedExpenses.map((e) =>
        e.id === expense.id ? expense : e,
      )

      // Update pending entries to reflect new amount/day
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
        }
        updateLedgerEntry(updatedEntry)
      })

      toast({
        title: 'Despesa Atualizada',
        description: 'Informações e lançamentos pendentes atualizados.',
      })
    }

    onChange('fixedExpenses', updatedExpenses)
    setConfirmActionOpen(false)
    setOpenExpense(false)
  }

  const handleRemoveExpense = (id: string) => {
    onChange(
      'fixedExpenses',
      (data.fixedExpenses || []).filter((e) => e.id !== id),
    )

    const pendingEntries = ledgerEntries.filter(
      (e) => e.referenceId === id && e.status === 'pending',
    )
    pendingEntries.forEach((entry) => deleteLedgerEntry(entry.id))

    toast({
      title: 'Despesa Removida',
      description: 'Registro e lançamentos pendentes excluídos.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financeiro e Gestão</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Proprietário</Label>
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
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
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
            <Label>Valor HOA ($)</Label>
            <CurrencyInput
              value={data.hoaValue || 0}
              onChange={(val) => onChange('hoaValue', val)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label>Frequência HOA</Label>
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
          {canEdit && (
            <Button onClick={handleOpenAdd} className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> Adicionar Despesa Fixa
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Despesa</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Nº Registro</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Dia Venc.</TableHead>
                {canEdit && <TableHead className="text-right">Ação</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!data.fixedExpenses || data.fixedExpenses.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhuma despesa fixa cadastrada.
                  </TableCell>
                </TableRow>
              )}
              {data.fixedExpenses?.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.name}</TableCell>
                  <TableCell>{expense.provider || '-'}</TableCell>
                  <TableCell>{expense.accountNumber || '-'}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>{expense.dueDay}</TableCell>
                  {canEdit && (
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
                                Confirmar Exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Excluir esta despesa fixa removerá também os
                                lançamentos futuros pendentes.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveExpense(expense.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
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

      {/* Expense Modal */}
      <Dialog open={openExpense} onOpenChange={setOpenExpense}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'add' ? 'Nova Despesa Fixa' : 'Editar Despesa'}
            </DialogTitle>
            <DialogDescription>
              Configure os detalhes da despesa recorrente.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nome da Despesa (Ex: Internet)</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Identificação da despesa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nome da Companhia Fornecedora</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  placeholder="Ex: Duke Energy"
                />
              </div>
              <div className="grid gap-2">
                <Label>Número de Registro/Cadastro</Label>
                <Input
                  value={formData.accountNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                  placeholder="ID do Cliente / Conta"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor ($)</Label>
                <CurrencyInput
                  value={formData.amount}
                  onChange={(val) => setFormData({ ...formData, amount: val })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Data de Pagamento / Vencimento</Label>
                <Input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDate: e.target.value })
                  }
                />
                <p className="text-[10px] text-muted-foreground">
                  Define o dia de vencimento mensal.
                </p>
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
                label="Carregar Recibo/Fatura"
              />
              {actionType === 'add' && formData.receiptUrl && (
                <div className="bg-green-50 text-green-700 p-2 rounded text-xs flex items-center gap-2 border border-green-200">
                  <FileCheck className="h-4 w-4" />O envio do comprovante
                  marcará a conta atual como PAGA e agendará a do próximo mês.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenExpense(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitExpense} className="bg-trust-blue">
              {actionType === 'add' ? 'Adicionar' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert */}
      <AlertDialog open={confirmActionOpen} onOpenChange={setConfirmActionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'add'
                ? 'Isso criará uma despesa recorrente e lançará o valor no financeiro automaticamente.'
                : 'Alterar esta despesa atualizará automaticamente os lançamentos futuros pendentes.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
