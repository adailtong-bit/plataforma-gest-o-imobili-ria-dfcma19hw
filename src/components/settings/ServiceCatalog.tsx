import { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
  Layers,
  BellRing,
} from 'lucide-react'
import usePartnerStore from '@/stores/usePartnerStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { format, differenceInDays } from 'date-fns'
import { ServiceRate } from '@/lib/types'
import { ServiceCategoriesDialog } from './ServiceCategoriesDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils'

export function ServiceCatalog() {
  const {
    partners,
    updatePartner,
    genericServiceRates,
    addGenericServiceRate,
    updateGenericServiceRate,
    deleteGenericServiceRate,
    serviceCategories,
  } = usePartnerStore()
  const { financialSettings, updateFinancialSettings } = useFinancialStore()
  const { t, language } = useLanguageStore()
  const { toast } = useToast()

  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [open, setOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('generic')

  // Config State
  const [reviewThreshold, setReviewThreshold] = useState(
    financialSettings.priceReviewThresholdDays || 180,
  )

  const priceReviewThreshold = financialSettings.priceReviewThresholdDays || 180

  const [currentRate, setCurrentRate] = useState<Partial<ServiceRate>>({
    serviceName: '',
    servicePrice: 0,
    partnerPayment: 0,
    pmValue: 0,
    productPrice: 0,
    validFrom: format(new Date(), 'yyyy-MM-dd'),
    validTo: '',
    type: 'generic',
    categoryId: '',
    lastUpdated: new Date().toISOString(),
  })

  const handlePriceChange = (
    field: keyof ServiceRate,
    val: string | number,
  ) => {
    const numVal = Number(val)
    const newRate = { ...currentRate, [field]: numVal }

    if (field === 'servicePrice' || field === 'partnerPayment') {
      const sp =
        field === 'servicePrice' ? numVal : Number(currentRate.servicePrice)
      const pp =
        field === 'partnerPayment' ? numVal : Number(currentRate.partnerPayment)
      // Recalculate PM Value
      newRate.pmValue = sp - pp
    }

    setCurrentRate(newRate)
  }

  // Flatten all service rates including generic
  const partnerRates = partners.flatMap((partner) =>
    (partner.serviceRates || []).map((rate) => ({
      ...rate,
      partnerName: partner.name,
      partnerId: partner.id,
      partnerType: partner.type,
      isGeneric: false,
    })),
  )

  const genericRatesFormatted = genericServiceRates.map((rate) => ({
    ...rate,
    partnerName: t('service_pricing.generic'),
    partnerId: 'generic',
    partnerType: 'System',
    isGeneric: true,
  }))

  const allRates = [...genericRatesFormatted, ...partnerRates]

  const filteredRates = allRates.filter((rate) => {
    const matchesText =
      rate.serviceName.toLowerCase().includes(filter.toLowerCase()) ||
      rate.partnerName.toLowerCase().includes(filter.toLowerCase())

    const matchesCategory =
      categoryFilter === 'all' || rate.categoryId === categoryFilter

    return matchesText && matchesCategory
  })

  const staleRatesCount = useMemo(() => {
    return allRates.filter((rate) => {
      if (!rate.lastUpdated) return false
      return (
        differenceInDays(new Date(), new Date(rate.lastUpdated)) >
        priceReviewThreshold
      )
    }).length
  }, [allRates, priceReviewThreshold])

  const handleSave = () => {
    if (!currentRate.serviceName || !currentRate.servicePrice) {
      toast({
        title: t('common.error'),
        description: t('service_pricing.service_name') + ' required.',
        variant: 'destructive',
      })
      return
    }

    const rateData: ServiceRate = {
      id: currentRate.id || `rate-${Date.now()}`,
      serviceName: currentRate.serviceName,
      servicePrice: Number(currentRate.servicePrice || 0),
      partnerPayment: Number(currentRate.partnerPayment || 0),
      pmValue: Number(currentRate.pmValue || 0),
      productPrice: Number(currentRate.productPrice || 0),
      validFrom:
        currentRate.validFrom?.toString() || format(new Date(), 'yyyy-MM-dd'),
      validTo: currentRate.validTo?.toString(),
      type: selectedPartnerId === 'generic' ? 'generic' : 'specific',
      categoryId: currentRate.categoryId,
      lastUpdated: new Date().toISOString(),
    }

    if (selectedPartnerId === 'generic') {
      if (editMode && currentRate.id) {
        updateGenericServiceRate(rateData)
      } else {
        addGenericServiceRate(rateData)
      }
    } else {
      const partner = partners.find((p) => p.id === selectedPartnerId)
      if (!partner) return

      let updatedRates = partner.serviceRates ? [...partner.serviceRates] : []

      if (editMode && currentRate.id) {
        updatedRates = updatedRates.map((r) =>
          r.id === currentRate.id ? rateData : r,
        )
      } else {
        updatedRates.push(rateData)
      }

      updatePartner({ ...partner, serviceRates: updatedRates })
    }

    toast({
      title: t('common.save'),
      description: editMode ? 'Service updated.' : 'Service added to catalog.',
    })

    setOpen(false)
    resetForm()
  }

  const handleSaveConfig = () => {
    updateFinancialSettings({
      ...financialSettings,
      priceReviewThresholdDays: reviewThreshold,
    })
    setConfigDialogOpen(false)
    toast({
      title: t('service_pricing.config_saved'),
      description: t('service_pricing.config_saved_desc'),
    })
  }

  const handleDelete = (partnerId: string, rateId: string) => {
    if (confirm(t('common.confirm'))) {
      if (partnerId === 'generic') {
        deleteGenericServiceRate(rateId)
      } else {
        const partner = partners.find((p) => p.id === partnerId)
        if (!partner) return

        const updatedRates = (partner.serviceRates || []).filter(
          (r) => r.id !== rateId,
        )
        updatePartner({ ...partner, serviceRates: updatedRates })
      }

      toast({
        title: t('common.delete'),
        description: 'Service removed from catalog.',
      })
    }
  }

  const openAdd = () => {
    setEditMode(false)
    resetForm()
    setOpen(true)
  }

  const openEdit = (rate: any) => {
    setEditMode(true)
    setSelectedPartnerId(rate.partnerId)
    setCurrentRate({
      id: rate.id,
      serviceName: rate.serviceName,
      servicePrice: rate.servicePrice,
      partnerPayment: rate.partnerPayment,
      pmValue: rate.pmValue,
      productPrice: rate.productPrice,
      validFrom: rate.validFrom,
      validTo: rate.validTo || '',
      type: rate.type,
      categoryId: rate.categoryId,
      lastUpdated: rate.lastUpdated,
    })
    setOpen(true)
  }

  const resetForm = () => {
    setSelectedPartnerId('generic')
    setCurrentRate({
      serviceName: '',
      servicePrice: 0,
      partnerPayment: 0,
      pmValue: 0,
      productPrice: 0,
      validFrom: format(new Date(), 'yyyy-MM-dd'),
      validTo: '',
      type: 'generic',
      categoryId: '',
      lastUpdated: new Date().toISOString(),
    })
  }

  const getCategoryBadge = (categoryId?: string) => {
    const cat = serviceCategories.find((c) => c.id === categoryId)
    if (!cat) return null
    return (
      <Badge
        variant="outline"
        className="border-0 text-white"
        style={{ backgroundColor: cat.color }}
      >
        {cat.name}
      </Badge>
    )
  }

  return (
    <>
      <ServiceCategoriesDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
      />

      <div className="flex flex-col gap-4">
        {staleRatesCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">
              {t('service_pricing.stale_alert', {
                count: String(staleRatesCount),
                days: String(priceReviewThreshold),
              })}
            </span>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>{t('service_pricing.title')}</CardTitle>
                <CardDescription>
                  {t('service_pricing.subtitle')}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog
                  open={configDialogOpen}
                  onOpenChange={setConfigDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      title="Configure Alerts"
                    >
                      <BellRing className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t('service_pricing.review_period_config')}
                      </DialogTitle>
                      <DialogDescription>
                        {t('service_pricing.review_period_desc')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>{t('service_pricing.threshold_days')}</Label>
                        <Input
                          type="number"
                          value={reviewThreshold}
                          onChange={(e) =>
                            setReviewThreshold(Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveConfig}>
                        {t('common.save')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={() => setCategoryDialogOpen(true)}
                >
                  <Layers className="mr-2 h-4 w-4" />{' '}
                  {t('service_pricing.manage_categories')}
                </Button>
                <Button onClick={openAdd} className="bg-trust-blue">
                  <Plus className="mr-2 h-4 w-4" />{' '}
                  {t('service_pricing.add_service')}
                </Button>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle>
                      {editMode
                        ? t('service_pricing.edit_service')
                        : t('service_pricing.add_service')}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('service_pricing.partner_vendor')}</Label>
                        <Select
                          value={selectedPartnerId}
                          onValueChange={setSelectedPartnerId}
                          disabled={editMode}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="generic">
                              {t('service_pricing.generic')}
                            </SelectItem>
                            {partners.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('service_pricing.category')}</Label>
                        <Select
                          value={currentRate.categoryId || 'none'}
                          onValueChange={(val) =>
                            setCurrentRate({
                              ...currentRate,
                              categoryId: val === 'none' ? undefined : val,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              {t('common.none')}
                            </SelectItem>
                            {serviceCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: cat.color }}
                                  />
                                  {cat.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>{t('service_pricing.service_name')}</Label>
                      <Input
                        value={currentRate.serviceName}
                        onChange={(e) =>
                          setCurrentRate({
                            ...currentRate,
                            serviceName: e.target.value,
                          })
                        }
                        placeholder="e.g. Standard Cleaning 2 Bed"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg border">
                      <div className="grid gap-2">
                        <Label className="text-xs">
                          {t('service_pricing.service_price')}
                        </Label>
                        <Input
                          type="number"
                          value={currentRate.servicePrice}
                          onChange={(e) =>
                            handlePriceChange('servicePrice', e.target.value)
                          }
                          placeholder="0.00"
                          className="font-bold"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs text-muted-foreground">
                          {t('service_pricing.partner_payment')}
                        </Label>
                        <Input
                          type="number"
                          value={currentRate.partnerPayment}
                          onChange={(e) =>
                            handlePriceChange('partnerPayment', e.target.value)
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs text-muted-foreground">
                          {t('service_pricing.pm_value')}
                        </Label>
                        <Input
                          type="number"
                          value={currentRate.pmValue}
                          onChange={(e) =>
                            setCurrentRate({
                              ...currentRate,
                              pmValue: Number(e.target.value),
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs">
                          {t('service_pricing.product_price')}
                        </Label>
                        <Input
                          type="number"
                          value={currentRate.productPrice}
                          onChange={(e) =>
                            setCurrentRate({
                              ...currentRate,
                              productPrice: Number(e.target.value),
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      PM Value is auto-calculated as (Service Price - Partner
                      Payment), but can be adjusted.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{t('service_pricing.valid_from')}</Label>
                        <Input
                          type="date"
                          value={
                            currentRate.validFrom
                              ? format(
                                  new Date(currentRate.validFrom),
                                  'yyyy-MM-dd',
                                )
                              : ''
                          }
                          onChange={(e) =>
                            setCurrentRate({
                              ...currentRate,
                              validFrom: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t('service_pricing.valid_to')}</Label>
                        <Input
                          type="date"
                          value={
                            currentRate.validTo
                              ? format(
                                  new Date(currentRate.validTo),
                                  'yyyy-MM-dd',
                                )
                              : ''
                          }
                          onChange={(e) =>
                            setCurrentRate({
                              ...currentRate,
                              validTo: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSave}>{t('common.save')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  className="pl-8"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="w-full md:w-[200px]">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.filter')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('service_pricing.service_name')}</TableHead>
                    <TableHead>{t('service_pricing.category')}</TableHead>
                    <TableHead>{t('common.partners')}</TableHead>
                    <TableHead>{t('service_pricing.service_price')}</TableHead>
                    <TableHead>{t('service_pricing.product_price')}</TableHead>
                    <TableHead>
                      {t('service_pricing.partner_payment')}
                    </TableHead>
                    <TableHead>{t('service_pricing.pm_value')}</TableHead>
                    <TableHead className="text-right">
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRates.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {t('common.none')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRates.map((rate) => {
                      const isStale =
                        rate.lastUpdated &&
                        differenceInDays(
                          new Date(),
                          new Date(rate.lastUpdated),
                        ) > priceReviewThreshold

                      return (
                        <TableRow key={`${rate.partnerId}-${rate.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {rate.serviceName}
                              </span>
                              {isStale && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{t('service_pricing.review_needed')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getCategoryBadge(rate.categoryId)}
                          </TableCell>
                          <TableCell>
                            {rate.isGeneric ? (
                              <Badge variant="secondary">
                                {t('service_pricing.generic')}
                              </Badge>
                            ) : (
                              rate.partnerName
                            )}
                          </TableCell>
                          <TableCell className="font-bold">
                            {formatCurrency(rate.servicePrice, language)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(rate.productPrice, language)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatCurrency(rate.partnerPayment, language)}
                          </TableCell>
                          <TableCell className="text-green-600 font-medium">
                            {formatCurrency(rate.pmValue, language)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEdit(rate)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                onClick={() =>
                                  handleDelete(rate.partnerId, rate.id)
                                }
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
          </CardContent>
        </Card>
      </div>
    </>
  )
}
