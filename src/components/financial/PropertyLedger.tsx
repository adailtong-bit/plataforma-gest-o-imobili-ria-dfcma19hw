import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import useFinancialStore from '@/stores/useFinancialStore'
import { format } from 'date-fns'
import { LedgerEntry } from '@/lib/types'

interface PropertyLedgerProps {
  propertyId: string
  canEdit: boolean
}

export function PropertyLedger({ propertyId, canEdit }: PropertyLedgerProps) {
  const { ledgerEntries, addLedgerEntry, deleteLedgerEntry } =
    useFinancialStore()
  const [open, setOpen] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<LedgerEntry>>({
    type: 'expense',
    category: 'Maintenance',
    amount: 0,
    description: '',
    status: 'pending',
  })

  const propertyEntries = ledgerEntries.filter(
    (e) => e.propertyId === propertyId,
  )

  const handleAdd = () => {
    if (!newEntry.amount || !newEntry.description) return

    addLedgerEntry({
      id: `ledg-${Date.now()}`,
      propertyId,
      date: new Date().toISOString(),
      type: newEntry.type as 'income' | 'expense',
      category: newEntry.category || 'Other',
      amount: Number(newEntry.amount),
      description: newEntry.description,
      status: newEntry.status as 'pending' | 'cleared' | 'void',
    })
    setOpen(false)
    setNewEntry({
      type: 'expense',
      category: 'Maintenance',
      amount: 0,
      description: '',
      status: 'pending',
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteLedgerEntry(id)
    }
  }

  const getTypeColor = (type: string) =>
    type === 'income' ? 'text-green-600' : 'text-red-600'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ledger Financeiro</CardTitle>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-trust-blue">
                <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Lançamento</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select
                      value={newEntry.type}
                      onValueChange={(v: any) =>
                        setNewEntry({ ...newEntry, type: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Categoria</Label>
                    <Select
                      value={newEntry.category}
                      onValueChange={(v) =>
                        setNewEntry({ ...newEntry, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rent">Aluguel</SelectItem>
                        <SelectItem value="Maintenance">Manutenção</SelectItem>
                        <SelectItem value="Cleaning">Limpeza</SelectItem>
                        <SelectItem value="HOA">HOA</SelectItem>
                        <SelectItem value="Management Fee">
                          Taxa de Gestão
                        </SelectItem>
                        <SelectItem value="Other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Input
                    value={newEntry.description}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor ($)</Label>
                    <Input
                      type="number"
                      value={newEntry.amount}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, amount: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select
                      value={newEntry.status}
                      onValueChange={(v: any) =>
                        setNewEntry({ ...newEntry, status: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="cleared">Compensado</SelectItem>
                        <SelectItem value="void">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAdd}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {propertyEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Nenhum lançamento registrado.
                </TableCell>
              </TableRow>
            ) : (
              propertyEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className={getTypeColor(entry.type)}>
                    {entry.type === 'expense' ? '-' : '+'} $
                    {entry.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.status}</Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
