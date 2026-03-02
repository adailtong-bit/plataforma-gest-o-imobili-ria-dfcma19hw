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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { PosItem } from '@/lib/types'
import { DataMask } from '@/components/DataMask'

export default function PointOfSale() {
  const {
    posItems,
    addPosItem,
    updatePosItem,
    deletePosItem,
    posTransactions,
    formatAppCurrency,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PosItem | null>(null)
  const [form, setForm] = useState<Partial<PosItem>>({
    name: '',
    price: 0,
    category: 'minibar',
    active: true,
  })

  const handleSave = () => {
    if (!form.name) {
      toast({ title: t('common.error'), variant: 'destructive' })
      return
    }

    if (editingRecord) {
      updatePosItem({ ...editingRecord, ...form } as PosItem)
      toast({ title: t('common.success') })
    } else {
      addPosItem({
        id: `pos-${Date.now()}`,
        name: form.name,
        price: Number(form.price) || 0,
        category: form.category || 'minibar',
        active: form.active ?? true,
      } as PosItem)
      toast({ title: t('common.success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm({ name: '', price: 0, category: 'minibar', active: true })
  }

  const handleDelete = (id: string) => {
    deletePosItem(id)
    toast({ title: t('common.delete_success') })
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.pos')}
          </h1>
          <p className="text-muted-foreground">
            Manage POS items and view transactions.
          </p>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">
            {t('pos.manage_products') || 'Products'}
          </TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card className="border-slate-200 shadow-sm bg-white">
            <div className="p-4 border-b flex justify-end">
              <Dialog
                open={isAddOpen}
                onOpenChange={(v) => {
                  setIsAddOpen(v)
                  if (!v) {
                    setEditingRecord(null)
                    setForm({
                      name: '',
                      price: 0,
                      category: 'minibar',
                      active: true,
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
                      <Label>{t('common.name')}</Label>
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('common.value')}</Label>
                      <Input
                        type="number"
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: Number(e.target.value) })
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
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.category')}</TableHead>
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
                  {posItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        <DataMask>{item.name}</DataMask>
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.category}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.active ? 'default' : 'secondary'}>
                          {item.active
                            ? t('common.active')
                            : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        <DataMask>{formatAppCurrency(item.price)}</DataMask>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingRecord(item)
                              setForm(item)
                              setIsAddOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />{' '}
                            {t('common.edit')}
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
                                  onClick={() => handleDelete(item.id)}
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
                  {posItems.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posTransactions.slice(0, 50).map((trx) => (
                    <TableRow key={trx.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium text-slate-900">
                        {trx.id}
                      </TableCell>
                      <TableCell>
                        {trx.items.map((i) => i.name).join(', ')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(trx.timestamp), 'MMM dd, HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="uppercase text-[10px]"
                        >
                          {trx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAppCurrency(trx.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {posTransactions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
