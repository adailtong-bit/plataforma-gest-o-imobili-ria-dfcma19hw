import { Property, Owner, Partner, FixedExpense } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

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
  const [openExpense, setOpenExpense] = useState(false)
  const [newExpense, setNewExpense] = useState<Partial<FixedExpense>>({
    name: '',
    amount: 0,
    dueDay: 1,
    frequency: 'monthly',
  })

  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount) {
      const expense: FixedExpense = {
        id: `fe-${Date.now()}`,
        name: newExpense.name,
        amount: Number(newExpense.amount),
        dueDay: Number(newExpense.dueDay),
        frequency: newExpense.frequency as 'monthly' | 'yearly',
      }
      onChange('fixedExpenses', [...(data.fixedExpenses || []), expense])
      setOpenExpense(false)
      setNewExpense({ name: '', amount: 0, dueDay: 1, frequency: 'monthly' })
    }
  }

  const handleRemoveExpense = (id: string) => {
    onChange(
      'fixedExpenses',
      (data.fixedExpenses || []).filter((e) => e.id !== id),
    )
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
            <Input
              type="number"
              value={data.hoaValue || 0}
              onChange={(e) => onChange('hoaValue', Number(e.target.value))}
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
            <Dialog open={openExpense} onOpenChange={setOpenExpense}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Despesa Fixa</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Nome</Label>
                    <Input
                      value={newExpense.name}
                      onChange={(e) =>
                        setNewExpense({ ...newExpense, name: e.target.value })
                      }
                      placeholder="Ex: Internet"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Valor ($)</Label>
                      <Input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            amount: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Dia Vencimento</Label>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        value={newExpense.dueDay}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            dueDay: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Frequência</Label>
                    <Select
                      value={newExpense.frequency}
                      onValueChange={(v: any) =>
                        setNewExpense({ ...newExpense, frequency: v })
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
                  <Button onClick={handleAddExpense} className="bg-trust-blue">
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Despesa</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Dia Vencimento</TableHead>
                <TableHead>Frequência</TableHead>
                {canEdit && <TableHead className="text-right">Ação</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!data.fixedExpenses || data.fixedExpenses.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-muted-foreground"
                  >
                    Nenhuma despesa fixa cadastrada.
                  </TableCell>
                </TableRow>
              )}
              {data.fixedExpenses?.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.name}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>Dia {expense.dueDay}</TableCell>
                  <TableCell className="capitalize">
                    {expense.frequency}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveExpense(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
