import { useState } from 'react'
import { LedgerEntry } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Upload, CheckCircle2, AlertCircle } from 'lucide-react'
import { format, isPast, parseISO } from 'date-fns'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'

interface PropertyLedgerProps {
  propertyId: string
  entries: LedgerEntry[]
}

export function PropertyLedger({ propertyId, entries }: PropertyLedgerProps) {
  const { addLedgerEntry, updateLedgerEntry } = useFinancialStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<LedgerEntry>>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    dueDate: new Date().toISOString().split('T')[0],
  })

  const handleSave = () => {
    if (!newEntry.amount || !newEntry.description || !newEntry.category) return

    addLedgerEntry({
      id: `led-${Date.now()}`,
      propertyId,
      date: new Date().toISOString(),
      status: 'pending',
      ...newEntry,
      amount: Number(newEntry.amount),
    } as LedgerEntry)

    setOpen(false)
    toast({ title: 'Lançamento adicionado' })
  }

  const handleStatusUpdate = (entry: LedgerEntry, status: any) => {
    updateLedgerEntry({ ...entry, status })
    toast({ title: `Status atualizado para ${status}` })
  }

  const getStatusBadge = (entry: LedgerEntry) => {
    if (entry.status === 'cleared')
      return <Badge className="bg-green-600">Pago</Badge>
    if (
      entry.status === 'pending' &&
      entry.dueDate &&
      isPast(parseISO(entry.dueDate))
    ) {
      return <Badge variant="destructive">Atrasado</Badge>
    }
    if (entry.status === 'pending')
      return <Badge variant="secondary">Pendente</Badge>
    return <Badge variant="outline">{entry.status}</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Extrato Financeiro Detalhado</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-trust-blue">
              <Plus className="mr-2 h-4 w-4" /> Novo Lançamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Lançamento</DialogTitle>
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
                  <Input
                    value={newEntry.category}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, category: e.target.value })
                    }
                    placeholder="Ex: Aluguel, Manutenção"
                  />
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
                      setNewEntry({
                        ...newEntry,
                        amount: e.target.value as any,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Vencimento</Label>
                  <Input
                    type="date"
                    value={newEntry.dueDate}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Comprovante (Upload Mock)</Label>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> Anexar Arquivo
                </Button>
              </div>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Nenhum registro financeiro.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {entry.dueDate
                      ? format(new Date(entry.dueDate), 'dd/MM/yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>{entry.category}</TableCell>
                  <TableCell>{getStatusBadge(entry)}</TableCell>
                  <TableCell
                    className={`text-right font-medium ${
                      entry.type === 'income'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {entry.type === 'income' ? '+' : '-'}${entry.amount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      defaultValue={entry.status}
                      onValueChange={(v) => handleStatusUpdate(entry, v)}
                    >
                      <SelectTrigger className="h-8 w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="cleared">Pago</SelectItem>
                        <SelectItem value="overdue">Atrasado</SelectItem>
                        <SelectItem value="void">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
