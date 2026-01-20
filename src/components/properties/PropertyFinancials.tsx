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
import { Plus, Trash2, Edit2 } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
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

  // State for expense being edited or created
  const [currentExpense, setCurrentExpense] = useState<Partial<FixedExpense>>({
    name: '',
    amount: 0,
    dueDay: 1,
    frequency: 'monthly',
    provider: '',
    accountNumber: '',
  })

  const { ledgerEntries, addLedgerEntry } = useFinancialStore()
  const propertyEntries = ledgerEntries.filter((e) => e.propertyId === data.id)

  const handleOpenAdd = () => {
    setCurrentExpense({
      name: '',
      amount: 0,
      dueDay: 1,
      frequency: 'monthly',
      provider: '',
      accountNumber: '',
    })
    setActionType('add')
    setOpenExpense(true)
  }

  const handleOpenEdit = (expense: FixedExpense) => {
    setCurrentExpense({ ...expense })
    setActionType('edit')
    setOpenExpense(true)
  }

  const handleSubmitExpense = () => {
    // Basic validation
    if (!currentExpense.name || !currentExpense.amount) {
      toast({
        title: 'Erro',
        description: 'Nome e Valor são obrigatórios.',
        variant: 'destructive',
      })
      return
    }
    setConfirmActionOpen(true)
  }

  const handleConfirmSubmit = () => {
    const expense: FixedExpense = {
      id: currentExpense.id || `fe-${Date.now()}`,
      name: currentExpense.name!,
      amount: Number(currentExpense.amount),
      dueDay: Number(currentExpense.dueDay),
      frequency: currentExpense.frequency as 'monthly' | 'yearly',
      provider: currentExpense.provider,
      accountNumber: currentExpense.accountNumber,
    }

    let updatedExpenses = [...(data.fixedExpenses || [])]

    if (actionType === 'add') {
      updatedExpenses.push(expense)
      // Add to Ledger Immediately (Current Month)
      const entry: LedgerEntry = {
        id: `auto-fe-${expense.id}-initial`,
        propertyId: data.id,
        date: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        type: 'expense',
        category: expense.name,
        amount: expense.amount,
        description: `${expense.name} - ${expense.provider || ''} (Auto)`,
        referenceId: expense.id,
        status: 'pending',
      }
      addLedgerEntry(entry)
      toast({
        title: 'Despesa Adicionada',
        description: 'Despesa fixa cadastrada e lançada no financeiro.',
      })
    } else {
      // Edit
      updatedExpenses = updatedExpenses.map((e) =>
        e.id === expense.id ? expense : e,
      )
      toast({
        title: 'Despesa Atualizada',
        description: 'Informações atualizadas com sucesso.',
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
    toast({
      title: 'Despesa Removida',
      description: 'Registro excluído permanentemente.',
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
            <Button size="sm" variant="outline" onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar Despesa
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Expense Dialog */}
          <Dialog open={openExpense} onOpenChange={setOpenExpense}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {actionType === 'add'
                    ? 'Nova Despesa Fixa'
                    : 'Editar Despesa'}
                </DialogTitle>
                <DialogDescription>
                  Configure uma despesa que se repete periodicamente.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Nome da Despesa</Label>
                    <Input
                      value={currentExpense.name}
                      onChange={(e) =>
                        setCurrentExpense({
                          ...currentExpense,
                          name: e.target.value,
                        })
                      }
                      placeholder="Ex: Internet, Luz, Água"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fornecedor (Empresa)</Label>
                    <Input
                      value={currentExpense.provider}
                      onChange={(e) =>
                        setCurrentExpense({
                          ...currentExpense,
                          provider: e.target.value,
                        })
                      }
                      placeholder="Ex: AT&T, Duke Energy"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Número da Conta / Registro</Label>
                    <Input
                      value={currentExpense.accountNumber}
                      onChange={(e) =>
                        setCurrentExpense({
                          ...currentExpense,
                          accountNumber: e.target.value,
                        })
                      }
                      placeholder="Ex: 000-123-456"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Valor ($)</Label>
                    <CurrencyInput
                      value={currentExpense.amount}
                      onChange={(val) =>
                        setCurrentExpense({
                          ...currentExpense,
                          amount: val,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Dia Vencimento</Label>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      value={currentExpense.dueDay}
                      onChange={(e) =>
                        setCurrentExpense({
                          ...currentExpense,
                          dueDay: Number(e.target.value),
                        })
                      }
                      className="no-spinner"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Frequência</Label>
                    <Select
                      value={currentExpense.frequency}
                      onValueChange={(v: any) =>
                        setCurrentExpense({ ...currentExpense, frequency: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenExpense(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmitExpense} className="bg-trust-blue">
                  {actionType === 'add' ? 'Adicionar' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirmation Alert Dialog */}
          <AlertDialog
            open={confirmActionOpen}
            onOpenChange={setConfirmActionOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
                <AlertDialogDescription>
                  {actionType === 'add'
                    ? 'Isso criará uma nova despesa fixa e gerará um lançamento financeiro para o mês atual. Deseja continuar?'
                    : 'Tem certeza que deseja alterar os dados desta despesa fixa? Isso afetará lançamentos futuros.'}
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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Despesa</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Conta/Reg.</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Dia Venc.</TableHead>
                <TableHead>Freq.</TableHead>
                {canEdit && <TableHead className="text-right">Ação</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!data.fixedExpenses || data.fixedExpenses.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-4 text-muted-foreground"
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
                  <TableCell className="capitalize">
                    {expense.frequency}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right flex justify-end gap-2">
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
                            className="text-red-500 hover:text-red-700"
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
                              Tem certeza que deseja excluir esta despesa fixa?
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
    </div>
  )
}
