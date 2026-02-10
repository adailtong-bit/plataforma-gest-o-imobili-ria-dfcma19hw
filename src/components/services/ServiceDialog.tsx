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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GuestService } from '@/lib/types'
import { useState, useEffect } from 'react'

interface ServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (service: Partial<GuestService>) => void
  service: GuestService | null
}

export function ServiceDialog({
  open,
  onOpenChange,
  onSave,
  service,
}: ServiceDialogProps) {
  const [data, setData] = useState<Partial<GuestService>>({})

  useEffect(() => {
    setData(service || { name: '', price: 0, category: 'other' })
  }, [service, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? 'Edit Service' : 'New Service'}</DialogTitle>
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
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={data.category}
              onValueChange={(v: any) => setData({ ...data, category: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="dining">Dining</SelectItem>
                <SelectItem value="spa">Spa</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onSave(data)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
