import { useState, useContext } from 'react'
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
} from 'lucide-react'
import usePublicityStore from '@/stores/usePublicityStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { AppContext } from '@/stores/AppContext'
import { useToast } from '@/hooks/use-toast'
import { Advertisement } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CurrencyInput } from '@/components/ui/currency-input'

export function AdsManager() {
  const {
    advertisements,
    advertisers,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
  } = usePublicityStore()
  const appContext = useContext(AppContext)
  const currency = appContext?.currency || 'USD'
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
    advertiserId: '',
    price: 0,
    startDate: '',
    endDate: '',
  }
  const [formData, setFormData] =
    useState<Partial<Advertisement>>(initialFormState)

  const filteredAds = advertisements.filter((a) =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpen = (ad?: Advertisement) => {
    if (ad) {
      setEditingId(ad.id)
      setFormData({ ...ad })
    } else {
      setEditingId(null)
      setFormData(initialFormState)
    }
    setIsOpen(true)
  }

  const handleSave = () => {
    if (!formData.title || !formData.imageUrl || !formData.advertiserId) {
      toast({
        title: t('common.validation_error'),
        description: t('publicity.ads_manager.validation_error'),
        variant: 'destructive',
      })
      return
    }

    if (editingId) {
      updateAdvertisement({ ...formData, id: editingId } as Advertisement)
      toast({ title: t('publicity.ads_manager.update_success') })
    } else {
      addAdvertisement({
        ...formData,
        id: `ad-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as Advertisement)
      toast({ title: t('publicity.ads_manager.add_success') })
    }
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    if (confirm(t('publicity.ads_manager.delete_confirm'))) {
      deleteAdvertisement(id)
      toast({ title: t('publicity.ads_manager.delete_success') })
    }
  }

  const getAdvertiserName = (id?: string) => {
    if (!id) return t('publicity.ads_manager.unknown')
    const adv = advertisers.find((a) => a.id === id)
    return adv ? adv.name : t('publicity.ads_manager.unknown')
  }

  const getPlacementTranslation = (placement: string) => {
    switch (placement) {
      case 'home_top':
        return t('publicity.ads_manager.placements.home_top')
      case 'home_bottom':
        return t('publicity.ads_manager.placements.home_bottom')
      case 'partner_page':
        return t('publicity.ads_manager.placements.partner_page')
      case 'tenant_page':
        return t('publicity.ads_manager.placements.tenant_page')
      case 'pm_login':
        return t('publicity.ads_manager.placements.pm_login')
      case 'sidebar':
        return t('publicity.ads_manager.placements.sidebar')
      case 'footer':
        return t('publicity.ads_manager.placements.footer')
      default:
        return placement.replace('_', ' ')
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>{t('publicity.ads_manager.title')}</CardTitle>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('publicity.ads_manager.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button onClick={() => handleOpen()} className="gap-2 bg-trust-blue">
            <Plus className="h-4 w-4" /> {t('publicity.ads_manager.add_btn')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('publicity.ads_manager.table_ad_info')}</TableHead>
              <TableHead>
                {t('publicity.ads_manager.table_advertiser')}
              </TableHead>
              <TableHead>
                {t('publicity.ads_manager.table_placement')}
              </TableHead>
              <TableHead>{t('publicity.ads_manager.table_validity')}</TableHead>
              <TableHead>{t('publicity.ads_manager.table_price')}</TableHead>
              <TableHead>{t('publicity.ads_manager.table_status')}</TableHead>
              <TableHead className="text-right">
                {t('common.actions')}
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
                  {t('publicity.ads_manager.empty_state')}
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
                          <LinkIcon className="h-3 w-3" />{' '}
                          {t('publicity.ads_manager.link')}
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getAdvertiserName(ad.advertiserId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {getPlacementTranslation(ad.placement || '')}
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
                  <TableCell className="font-semibold text-green-700">
                    {formatCurrency(ad.price || 0, currency)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={ad.active ? 'default' : 'secondary'}
                      className={ad.active ? 'bg-green-600' : ''}
                    >
                      {ad.active
                        ? t('publicity.ads_manager.active')
                        : t('publicity.ads_manager.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId
                  ? t('publicity.ads_manager.modal_edit')
                  : t('publicity.ads_manager.modal_new')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('publicity.ads_manager.label_title')}</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('publicity.ads_manager.label_advertiser')}</Label>
                  <Select
                    value={formData.advertiserId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, advertiserId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'publicity.ads_manager.select_advertiser',
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {advertisers.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('publicity.ads_manager.label_placement')}</Label>
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
                      <SelectItem value="home_top">
                        {t('publicity.ads_manager.placements.home_top')}
                      </SelectItem>
                      <SelectItem value="home_bottom">
                        {t('publicity.ads_manager.placements.home_bottom')}
                      </SelectItem>
                      <SelectItem value="partner_page">
                        {t('publicity.ads_manager.placements.partner_page')}
                      </SelectItem>
                      <SelectItem value="tenant_page">
                        {t('publicity.ads_manager.placements.tenant_page')}
                      </SelectItem>
                      <SelectItem value="pm_login">
                        {t('publicity.ads_manager.placements.pm_login')}
                      </SelectItem>
                      <SelectItem value="sidebar">
                        {t('publicity.ads_manager.placements.sidebar')}
                      </SelectItem>
                      <SelectItem value="footer">
                        {t('publicity.ads_manager.placements.footer')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t('publicity.ads_manager.label_price')}</Label>
                  <CurrencyInput
                    value={formData.price}
                    onChange={(v) => setFormData({ ...formData, price: v })}
                    currency={currency}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('publicity.ads_manager.label_start_date')}</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('publicity.ads_manager.label_end_date')}</Label>
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
                  <ImageIcon className="h-4 w-4" />{' '}
                  {t('publicity.ads_manager.label_image_url')}
                </Label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://img.usecurling.com/p/800/200?q=ad"
                />
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />{' '}
                  {t('publicity.ads_manager.label_target_link')}
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
                  <Label className="text-base">
                    {t('publicity.ads_manager.active_status')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('publicity.ads_manager.active_status_desc')}
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
                {t('publicity.ads_manager.save_ad')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
