import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MoreHorizontal,
  CheckCircle2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { format, isValid } from 'date-fns'
import { Invoice } from '@/lib/types'

export default function Invoices() {
  const context = useContext(AppContext)
  const financials = context?.financials || { invoices: [] }
  const ledgerEntries = context?.ledgerEntries || []
  const addInvoice = context?.addInvoice || (() => {})
  const updateInvoice = context?.updateInvoice || (() => {})
  const deleteInvoice = context?.deleteInvoice || (() => {})
  const updateLedgerEntry = context?.updateLedgerEntry || (() => {})
  const formatAppCurrency =
    context?.formatAppCurrency || ((v: number) => `$${v}`)

  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Invoice | null>(null)
  const [form, setForm] = useState<Partial<Invoice>>({
    description: '',
    amount: 0,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
  })

  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const invoiceList = Array.isArray(financials)
    ? financials
    : financials?.invoices || []

  const filteredInvoices = (invoiceList || []).filter(
    (inv: any) =>
      (inv?.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv?.id || '').toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = () => {
    if (!form.description) {
      toast({
        title: 'Erro',
        description: 'Descrição é obrigatória',
        variant: 'destructive',
      })
      return
    }

    if (editingRecord) {
      updateInvoice({ ...editingRecord, ...form } as Invoice)
      toast({ title: 'Sucesso', description: 'Fatura atualizada com sucesso' })
    } else {
      addInvoice({
        id: `inv-${Date.now()}`,
        description: form.description,
        amount: Number(form.amount) || 0,
        status: form.status || 'pending',
        date: form.date || new Date().toISOString(),
        type: 'generic',
      } as Invoice)
      toast({ title: 'Sucesso', description: 'Fatura criada com sucesso' })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm({
      description: '',
      amount: 0,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteInvoice(deleteId)
      toast({ title: 'Sucesso', description: 'Fatura excluída com sucesso' })
      setDeleteId(null)
    }
  }

  const handleMarkAsPaid = (inv: Invoice) => {
    updateInvoice({ ...inv, status: 'paid' } as Invoice)
    let updatedCount = 0
    ledgerEntries.forEach((entry: any) => {
      if (entry.referenceId === inv.id && entry.status === 'pending') {
        updateLedgerEntry({
          ...entry,
          status: 'cleared',
          paymentDate: new Date().toISOString(),
        })
        updatedCount++
      }
    })
    toast({
      title: 'Sucesso',
      description: `Fatura paga. ${updatedCount} lançamentos atualizados.`,
    })
  }

  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return isValid(d) ? format(d, 'MMM dd, yyyy') : '-'
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Faturas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as faturas geradas (incluindo serviços e PDV).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar faturas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm({
                  description: '',
                  amount: 0,
                  status: 'pending',
                  date: new Date().toISOString().split('T')[0],
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" /> Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? 'Editar Fatura' : 'Nova Fatura'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Ex: Limpeza de rotina"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleSave}
                  className="bg-trust-blue text-white hover:bg-blue-700"
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>ID da Fatura</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Reserva Associada</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.slice(0, 50).map((inv: any) => (
                <TableRow key={inv.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell
                    className="font-medium text-slate-900 max-w-[200px] truncate"
                    title={inv.description}
                  >
                    {inv.description}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    {inv.bookingId || '-'}
                  </TableCell>
                  <TableCell>{formatDateSafe(inv.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`uppercase text-[10px] ${inv.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatAppCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setViewingInvoice(inv)
                            setViewerOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Visualizar
                        </DropdownMenuItem>
                        {inv.status !== 'paid' && (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsPaid(inv)}
                            className="text-green-600 focus:text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Marcar
                            como Pago
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingRecord(inv)
                            setForm(inv)
                            setIsAddOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteId(inv.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhuma fatura encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Visualizar Fatura</DialogTitle>
          </DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">
                    ID da Fatura
                  </p>
                  <p className="font-mono text-sm">{viewingInvoice.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Data</p>
                  <p className="font-medium">
                    {formatDateSafe(viewingInvoice.date)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Status</p>
                  <Badge
                    variant="outline"
                    className={`uppercase text-[10px] ${viewingInvoice.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                  >
                    {viewingInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Valor</p>
                  <p className="font-medium text-lg">
                    {formatAppCurrency(viewingInvoice.amount)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Descrição</p>
                <p className="font-medium">{viewingInvoice.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewerOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta fatura? Esta ação não pode ser
              desfeita e pode afetar os relatórios financeiros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Fatura
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
