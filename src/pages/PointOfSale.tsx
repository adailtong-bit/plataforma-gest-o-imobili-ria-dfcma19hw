import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trash2,
  ShoppingCart,
  DollarSign,
  Package,
  Plus,
  Edit,
  Ban,
} from 'lucide-react'
import useManagementStore from '@/stores/useManagementStore'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { PosItem, PosTransaction } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ProductDialog } from '@/components/pos/ProductDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataMask } from '@/components/DataMask'

export default function PointOfSale() {
  const {
    posItems,
    addPosTransaction,
    addPosItem,
    updatePosItem,
    deletePosItem,
  } = useManagementStore()
  const { bookings } = useShortTermStore()
  const { properties, updateProperty } = usePropertyStore()
  const { toast } = useToast()
  const { t, language } = useLanguageStore()

  const [selectedBooking, setSelectedBooking] = useState('')
  const [cart, setCart] = useState<{ item: PosItem; quantity: number }[]>([])
  const [activeTab, setActiveTab] = useState('pos')

  // Product Management State
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<PosItem | null>(null)

  const activeBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'checked_in',
  )

  const globalStock = properties.find((p) => p.id === 'stock_main')

  const addToCart = (itemId: string) => {
    const item = posItems.find((i) => i.id === itemId)
    if (!item) return

    // Check stock availability (based on name matching for simplicity)
    const stockItem = globalStock?.inventory?.find(
      (inv) => inv.name.toLowerCase() === item.name.toLowerCase(),
    )

    const currentInCart = cart.find((c) => c.item.id === itemId)?.quantity || 0

    if (stockItem && stockItem.quantity <= currentInCart) {
      toast({
        title: t('pos.out_of_stock'),
        description: `Only ${stockItem.quantity} units of ${item.name} available.`,
        variant: 'destructive',
      })
      return
    }

    const existing = cart.find((c) => c.item.id === itemId)
    if (existing) {
      setCart(
        cart.map((c) =>
          c.item.id === itemId ? { ...c, quantity: c.quantity + 1 } : c,
        ),
      )
    } else {
      setCart([...cart, { item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId))
  }

  const totalAmount = cart.reduce(
    (acc, c) => acc + c.item.price * c.quantity,
    0,
  )

  const handleCheckout = () => {
    if (!selectedBooking) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }
    if (cart.length === 0) {
      toast({
        title: t('common.error'),
        description: t('pos.cart_empty'),
        variant: 'destructive',
      })
      return
    }

    // Deduct from Global Inventory
    if (globalStock && globalStock.inventory) {
      const updatedInventory = [...globalStock.inventory]
      let stockUpdated = false

      cart.forEach((cartItem) => {
        const invIndex = updatedInventory.findIndex(
          (inv) => inv.name.toLowerCase() === cartItem.item.name.toLowerCase(),
        )
        if (invIndex >= 0) {
          updatedInventory[invIndex].quantity -= cartItem.quantity
          stockUpdated = true
        }
      })

      if (stockUpdated) {
        updateProperty({ ...globalStock, inventory: updatedInventory })
      }
    }

    const transaction: PosTransaction = {
      id: `pos-${Date.now()}`,
      bookingId: selectedBooking,
      items: cart.map((c) => ({
        itemId: c.item.id,
        name: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
      })),
      totalAmount,
      timestamp: new Date().toISOString(),
      status: 'charged',
    }

    addPosTransaction(transaction)
    setCart([])
    setSelectedBooking('')
    toast({
      title: t('pos.transaction_success'),
      description: `${t('pos.charge_room')}: ${formatCurrency(totalAmount, language)}`,
    })
  }

  const handleSaveProduct = (product: Partial<PosItem>) => {
    if (editingProduct) {
      updatePosItem({ ...editingProduct, ...product } as PosItem)
      toast({ title: t('pos.save_success') })
    } else {
      addPosItem({
        ...product,
        id: `pos-item-${Date.now()}`,
        active: true,
      } as PosItem)
      toast({ title: t('pos.save_success') })
    }
    setProductDialogOpen(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm(t('pos.delete_desc'))) {
      deletePosItem(id)
      toast({ title: t('common.success') })
    }
  }

  const handleInactivateProduct = (item: PosItem) => {
    updatePosItem({ ...item, active: !item.active })
    toast({ title: t('common.success') })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('pos.title')}
          </h1>
          <p className="text-muted-foreground">{t('pos.subtitle')}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="pos">{t('pos.title')}</TabsTrigger>
          <TabsTrigger value="management">
            {t('pos.manage_products')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-slate-50 text-slate-700"
                  >
                    <Package className="h-3 w-3 mr-1" /> {t('pos.stock')}{' '}
                    Connected
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {posItems
                  .filter((i) => i.active)
                  .map((item) => {
                    const stockItem = globalStock?.inventory?.find(
                      (inv) =>
                        inv.name.toLowerCase() === item.name.toLowerCase(),
                    )
                    const inStock = stockItem ? stockItem.quantity : 999 // Fallback high if no stock track

                    return (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden"
                        onClick={() => {
                          if (inStock > 0) addToCart(item.id)
                        }}
                      >
                        {inStock === 0 && (
                          <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center font-bold text-red-600">
                            {t('pos.out_of_stock')}
                          </div>
                        )}
                        <CardHeader className="p-4">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-bold">
                              <DataMask>{item.name}</DataMask>
                            </CardTitle>
                            {stockItem && (
                              <Badge
                                variant="secondary"
                                className={
                                  inStock < 10
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }
                              >
                                {inStock} left
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="capitalize">
                            {item.category}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-lg font-bold text-green-700">
                            <DataMask>
                              {formatCurrency(item.price, language)}
                            </DataMask>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="h-full flex flex-col border-l-4 border-l-trust-blue sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" /> Carrinho
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label>{t('short_term.guest')}</Label>
                    <Select
                      value={selectedBooking}
                      onValueChange={setSelectedBooking}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('common.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeBookings.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            <DataMask>
                              {b.guestName} - {b.propertyName}
                            </DataMask>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex-1 overflow-auto border rounded-md p-2 bg-slate-50 min-h-[200px]">
                    {cart.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground py-8 flex flex-col items-center">
                        <ShoppingCart className="h-8 w-8 opacity-20 mb-2" />
                        {t('pos.cart_empty')}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {cart.map((c) => (
                          <div
                            key={c.item.id}
                            className="flex justify-between items-center bg-white p-2 rounded border shadow-sm"
                          >
                            <div className="text-sm">
                              <div className="font-bold">
                                <DataMask>{c.item.name}</DataMask>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {c.quantity} x{' '}
                                {formatCurrency(c.item.price, language)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">
                                {formatCurrency(
                                  c.item.price * c.quantity,
                                  language,
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-red-500 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFromCart(c.item.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold mb-4">
                      <span>{t('common.total')}</span>
                      <span className="text-trust-blue">
                        {formatCurrency(totalAmount, language)}
                      </span>
                    </div>
                    <Button
                      className="w-full bg-trust-blue h-12 text-lg hover:bg-blue-800"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                    >
                      <DollarSign className="mr-2 h-5 w-5" />{' '}
                      {t('pos.charge_room')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="management">
          <div className="flex justify-end mb-4">
            <Button
              className="bg-trust-blue gap-2"
              onClick={() => {
                setEditingProduct(null)
                setProductDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> {t('pos.new_product')}
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('pos.product_name')}</TableHead>
                    <TableHead>{t('pos.category')}</TableHead>
                    <TableHead>{t('pos.price')}</TableHead>
                    <TableHead>{t('pos.validity_start')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">
                      {t('pos.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <DataMask>{item.name}</DataMask>
                      </TableCell>
                      <TableCell className="capitalize">
                        {item.category}
                      </TableCell>
                      <TableCell>
                        <DataMask>
                          {formatCurrency(item.price, language)}
                        </DataMask>
                      </TableCell>
                      <TableCell>{item.validityStart || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.active ? 'default' : 'secondary'}
                          className={item.active ? 'bg-green-600' : ''}
                        >
                          {item.active ? t('pos.active') : t('pos.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingProduct(item)
                              setProductDialogOpen(true)
                            }}
                            title={t('pos.edit')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleInactivateProduct(item)}
                            title={
                              item.active
                                ? t('pos.inactivate')
                                : t('pos.active')
                            }
                          >
                            <Ban
                              className={`h-4 w-4 ${item.active ? 'text-orange-500' : 'text-green-500'}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(item.id)}
                            title={t('pos.delete')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  )
}
