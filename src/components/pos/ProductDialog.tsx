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
import { PosItem, ItemPrice } from '@/lib/types'
import { useState, useEffect } from 'react'
import { CurrencyInput } from '@/components/ui/currency-input'
import useFinancialStore from '@/stores/useFinancialStore'
import { getCurrencyLocale } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

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
  const { t } = useLanguageStore()
  const { currency } = useFinancialStore()
  const locale = getCurrencyLocale(currency)

  const [data, setData] = useState<Partial<PosItem>>({})
  const [prices, setPrices] = useState<ItemPrice[]>([])
  const [newPrice, setNewPrice] = useState<number>(0)
  const [newStartDate, setNewStartDate] = useState('')
  const [newEndDate, setNewEndDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setData(
      product || { name: '', price: 0, category: 'minibar', active: true },
    )
    setPrices(product?.prices || [])
    setNewPrice(0)
    setNewStartDate('')
    setNewEndDate('')
    setError('')
  }, [product, open])

  const handleAddPrice = () => {
    if (!newStartDate || !newEndDate) {
      setError(t('common.validation_error') + ': Datas são obrigatórias.')
      return
    }
    if (newStartDate > newEndDate) {
      setError(
        t('common.validation_error') +
          ': Data de Início deve ser anterior à Data de Término.',
      )
      return
    }
    setError('')
    setPrices([
      ...prices,
      {
        id: `price-${Date.now()}`,
        price: newPrice,
        startDate: newStartDate,
        endDate: newEndDate,
      },
    ])
    setNewPrice(0)
    setNewStartDate('')
    setNewEndDate('')
  }

  const handleRemovePrice = (id: string) => {
    setPrices(prices.filter((p) => p.id !== id))
  }

  const handleSave = () => {
    if (!data.name) {
      setError(t('common.name_required'))
      return
    }
    onSave({ ...data, prices })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>
            {product ? t('common.edit') : t('common.new')} Produto
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="grid gap-2">
            <Label>{t('common.name')} *</Label>
            <Input
              value={data.name || ''}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                {t('common.value')} Base ({currency}) *
              </Label>
              <CurrencyInput
                value={data.price || 0}
                onChange={(val) => setData({ ...data, price: val })}
                currency={currency}
                locale={locale}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('common.category')} *</Label>
              <Select
                value={data.category || 'minibar'}
                onValueChange={(v: any) => setData({ ...data, category: v })}
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

          <div className="border-t pt-4 mt-2">
            <Label className="text-base font-semibold mb-4 block">
              Preços Específicos por Período
            </Label>
            <div className="flex flex-col gap-3">
              {prices.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-slate-50 p-2 rounded border"
                >
                  <div className="text-sm">
                    <span className="font-medium">
                      {new Intl.NumberFormat(locale, {
                        style: 'currency',
                        currency,
                      }).format(p.price)}
                    </span>
                    <span className="text-slate-500 ml-2">
                      ({p.startDate} - {p.endDate})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 h-8 w-8"
                    onClick={() => handleRemovePrice(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="grid grid-cols-3 gap-2 items-end bg-slate-50 p-3 rounded border">
                <div className="grid gap-2 col-span-3 mb-2">
                  <Label>Novo Preço ({currency})</Label>
                  <CurrencyInput
                    value={newPrice}
                    onChange={(val) => setNewPrice(val)}
                    currency={currency}
                    locale={locale}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data de Término</Label>
                  <Input
                    type="date"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleAddPrice}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} className="bg-trust-blue text-white">
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
