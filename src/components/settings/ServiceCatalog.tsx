import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { ServiceRate } from '@/lib/types'
import { DataMask } from '@/components/DataMask'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export function ServiceCatalog() {
  const {
    genericServiceRates,
    addGenericServiceRate,
    updateGenericServiceRate,
    deleteGenericServiceRate,
  } = useFinancialStore()
  const { t, language } = useLanguageStore()
  const { toast } = useToast()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<Partial<ServiceRate>>({
    serviceName: '',
    partnerPayment: 0,
    pmValue: 0,
    productPrice: 0,
    validFrom: new Date().toISOString().split('T')[0],
  })

  const handleSave = () => {
    if (
      !editingRate.serviceName ||
      editingRate.productPrice === undefined ||
      editingRate.productPrice < 0
    ) {
      toast({
        title: t('common.error'),
        description: t('common.validation_error_desc'),
        variant: 'destructive',
      })
      return
    }

    const rate = {
      ...editingRate,
      partnerPayment: Number(editingRate.partnerPayment),
      pmValue: Number(editingRate.pmValue),
      productPrice: Number(editingRate.productPrice),
    } as ServiceRate

    if (rate.id) {
      updateGenericServiceRate(rate)
      toast({
        title: t('common.success'),
        description: t('common.config_saved_desc'),
      })
    } else {
      addGenericServiceRate({
        ...rate,
        id: `sr-${Date.now()}`,
        type: 'generic',
      })
      toast({
        title: t('common.success'),
        description: t('common.success_desc'),
      })
    }
    setIsDialogOpen(false)
    setEditingRate({
      serviceName: '',
      partnerPayment: 0,
      pmValue: 0,
      productPrice: 0,
      validFrom: new Date().toISOString().split('T')[0],
    })
  }

  const handleDelete = (id: string) => {
    deleteGenericServiceRate(id)
    toast({
      title: t('common.success'),
      description: t('common.delete_success'),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {t('service_pricing.catalog_tab')}
        </h3>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> {t('service_pricing.new_rate')}
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('service_pricing.service_name')}</TableHead>
              <TableHead>{t('service_pricing.partner_payment')}</TableHead>
              <TableHead>{t('service_pricing.pm_value')}</TableHead>
              <TableHead>{t('service_pricing.product_price')}</TableHead>
              <TableHead>{t('service_pricing.margin')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {genericServiceRates.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-muted-foreground"
                >
                  {t('common.empty')}
                </TableCell>
              </TableRow>
            ) : (
              genericServiceRates.map((rate) => {
                const margin =
                  rate.productPrice - (rate.partnerPayment + rate.pmValue)
                return (
                  <TableRow key={rate.id}>
                    <TableCell className="font-medium">
                      {rate.serviceName}
                    </TableCell>
                    <TableCell>
                      <DataMask blur>
                        {formatCurrency(rate.partnerPayment, language)}
                      </DataMask>
                    </TableCell>
                    <TableCell>
                      <DataMask blur>
                        {formatCurrency(rate.pmValue, language)}
                      </DataMask>
                    </TableCell>
                    <TableCell>
                      <DataMask>
                        {formatCurrency(rate.productPrice, language)}
                      </DataMask>
                    </TableCell>
                    <TableCell>
                      <DataMask blur>
                        <span
                          className={
                            margin >= 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {formatCurrency(margin, language)}
                        </span>
                      </DataMask>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingRate(rate)
                            setIsDialogOpen(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(rate.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRate.id
                ? t('common.edit') + ' ' + t('common.rate')
                : t('service_pricing.new_rate')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('service_pricing.service_name')}</Label>
              <Input
                value={editingRate.serviceName}
                onChange={(e) =>
                  setEditingRate({
                    ...editingRate,
                    serviceName: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>{t('service_pricing.partner_payment')}</Label>
                <Input
                  type="number"
                  value={editingRate.partnerPayment}
                  onChange={(e) =>
                    setEditingRate({
                      ...editingRate,
                      partnerPayment: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('service_pricing.pm_value')}</Label>
                <Input
                  type="number"
                  value={editingRate.pmValue}
                  onChange={(e) =>
                    setEditingRate({
                      ...editingRate,
                      pmValue: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('service_pricing.product_price')}</Label>
                <Input
                  type="number"
                  value={editingRate.productPrice}
                  onChange={(e) =>
                    setEditingRate({
                      ...editingRate,
                      productPrice: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('service_pricing.valid_from')}</Label>
              <Input
                type="date"
                value={editingRate.validFrom}
                onChange={(e) =>
                  setEditingRate({ ...editingRate, validFrom: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
