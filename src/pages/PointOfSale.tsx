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
import { Plus, Pencil, Trash2, MoreHorizontal, Eye } from 'lucide-react'
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

  const [search, setSearch] = useState('')
  const [searchTrx, setSearchTrx] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PosItem | null>(null)
  const [form, setForm] = useState<Partial<PosItem>>({
    name: '',
    price: 0,
    category: 'minibar',
    active: true,
  })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredItems = posItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredTrx = posTransactions.filter((trx) =>
    trx.id.toLowerCase().includes(searchTrx.toLowerCase()),
  )

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

  const handleDelete = () => {
    if (deleteId) {
      deletePosItem(deleteId)
      toast({ title: t('common.delete_success') })
      setDeleteId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.pos')}
          </h1>
          <p className="text-muted-foreground">
            {t('pos.subtitle') || 'Manage POS items and view transactions.'}
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
            <div className="p-4 border-b flex justify-between items-center">
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
                  {filteredItems.map((item) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingRecord(item)
                                setForm(item)
                                setIsAddOpen(true)
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />{' '}
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />{' '}
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredItems.length === 0 && (
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
            <div className="p-4 border-b">
              <Input
                placeholder="Search Transaction ID..."
                value={searchTrx}
                onChange={(e) => setSearchTrx(e.target.value)}
                className="w-64"
              />
            </div>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.total')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrx.slice(0, 50).map((trx) => (
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
                  {filteredTrx.length === 0 && (
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
