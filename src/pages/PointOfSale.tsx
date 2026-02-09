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
import { Trash2, ShoppingCart, DollarSign, Package } from 'lucide-react'
import useManagementStore from '@/stores/useManagementStore'
import useShortTermStore from '@/stores/useShortTermStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useToast } from '@/hooks/use-toast'
import { PosItem, PosTransaction } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function PointOfSale() {
  const { posItems, addPosTransaction } = useManagementStore()
  const { bookings } = useShortTermStore()
  const { properties, updateProperty } = usePropertyStore()
  const { toast } = useToast()

  const [selectedBooking, setSelectedBooking] = useState('')
  const [cart, setCart] = useState<{ item: PosItem; quantity: number }[]>([])

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
        title: 'Out of Stock',
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
        title: 'Error',
        description: 'Please select a guest/room.',
        variant: 'destructive',
      })
      return
    }
    if (cart.length === 0) {
      toast({
        title: 'Error',
        description: 'Cart is empty.',
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
      title: 'Transaction Successful',
      description: `Charged ${formatCurrency(totalAmount)} to folio. Inventory updated.`,
    })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-navy">
              Point of Sale
            </h1>
            <p className="text-muted-foreground">
              Internal POS for Minibar, Restaurant, and Services.
            </p>
          </div>
          {globalStock && (
            <Badge variant="outline" className="bg-slate-50 text-slate-700">
              <Package className="h-3 w-3 mr-1" /> Stock Connected
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {posItems.map((item) => {
            const stockItem = globalStock?.inventory?.find(
              (inv) => inv.name.toLowerCase() === item.name.toLowerCase(),
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
                    Out of Stock
                  </div>
                )}
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{item.name}</CardTitle>
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
                    {formatCurrency(item.price)}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="lg:col-span-1">
        <Card className="h-full flex flex-col border-l-4 border-l-trust-blue">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" /> Current Order
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="grid gap-2">
              <Label>Select Guest / Room</Label>
              <Select
                value={selectedBooking}
                onValueChange={setSelectedBooking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Search active booking..." />
                </SelectTrigger>
                <SelectContent>
                  {activeBookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.guestName} - {b.propertyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 overflow-auto border rounded-md p-2 bg-slate-50 min-h-[200px]">
              {cart.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8 flex flex-col items-center">
                  <ShoppingCart className="h-8 w-8 opacity-20 mb-2" />
                  Cart is empty
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map((c) => (
                    <div
                      key={c.item.id}
                      className="flex justify-between items-center bg-white p-2 rounded border shadow-sm"
                    >
                      <div className="text-sm">
                        <div className="font-bold">{c.item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.quantity} x {formatCurrency(c.item.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {formatCurrency(c.item.price * c.quantity)}
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
                <span>Total</span>
                <span className="text-trust-blue">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <Button
                className="w-full bg-trust-blue h-12 text-lg hover:bg-blue-800"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                <DollarSign className="mr-2 h-5 w-5" /> Charge to Room
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
