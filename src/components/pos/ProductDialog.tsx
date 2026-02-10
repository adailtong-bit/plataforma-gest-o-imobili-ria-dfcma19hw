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
            <Label>Price</Label>
            <Input
              type="number"
              value={data.price}
              onChange={(e) =>
                setData({ ...data, price: Number(e.target.value) })
              }
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
