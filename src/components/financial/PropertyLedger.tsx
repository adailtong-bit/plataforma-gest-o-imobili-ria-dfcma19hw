import { useState } from 'react'
import { LedgerEntry, Task } from '@/lib/types'
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
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Upload,
  Trash2,
  Paperclip,
  ClipboardList,
  ExternalLink,
} from 'lucide-react'
import { format, isPast, parseISO } from 'date-fns'
import useFinancialStore from '@/stores/useFinancialStore'
import useTaskStore from '@/stores/useTaskStore'
import { useToast } from '@/hooks/use-toast'
import { FileUpload } from '@/components/ui/file-upload'
import { TaskDetailsSheet } from '@/components/tasks/TaskDetailsSheet'
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

interface PropertyLedgerProps {
  propertyId: string
  entries: LedgerEntry[]
}

export function PropertyLedger({ propertyId, entries }: PropertyLedgerProps) {
  const { addLedgerEntry, updateLedgerEntry, deleteLedgerEntry } =
    useFinancialStore()
  const { tasks } = useTaskStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [openUpload, setOpenUpload] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [newEntry, setNewEntry] = useState<Partial<LedgerEntry>>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    dueDate: new Date().toISOString().split('T')[0],
  })

  const handleSave = () => {
    if (!newEntry.amount || !newEntry.description || !newEntry.category) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    addLedgerEntry({
      id: `led-${Date.now()}`,
      propertyId,
      date: new Date().toISOString(),
      status: 'pending',
      ...newEntry,
      amount: Number(newEntry.amount),
    } as LedgerEntry)

    setOpen(false)
    toast({ title: 'Lançamento adicionado com sucesso.' })
  }

  const handleUpdate = () => {
    if (editingEntry) {
      updateLedgerEntry(editingEntry)
      setEditingEntry(null)
      toast({ title: 'Lançamento atualizado.' })
    }
  }

  const handleStatusUpdate = (entry: LedgerEntry, status: any) => {
    const paymentDate =
      status === 'cleared'
        ? entry.paymentDate || new Date().toISOString()
        : undefined

    const updated = {
      ...entry,
      status,
      paymentDate,
    }
    updateLedgerEntry(updated)
    toast({ title: `Status atualizado para ${status}` })
  }

  const handleDelete = (id: string) => {
    deleteLedgerEntry(id)
    toast({ title: 'Lançamento excluído.' })
  }

  const handleUploadFile = (id: string, url: string) => {
    const entry = entries.find((e) => e.id === id)
    if (entry && url) {
      updateLedgerEntry({
        ...entry,
        attachments: [
          ...(entry.attachments || []),
          { name: 'Comprovante', url },
        ],
      })
      setOpenUpload(null)
      toast({ title: 'Comprovante anexado.' })
    }
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
      <TaskDetailsSheet
        task={viewingTask}
        open={!!viewingTask}
        onOpenChange={(open) => !open && setViewingTask(null)}
      />

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Extrato Financeiro Detalhado</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" className="bg-trust-blue">
              <Plus className="mr-2 h-4 w-4" /> Lançamento Manual
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Criar Lançamento Manual</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja criar um registro financeiro avulso? Para despesas
                mensais (como internet), use a aba "Despesas Fixas" acima.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => setOpen(true)}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
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
                  <CurrencyInput
                    value={newEntry.amount}
                    onChange={(val) =>
                      setNewEntry({
                        ...newEntry,
                        amount: val,
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
              <DialogFooter>
                <Button onClick={handleSave}>Salvar Lançamento</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingEntry}
          onOpenChange={(open) => !open && setEditingEntry(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Lançamento</DialogTitle>
            </DialogHeader>
            {editingEntry && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Descrição</Label>
                  <Input
                    value={editingEntry.description}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Valor ($)</Label>
                    <CurrencyInput
                      value={editingEntry.amount}
                      onChange={(val) =>
                        setEditingEntry({
                          ...editingEntry,
                          amount: val,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Data Pagamento</Label>
                    <Input
                      type="date"
                      value={
                        editingEntry.paymentDate
                          ? editingEntry.paymentDate.split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        setEditingEntry({
                          ...editingEntry,
                          paymentDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : undefined,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Receipt Upload in Edit Mode */}
                <div className="grid gap-2">
                  <Label>Anexos / Comprovantes</Label>
                  {editingEntry.attachments &&
                    editingEntry.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editingEntry.attachments.map((att, idx) => (
                          <Badge key={idx} variant="secondary">
                            {att.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  <FileUpload
                    accept=".pdf,.png,.jpg,.jpeg"
                    label="Upload Comprovante"
                    onChange={(url) => {
                      if (url) {
                        setEditingEntry({
                          ...editingEntry,
                          attachments: [
                            ...(editingEntry.attachments || []),
                            { name: 'Novo Comprovante', url },
                          ],
                        })
                      }
                    }}
                  />
                </div>

                <DialogFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button>Salvar Alterações</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Alteração</AlertDialogTitle>
                        <AlertDialogDescription>
                          Deseja salvar as alterações neste lançamento?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpdate}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>Pagamento</TableHead>
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
              entries.map((entry) => {
                // Find associated task if any
                const associatedTask = tasks.find(
                  (t) => t.id === entry.referenceId,
                )

                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.dueDate
                        ? format(new Date(entry.dueDate), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {entry.paymentDate
                        ? format(new Date(entry.paymentDate), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className="cursor-pointer hover:underline font-medium"
                          onClick={() => setEditingEntry(entry)}
                        >
                          {entry.description}
                        </span>
                        {/* Task Link */}
                        {associatedTask && (
                          <div
                            className="flex items-center gap-1 text-xs text-blue-600 cursor-pointer hover:text-blue-800 mt-1 w-fit"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingTask(associatedTask)
                            }}
                          >
                            <ClipboardList className="h-3 w-3" />
                            Ver Tarefa
                          </div>
                        )}
                        {entry.attachments && entry.attachments.length > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Paperclip className="h-3 w-3" />{' '}
                            {entry.attachments.length} anexo(s)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>{getStatusBadge(entry)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        entry.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {entry.type === 'income' ? '+' : '-'}$
                      {entry.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <Dialog
                          open={openUpload === entry.id}
                          onOpenChange={(o) =>
                            setOpenUpload(o ? entry.id : null)
                          }
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Upload Comprovante"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Anexar Comprovante</DialogTitle>
                            </DialogHeader>
                            <FileUpload
                              accept=".pdf,.jpg,.png,.jpeg"
                              onChange={(url) =>
                                handleUploadFile(entry.id, url)
                              }
                            />
                          </DialogContent>
                        </Dialog>

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
                              <DialogTitle>Confirmar Exclusão</DialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir este lançamento?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(entry.id)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
