import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PosItem } from '@/lib/types'
import { useState, useEffect } from 'react'
import { CurrencyInput } from '@/components/ui/currency-input'
import useFinancialStore from '@/stores/useFinancialStore'
import { getCurrencyLocale } from '@/lib/utils'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Partial<PosItem>) => void
  product: PosItem | null
}

export function ProductDialog({
  open,
  onOpenChange,
  onSave,
  product,
}: ProductDialogProps) {
  const [data, setData] = useState<Partial<PosItem>>({})
  const { currency } = useFinancialStore()
  const locale = getCurrencyLocale(currency)

  useEffect(() => {
    setData(product || { name: '', price: 0, category: 'minibar' })
  }, [product, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'New Product'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Price ({currency})</Label>
            <CurrencyInput
              value={data.price}
              onChange={(val) => setData({ ...data, price: val })}
              currency={currency}
              locale={locale}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(data)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
