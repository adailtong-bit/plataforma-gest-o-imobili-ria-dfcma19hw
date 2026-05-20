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
  MoreHorizontal,
  ShoppingCart,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { format } from 'date-fns'
import { PosItem } from '@/lib/types'
import { DataMask } from '@/components/DataMask'
import { ProductDialog } from '@/components/pos/ProductDialog'
import { getCurrentPrice } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

export default function PointOfSale() {
  const {
    posItems,
    addPosItem,
    updatePosItem,
    deletePosItem,
    posTransactions,
    formatAppCurrency,
    addPosTransaction,
    addInvoice,
    bookings,
  } = useContext(AppContext)!
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [searchTrx, setSearchTrx] = useState('')

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<PosItem | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // POS Sale State
  const [isSellOpen, setIsSellOpen] = useState(false)
  const [cart, setCart] = useState<{ item: PosItem; quantity: number }[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<string>('')

  const activeBookings = bookings.filter(
    (b) => b.status === 'checked_in' || b.status === 'confirmed',
  )

  const filteredItems = posItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()),
  )

  const filteredTrx = posTransactions.filter((trx) =>
    trx.id.toLowerCase().includes(searchTrx.toLowerCase()),
  )

  const handleSave = (form: Partial<PosItem>) => {
    if (editingRecord) {
      updatePosItem({ ...editingRecord, ...form } as PosItem)
      toast({ title: t('common.success') })
    } else {
      addPosItem({
        id: `pos-${Date.now()}`,
        name: form.name!,
        price: Number(form.price) || 0,
        category: form.category || 'minibar',
        active: form.active ?? true,
        prices: form.prices || [],
      } as PosItem)
      toast({ title: t('common.success') })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
  }

  const handleDelete = () => {
    if (deleteId) {
      deletePosItem(deleteId)
      toast({ title: t('common.delete_success') })
      setDeleteId(null)
    }
  }

  const addToCart = (item: PosItem) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.item.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.item.id === item.id ? { ...p, quantity: p.quantity + 1 } : p,
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
  }

  const handleCheckout = () => {
    if (cart.length === 0) return

    if (!selectedBookingId) {
      toast({
        title: t('common.validation_error'),
        description: 'Selecione a reserva para faturar.',
        variant: 'destructive',
      })
      return
    }

    const total = cart.reduce(
      (acc, c) =>
        acc + getCurrentPrice(c.item.price, c.item.prices) * c.quantity,
      0,
    )

    const handleCheckoutAsync = async () => {
      addPosTransaction({
        id: `trx-${Date.now()}`,
        bookingId: selectedBookingId,
        items: cart.map((c) => ({
          itemId: c.item.id,
          name: c.item.name,
          quantity: c.quantity,
          price: getCurrentPrice(c.item.price, c.item.prices),
        })),
        totalAmount: total,
        timestamp: new Date().toISOString(),
        status: 'charged',
      })

      const description = `Consumo PDV: ${cart.map((c) => `${c.quantity}x ${c.item.name}`).join(', ')}`

      // Add to invoice as line item
      addInvoice({
        id: `inv-pos-${Date.now()}`,
        description,
        amount: total,
        status: 'pending',
        date: new Date().toISOString(),
        type: 'generic',
        bookingId: selectedBookingId,
      })

      // Add to ledger
      const { error } = await supabase.from('ledger_entries').insert({
        description,
        amount: total,
        type: 'income',
        category: 'consumption',
        cost_type: 'consumption',
        date: new Date().toISOString(),
        status: 'pending',
        booking_id: selectedBookingId,
      })

      if (error) {
        console.error('Failed to create ledger entry:', error)
      }

      toast({
        title: 'Venda finalizada',
        description:
          'O valor foi lançado na fatura da reserva e no livro razão (ledger).',
      })
      setIsSellOpen(false)
      setCart([])
      setSelectedBookingId('')
    }

    handleCheckoutAsync()
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.pos')}
          </h1>
          <p className="text-muted-foreground">
            Gestão de produtos e registro de consumo nas faturas dos hóspedes.
          </p>
        </div>
        <Button
          onClick={() => setIsSellOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
        >
          <ShoppingCart className="h-4 w-4" /> Nova Venda PDV
        </Button>
      </div>

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">{t('pos.manage_products')}</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
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
              <Button
                className="bg-trust-blue gap-2 text-white"
                onClick={() => {
                  setEditingRecord(null)
                  setIsAddOpen(true)
                }}
              >
                <Plus className="h-4 w-4" /> {t('common.add')}
              </Button>
            </div>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.category')}</TableHead>
                    <TableHead>Preço Atual</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const currentPrice = getCurrentPrice(
                      item.price,
                      item.prices,
                    )
                    return (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium text-slate-900">
                          <DataMask>{item.name}</DataMask>
                          {item.prices && item.prices.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.prices.length} preço(s) agendado(s)
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="capitalize">
                          {item.category}
                        </TableCell>
                        <TableCell className="font-medium">
                          <DataMask>{formatAppCurrency(currentPrice)}</DataMask>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={item.active ? 'default' : 'secondary'}
                          >
                            {item.active
                              ? t('common.active')
                              : t('common.inactive')}
                          </Badge>
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
                    )
                  })}
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
                    <TableHead>Reserva</TableHead>
                    <TableHead>Itens</TableHead>
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
                        <DataMask>
                          {bookings.find((b) => b.id === trx.bookingId)
                            ?.guestName || trx.bookingId}
                        </DataMask>
                      </TableCell>
                      <TableCell>
                        {trx.items
                          .map((i) => `${i.quantity}x ${i.name}`)
                          .join(', ')}
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
        </TabsContent>
      </Tabs>

      <ProductDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        product={editingRecord}
        onSave={handleSave}
      />

      <Dialog
        open={isSellOpen}
        onOpenChange={(v) => {
          setIsSellOpen(v)
          if (!v) setCart([])
        }}
      >
        <DialogContent className="max-w-3xl bg-white flex flex-col md:flex-row gap-0 p-0 overflow-hidden">
          <div className="w-full md:w-1/2 p-6 border-r border-slate-100 flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle>Produtos PDV</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto max-h-[400px] grid grid-cols-2 gap-2">
              {posItems
                .filter((i) => i.active)
                .map((item) => {
                  const price = getCurrentPrice(item.price, item.prices)
                  return (
                    <div
                      key={item.id}
                      className="border rounded-md p-3 cursor-pointer hover:border-trust-blue hover:bg-slate-50 transition-colors flex flex-col"
                      onClick={() => addToCart(item)}
                    >
                      <span className="font-medium text-sm line-clamp-2 mb-1">
                        {item.name}
                      </span>
                      <span className="text-trust-blue font-bold mt-auto">
                        {formatAppCurrency(price)}
                      </span>
                    </div>
                  )
                })}
            </div>
          </div>
          <div className="w-full md:w-1/2 bg-slate-50 p-6 flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle>Carrinho & Faturamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-2">
                <Label>Lançar para a Reserva *</Label>
                <Select
                  value={selectedBookingId}
                  onValueChange={setSelectedBookingId}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecione a reserva..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBookings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.guestName} ({b.propertyName})
                      </SelectItem>
                    ))}
                    {activeBookings.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhuma reserva ativa
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 border rounded bg-white p-2 overflow-y-auto max-h-[250px]">
                {cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    Carrinho Vazio
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {cart.map((c, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex gap-2">
                          <span className="font-medium text-slate-500">
                            {c.quantity}x
                          </span>
                          <span className="line-clamp-1">{c.item.name}</span>
                        </div>
                        <span className="font-medium">
                          {formatAppCurrency(
                            getCurrentPrice(c.item.price, c.item.prices) *
                              c.quantity,
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-lg">
                <span>Total:</span>
                <span>
                  {formatAppCurrency(
                    cart.reduce(
                      (acc, c) =>
                        acc +
                        getCurrentPrice(c.item.price, c.item.prices) *
                          c.quantity,
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
            <DialogFooter className="mt-6 sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => setCart([])}
                disabled={cart.length === 0}
              >
                Limpar
              </Button>
              <Button
                onClick={handleCheckout}
                className="bg-trust-blue text-white"
                disabled={cart.length === 0 || !selectedBookingId}
              >
                Lançar Fatura
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

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
