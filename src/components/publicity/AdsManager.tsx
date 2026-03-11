import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import usePartnerStore from '@/stores/usePartnerStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useFinancialStore from '@/stores/useFinancialStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { useToast } from '@/hooks/use-toast'
import { Advertisement } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CurrencyInput } from '@/components/ui/currency-input'

export function AdsManager() {
  const {
    advertisements,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    advertisers,
  } = usePublicityStore()
  const { partners } = usePartnerStore()
  const { properties } = usePropertyStore()
  const { addLedgerEntry, addInvoice, currency } = useFinancialStore()

  const { t, language } = useLanguageStore()
  const { toast } = useToast()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const initialFormState: Partial<Advertisement> = {
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    active: true,
    placement: 'home_top',
    partnerId: 'none',
    propertyId: 'none',
    advertiserId: 'none',
    price: 0,
    baseCost: 0,
    pmCommissionType: 'percentage',
    pmCommissionValue: 0,
    finalPrice: 0,
    startDate: '',
    endDate: '',
    status: 'draft',
  }
  const [formData, setFormData] =
    useState<Partial<Advertisement>>(initialFormState)

  const filteredAds = advertisements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAutoExpire = (ad: Advertisement, manual: boolean = false) => {
    const finalAmt = ad.finalPrice || ad.price || 0

    if (finalAmt > 0) {
      if (ad.advertiserId && ad.advertiserId !== 'none') {
        const advertiser = advertisers.find((a) => a.id === ad.advertiserId)

        // Auto-generate invoice billed to the external advertiser
        addInvoice({
          id: `inv-adv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: `Advertisement Expiration: ${ad.title}`,
          amount: finalAmt,
          status: 'pending',
          date: new Date().toISOString(),
          toId: ad.advertiserId,
          type: 'generic',
        })

        // Auto-generate financial ledger entry as income
        addLedgerEntry({
          id: `ledg-adv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          propertyId: 'all',
          date: new Date().toISOString(),
          type: 'income',
          category: 'Marketing/Publicity',
          amount: finalAmt,
          description: `Ad Revenue: ${ad.title} (${advertiser?.name || 'Unknown'})`,
          status: 'pending',
          beneficiaryId: ad.advertiserId,
        })
      } else if (ad.propertyId && ad.propertyId !== 'none') {
        // Bill the property owner
        addLedgerEntry({
          id: `ledg-ad-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          propertyId: ad.propertyId,
          date: new Date().toISOString(),
          type: 'expense',
          category: 'Marketing/Publicity',
          amount: finalAmt,
          description: `Marketing Campaign: ${ad.title}`,
          status: 'pending',
        })
      }

      if (
        ad.partnerId &&
        ad.partnerId !== 'none' &&
        ad.baseCost &&
        ad.baseCost > 0
      ) {
        // Pay the executing partner
        addInvoice({
          id: `inv-ad-part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          description: `Ad Execution: ${ad.title}`,
          amount: ad.baseCost,
          status: 'pending',
          date: new Date().toISOString(),
          toId: ad.partnerId,
          type: 'generic',
        })
      }
    }

    updateAdvertisement({
      ...ad,
      status: manual ? 'finalized' : 'expired',
      active: false,
    })
    toast({
      title: manual
        ? 'Advertisement finalized and billed successfully.'
        : 'Ad Expired',
      description: manual
        ? undefined
        : `The advertisement "${ad.title}" has expired and its billing was processed automatically.`,
    })
  }

  // Effect to automatically expire and bill advertisements
  useEffect(() => {
    const checkExpired = () => {
      const today = new Date().toISOString().split('T')[0]
      const expiredAds = advertisements.filter(
        (ad) =>
          ad.active &&
          ad.endDate &&
          ad.endDate < today &&
          ad.status !== 'expired' &&
          ad.status !== 'finalized',
      )

      expiredAds.forEach((ad) => {
        handleAutoExpire(ad, false)
      })
    }

    checkExpired()
    // Intentionally run only once on mount to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOpen = (ad?: Advertisement) => {
    if (ad) {
      setEditingId(ad.id)
      setFormData({
        ...ad,
        propertyId: ad.propertyId || 'none',
        partnerId: ad.partnerId || 'none',
        advertiserId: ad.advertiserId || 'none',
      })
    } else {
      setEditingId(null)
      setFormData(initialFormState)
    }
    setIsOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.imageUrl) {
      toast({
        title: t('common.validation_error'),
        description:
          t('publicity.ads_manager.validation_error') ||
          'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    const pmValueCalculated =
      formData.pmCommissionType === 'percentage'
        ? (formData.baseCost || 0) * ((formData.pmCommissionValue || 0) / 100)
        : formData.pmCommissionValue || 0
    const finalPrice = (formData.baseCost || 0) + pmValueCalculated

    const payload = {
      ...formData,
      finalPrice,
      price: finalPrice,
      status: formData.status || 'draft',
      propertyId:
        formData.propertyId === 'none' ? undefined : formData.propertyId,
      partnerId: formData.partnerId === 'none' ? undefined : formData.partnerId,
      advertiserId:
        formData.advertiserId === 'none' ? undefined : formData.advertiserId,
    }

    if (editingId) {
      updateAdvertisement({ ...payload, id: editingId } as Advertisement)
      toast({
        title: t('publicity.ads_manager.update_success') || 'Ad updated.',
      })
    } else {
      addAdvertisement({
        ...payload,
        id: `ad-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Advertisement)
      toast({ title: t('publicity.ads_manager.add_success') || 'Ad created.' })
    }
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    if (
      confirm(
        t('publicity.ads_manager.delete_confirm') ||
          'Are you sure you want to delete this ad?',
      )
    ) {
      deleteAdvertisement(id)
      toast({
        title: t('publicity.ads_manager.delete_success') || 'Ad deleted.',
      })
    }
  }

  const handleFinalize = (ad: Advertisement) => {
    if (
      confirm(
        'Finalize ad? This will record the necessary financial entries and generate invoices depending on the target.',
      )
    ) {
      handleAutoExpire(ad, true)
    }
  }

  const pmValueCalculated =
    formData.pmCommissionType === 'percentage'
      ? (formData.baseCost || 0) * ((formData.pmCommissionValue || 0) / 100)
      : formData.pmCommissionValue || 0
  const finalPriceCalculated = (formData.baseCost || 0) + pmValueCalculated

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>
          {t('publicity.ads_manager.title') || 'Campaigns & Ads'}
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                t('publicity.ads_manager.search_placeholder') || 'Search ads...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpen()} className="gap-2 bg-trust-blue">
            <Plus className="h-4 w-4" />{' '}
            {t('publicity.ads_manager.add_btn') || 'New Campaign'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {t('publicity.ads_manager.table_ad_info') || 'Ad Info'}
              </TableHead>
              <TableHead>Target / Partner / Advertiser</TableHead>
              <TableHead>
                {t('publicity.ads_manager.table_placement') || 'Placement'}
              </TableHead>
              <TableHead>
                {t('publicity.ads_manager.table_validity') || 'Validity'}
              </TableHead>
              <TableHead>Financials</TableHead>
              <TableHead>
                {t('publicity.ads_manager.table_status') || 'Status'}
              </TableHead>
              <TableHead className="text-right">
                {t('common.actions') || 'Actions'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAds.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-muted-foreground"
                >
                  {t('publicity.ads_manager.empty_state') ||
                    'No campaigns found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredAds.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 bg-muted rounded overflow-hidden flex-shrink-0 border">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{ad.title}</span>
                        <a
                          href={ad.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                        >
                          <LinkIcon className="h-3 w-3" /> Link
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-slate-900">
                        {ad.advertiserId && ad.advertiserId !== 'none'
                          ? advertisers.find((a) => a.id === ad.advertiserId)
                              ?.name || 'Unknown Advertiser'
                          : ad.propertyId && ad.propertyId !== 'none'
                            ? properties.find((p) => p.id === ad.propertyId)
                                ?.name || 'Unknown Property'
                            : 'Global'}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {ad.advertiserId && ad.advertiserId !== 'none'
                          ? 'External Advertiser'
                          : ad.partnerId && ad.partnerId !== 'none'
                            ? partners.find((p) => p.id === ad.partnerId)
                                ?.name || 'No Partner'
                            : 'No Partner'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ad.placement?.replace('_', ' ') || 'Global'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span>
                        {ad.startDate
                          ? formatDate(ad.startDate, language)
                          : 'N/A'}
                      </span>
                      <span className="text-muted-foreground">
                        to{' '}
                        {ad.endDate ? formatDate(ad.endDate, language) : 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(
                          ad.finalPrice || ad.price || 0,
                          currency,
                        )}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        Base: {formatCurrency(ad.baseCost || 0, currency)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {ad.status === 'finalized' || ad.status === 'expired' ? (
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-700 capitalize"
                      >
                        {ad.status}
                      </Badge>
                    ) : ad.active ? (
                      <Badge className="bg-green-600 text-white border-transparent">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Draft/Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {ad.status !== 'finalized' && ad.status !== 'expired' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFinalize(ad)}
                        title="Finalize & Bill"
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpen(ad)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {editingId
                  ? t('publicity.ads_manager.modal_edit') || 'Edit Campaign'
                  : t('publicity.ads_manager.modal_new') || 'New Campaign'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    {t('publicity.ads_manager.label_title') || 'Title'}
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    {t('publicity.ads_manager.label_placement') || 'Placement'}
                  </Label>
                  <Select
                    value={formData.placement}
                    onValueChange={(v: any) =>
                      setFormData({ ...formData, placement: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home_top">Home Top</SelectItem>
                      <SelectItem value="home_bottom">Home Bottom</SelectItem>
                      <SelectItem value="partner_page">Partner Page</SelectItem>
                      <SelectItem value="tenant_page">Tenant Page</SelectItem>
                      <SelectItem value="performance">
                        Performance Dashboard
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Target Property</Label>
                  <Select
                    value={formData.propertyId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, propertyId: v })
                    }
                    disabled={formData.advertiserId !== 'none'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Global / No Property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Global (No Property)</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Executor Partner</Label>
                  <Select
                    value={formData.partnerId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, partnerId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Advertiser (External)</Label>
                  <Select
                    value={formData.advertiserId || 'none'}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        advertiserId: v,
                        propertyId: v !== 'none' ? 'none' : formData.propertyId,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Advertiser" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Internal Campaign</SelectItem>
                      {advertisers.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-b py-4 my-2 border-slate-100">
                <div className="grid gap-2">
                  <Label>Base Cost</Label>
                  <CurrencyInput
                    value={formData.baseCost || 0}
                    onChange={(v) => setFormData({ ...formData, baseCost: v })}
                    currency={currency}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>PM Commission</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.pmCommissionType || 'percentage'}
                      onValueChange={(v: any) =>
                        setFormData({ ...formData, pmCommissionType: v })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">$</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.pmCommissionType === 'fixed' ? (
                      <CurrencyInput
                        value={formData.pmCommissionValue || 0}
                        onChange={(v) =>
                          setFormData({ ...formData, pmCommissionValue: v })
                        }
                        currency={currency}
                      />
                    ) : (
                      <Input
                        type="number"
                        value={formData.pmCommissionValue || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pmCommissionValue: Number(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Final Price (Billed Amount)</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-slate-50 font-bold text-slate-800">
                    {formatCurrency(finalPriceCalculated, currency)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>
                    {t('publicity.ads_manager.label_start_date') ||
                      'Start Date'}
                  </Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    {t('publicity.ads_manager.label_end_date') || 'End Date'}
                  </Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Image URL
                </Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> Target Link URL
                </Label>
                <Input
                  value={formData.linkUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between border rounded-md p-4 mt-2">
                <div>
                  <Label className="text-base">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Is this campaign currently active?
                  </p>
                </div>
                <Switch
                  checked={formData.active}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, active: c })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue">
                {t('publicity.ads_manager.save_ad') || 'Save Campaign'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
