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
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import { Invoice } from '@/lib/types'
import { InvoiceViewer } from '@/components/financial/InvoiceViewer'

export default function Invoices() {
  const {
    financials,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    formatAppCurrency,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

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

  const handleDelete = (id: string) => {
    deleteInvoice(id)
    toast({ title: t('common.delete_success') })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('common.invoices')}
          </h1>
          <p className="text-muted-foreground">Manage generated invoices.</p>
        </div>
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
              <Plus className="h-4 w-4" /> {t('common.add_title')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? t('common.edit') : t('common.add_title')}
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

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>{t('common.description')}</TableHead>
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
              {financials.invoices.slice(0, 50).map((inv) => (
                <TableRow key={inv.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs">{inv.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {inv.description}
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
                    {formatAppCurrency(inv.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setViewingInvoice(inv)
                          setViewerOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingRecord(inv)
                          setForm(inv)
                          setIsAddOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('common.delete_title')}
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
                              onClick={() => handleDelete(inv.id)}
                            >
                              {t('common.confirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {financials.invoices.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
    </div>
  )
}
