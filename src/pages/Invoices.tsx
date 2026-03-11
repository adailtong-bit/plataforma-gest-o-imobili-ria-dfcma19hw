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
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import { Invoice } from '@/lib/types'
import { InvoiceViewer } from '@/components/financial/InvoiceViewer'
import { DataMask } from '@/components/DataMask'

export default function Invoices() {
  const {
    financials,
    ledgerEntries,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateLedgerEntry,
    formatAppCurrency,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
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

  const filteredInvoices = financials.invoices.filter(
    (inv) =>
      inv.description.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = () => {
    if (!form.description) {
      toast({ title: t('common.error'), variant: 'destructive' })
      return
    }

    if (editingRecord) {
      updateInvoice({ ...editingRecord, ...form } as Invoice)
      toast({ title: t('common.success') })
    } else {
      addInvoice({
        id: `inv-${Date.now()}`,
        description: form.description,
        amount: Number(form.amount) || 0,
        status: form.status || 'pending',
        date: form.date || new Date().toISOString(),
        type: 'generic',
      } as Invoice)
      toast({ title: t('common.success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm({ description: '', amount: 0, status: 'pending', date: '' })
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteInvoice(deleteId)
      toast({ title: t('common.delete_success') })
      setDeleteId(null)
    }
  }

  const handleMarkAsPaid = (inv: Invoice) => {
    updateInvoice({ ...inv, status: 'paid' } as Invoice)
    let updatedCount = 0
    ledgerEntries.forEach((entry) => {
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
      title: t('common.success') || 'Success',
      description: `Invoice paid. ${updatedCount} ledger entries cleared.`,
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('common.invoices')}
          </h1>
          <p className="text-muted-foreground">
            Gerencie as faturas geradas (incluindo serviços e PDV).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('common.search')}
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
                  date: '',
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white">
                <Plus className="h-4 w-4" /> {t('common.add')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? t('common.edit') : t('common.add')}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('common.description')}</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.value')}</Label>
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
                <Button onClick={handleSave}>{t('common.save')}</Button>
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
                <TableHead>Invoice ID</TableHead>
                <TableHead>{t('common.description')}</TableHead>
                <TableHead>Reserva Associada</TableHead>
                <TableHead>{t('common.date')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.value')}
                </TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.slice(0, 50).map((inv) => (
                <TableRow key={inv.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs">
                    <DataMask>{inv.id}</DataMask>
                  </TableCell>
                  <TableCell
                    className="font-medium text-slate-900 max-w-[200px] truncate"
                    title={inv.description}
                  >
                    <DataMask>{inv.description}</DataMask>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs font-mono">
                    {inv.bookingId || '-'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(inv.date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <DataMask>{formatAppCurrency(inv.amount)}</DataMask>
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
                          <Eye className="h-4 w-4 mr-2" /> {t('common.view')}
                        </DropdownMenuItem>
                        {inv.status !== 'paid' && (
                          <DropdownMenuItem
                            onClick={() => handleMarkAsPaid(inv)}
                            className="text-green-600 focus:text-green-600"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as
                            Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingRecord(inv)
                            setForm(inv)
                            setIsAddOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setDeleteId(inv.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />{' '}
                          {t('common.delete')}
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
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceViewer
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        invoice={viewingInvoice}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm_delete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.delete_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
