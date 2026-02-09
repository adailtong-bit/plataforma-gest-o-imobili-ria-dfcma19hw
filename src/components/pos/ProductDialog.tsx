import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { PosItem } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Partial<PosItem>) => void
  product?: PosItem | null
}

export function ProductDialog({
  open,
  onOpenChange,
  onSave,
  product,
}: ProductDialogProps) {
  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<PosItem>>({
    name: '',
    price: 0,
    category: 'minibar',
    active: true,
    validityStart: '',
  })

  useEffect(() => {
    if (product) {
      setFormData(product)
    } else {
      setFormData({
        name: '',
        price: 0,
        category: 'minibar',
        active: true,
        validityStart: '',
      })
    }
  }, [product, open])

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      toast({
        title: t('common.error'),
        description: t('pos.product_name') + ' ' + t('common.required'),
        variant: 'destructive',
      })
      return
    }

    if (!formData.validityStart) {
      toast({
        title: t('common.error'),
        description: t('pos.validity_start') + ' ' + t('common.required'),
        variant: 'destructive',
      })
      return
    }

    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {product ? t('pos.edit') : t('pos.new_product')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('pos.product_name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">{t('pos.price')}</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">{t('pos.category')}</Label>
              <Select
                value={formData.category}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, category: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minibar">Minibar</SelectItem>
                  <SelectItem value="restaurant">Restaurante</SelectItem>
                  <SelectItem value="laundry">Lavanderia</SelectItem>
                  <SelectItem value="shop">Loja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="validityStart">{t('pos.validity_start')}</Label>
            <Input
              id="validityStart"
              type="date"
              value={formData.validityStart || ''}
              onChange={(e) =>
                setFormData({ ...formData, validityStart: e.target.value })
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
            <Label htmlFor="active">{t('pos.active')}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue">
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
