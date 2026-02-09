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
import { GuestService, SeasonalPrice } from '@/lib/types'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'

interface ServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (service: Partial<GuestService>) => void
  service?: GuestService | null
}

export function ServiceDialog({
  open,
  onOpenChange,
  onSave,
  service,
}: ServiceDialogProps) {
  const { t, language } = useLanguageStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<GuestService>>({
    name: '',
    description: '',
    price: 0,
    category: 'other',
    active: true,
    validityStart: '',
    seasonalPrices: [],
  })

  // Seasonal Price Temp State
  const [newSeasonal, setNewSeasonal] = useState<Partial<SeasonalPrice>>({
    startDate: '',
    endDate: '',
    price: 0,
  })

  useEffect(() => {
    if (service) {
      setFormData(service)
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'other',
        active: true,
        validityStart: '',
        seasonalPrices: [],
      })
    }
  }, [service, open])

  const handleSave = () => {
    if (!formData.name || !formData.price) {
      toast({
        title: t('common.error'),
        description: t('guest_services.service_name') + ' ' + t('common.required'),
        variant: 'destructive',
      })
      return
    }

    if (!formData.validityStart) {
      toast({
        title: t('common.error'),
        description:
          t('guest_services.validity_start') + ' ' + t('common.required'),
        variant: 'destructive',
      })
      return
    }

    onSave(formData)
    onOpenChange(false)
  }

  const addSeasonalPrice = () => {
    if (
      !newSeasonal.startDate ||
      !newSeasonal.endDate ||
      newSeasonal.price === undefined
    ) {
      return
    }

    const price: SeasonalPrice = {
      id: `sp-${Date.now()}`,
      startDate: newSeasonal.startDate,
      endDate: newSeasonal.endDate,
      price: Number(newSeasonal.price),
    }

    setFormData({
      ...formData,
      seasonalPrices: [...(formData.seasonalPrices || []), price],
    })
    setNewSeasonal({ startDate: '', endDate: '', price: 0 })
  }

  const removeSeasonalPrice = (id: string) => {
    setFormData({
      ...formData,
      seasonalPrices: formData.seasonalPrices?.filter((sp) => sp.id !== id),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {service ? t('pos.edit') : t('guest_services.new_service')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('guest_services.service_name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{t('guest_services.description')}</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">{t('guest_services.price')}</Label>
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
              <Label htmlFor="category">{t('guest_services.category')}</Label>
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
                  <SelectItem value="spa">Spa</SelectItem>
                  <SelectItem value="transport">Transporte</SelectItem>
                  <SelectItem value="dining">Restaurante</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="validityStart">
              {t('guest_services.validity_start')}
            </Label>
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
            <Label htmlFor="active">{t('common.active')}</Label>
          </div>

          <div className="border-t pt-4 mt-2">
            <Label className="mb-2 block font-bold">
              {t('guest_services.seasonal_pricing')}
            </Label>
            <div className="grid grid-cols-3 gap-2 mb-2 items-end">
              <div className="grid gap-1">
                <Label className="text-xs">
                  {t('guest_services.start_date')}
                </Label>
                <Input
                  type="date"
                  value={newSeasonal.startDate}
                  onChange={(e) =>
                    setNewSeasonal({
                      ...newSeasonal,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">{t('guest_services.end_date')}</Label>
                <Input
                  type="date"
                  value={newSeasonal.endDate}
                  onChange={(e) =>
                    setNewSeasonal({ ...newSeasonal, endDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label className="text-xs">{t('guest_services.price')}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newSeasonal.price}
                    onChange={(e) =>
                      setNewSeasonal({
                        ...newSeasonal,
                        price: Number(e.target.value),
                      })
                    }
                  />
                  <Button size="icon" onClick={addSeasonalPrice}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('guest_services.start_date')}</TableHead>
                  <TableHead>{t('guest_services.end_date')}</TableHead>
                  <TableHead>{t('guest_services.price')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData.seasonalPrices?.map((sp) => (
                  <TableRow key={sp.id}>
                    <TableCell>{sp.startDate}</TableCell>
                    <TableCell>{sp.endDate}</TableCell>
                    <TableCell>
                      {formatCurrency(sp.price, language)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSeasonalPrice(sp.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
