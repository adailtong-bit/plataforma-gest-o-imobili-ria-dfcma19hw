import { useState, useMemo } from 'react'
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
import { Plus, Upload, Trash2, Paperclip, ClipboardList } from 'lucide-react'
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
import { cn } from '@/lib/utils'

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

  // Calculate Running Balance
  const sortedEntriesWithBalance = useMemo(() => {
    // Sort by Date Ascending for balance calculation
    const sorted = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    let balance = 0
    return sorted.map((entry) => {
      // Income increases balance, Expense decreases balance
      // Assuming initial balance 0 or effectively running from start
      if (entry.type === 'income') {
        balance += entry.amount
      } else {
        balance -= entry.amount
      }
      return { ...entry, runningBalance: balance }
    })
  }, [entries])

  // Display ordered descending (newest on top) but keep correct running balance from calculation
  const displayEntries = [...sortedEntriesWithBalance].reverse()

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

  return (
    <div className="space-y-4">
      <TaskDetailsSheet
        task={viewingTask}
        open={!!viewingTask}
        onOpenChange={(open) => !open && setViewingTask(null)}
      />

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Bank-Style Statement</h3>
          <p className="text-sm text-muted-foreground">
            Financial view with running balance.
          </p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" className="bg-trust-blue">
              <Plus className="mr-2 h-4 w-4" /> Manual Entry
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
                      <SelectItem value="income">Receita (Credit)</SelectItem>
                      <SelectItem value="expense">Despesa (Debit)</SelectItem>
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
                    placeholder="Ex: Rent, HOA, Maintenance"
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
                  <Label>Data</Label>
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

                <div className="grid gap-2">
                  <Label>Anexos / Comprovantes</Label>
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
                  <Button onClick={handleUpdate}>Confirmar Alteração</Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Debit (-)</TableHead>
              <TableHead className="text-right">Credit (+)</TableHead>
              <TableHead className="text-right font-bold text-gray-900 bg-gray-50/50">
                Balance
              </TableHead>
              <TableHead className="text-right w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  No financial entries recorded.
                </TableCell>
              </TableRow>
            ) : (
              displayEntries.map((entry) => {
                const associatedTask = tasks.find(
                  (t) => t.id === entry.referenceId,
                )

                return (
                  <TableRow key={entry.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">
                      {format(new Date(entry.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span
                          className="font-medium text-sm cursor-pointer hover:underline"
                          onClick={() => setEditingEntry(entry)}
                        >
                          {entry.description}
                        </span>
                        {associatedTask && (
                          <div
                            className="flex items-center gap-1 text-[10px] text-blue-600 cursor-pointer hover:text-blue-800 mt-0.5 w-fit bg-blue-50 px-1.5 py-0.5 rounded"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingTask(associatedTask)
                            }}
                          >
                            <ClipboardList className="h-3 w-3" />
                            Task Linked
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal text-xs">
                        {entry.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      {entry.type === 'expense'
                        ? `$${entry.amount.toFixed(2)}`
                        : ''}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      {entry.type === 'income'
                        ? `$${entry.amount.toFixed(2)}`
                        : ''}
                    </TableCell>
                    <TableCell className="text-right font-bold bg-gray-50/30">
                      <span
                        className={cn(
                          (entry as any).runningBalance < 0
                            ? 'text-red-700'
                            : 'text-gray-900',
                        )}
                      >
                        ${(entry as any).runningBalance.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
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
                              className="h-6 w-6"
                              title="Upload"
                            >
                              <Upload className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Anexar</DialogTitle>
                            </DialogHeader>
                            <FileUpload
                              accept=".pdf,.jpg,.png"
                              onChange={(url) =>
                                handleUploadFile(entry.id, url)
                              }
                            />
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <DialogTitle>Delete Entry</DialogTitle>
                              <AlertDialogDescription>
                                Are you sure? This will remove the transaction
                                and affect the balance.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(entry.id)}
                              >
                                Delete
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
