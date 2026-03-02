import { useContext, useState } from 'react'
import { AppContext } from '@/stores/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { ServiceRate } from '@/lib/types'
import { DataMask } from '@/components/DataMask'
import { CurrencyInput } from '@/components/ui/currency-input'
import { formatCurrency } from '@/lib/utils'

const countryToCurrency: Record<string, string> = {
  US: 'USD',
  BR: 'BRL',
  ES: 'EUR',
}

const countryToLocale: Record<string, string> = {
  US: 'en-US',
  BR: 'pt-BR',
  ES: 'es-ES',
}

export default function ServicePricing() {
  const {
    genericServiceRates,
    addGenericServiceRate,
    updateGenericServiceRate,
    deleteGenericServiceRate,
  } = useContext(AppContext)!
  const { t, language } = useLanguageStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ServiceRate | null>(null)

  const defaultForm: Partial<ServiceRate> = {
    serviceName: '',
    country: 'US',
    servicePrice: 0,
    productPrice: 0,
    pmValue: 0,
    partnerPayment: 0,
    validFrom: new Date().toISOString().split('T')[0],
  }
  const [form, setForm] = useState<Partial<ServiceRate>>(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filteredRates = genericServiceRates.filter((r) =>
    r.serviceName.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = () => {
    if (!form.serviceName) {
      toast({
        title: t('common.error') || 'Error',
        variant: 'destructive',
      })
      return
    }

    if (editingRecord) {
      updateGenericServiceRate({ ...editingRecord, ...form } as ServiceRate)
      toast({ title: t('common.success') || 'Success' })
    } else {
      addGenericServiceRate({
        id: `sr-${Date.now()}`,
        serviceName: form.serviceName,
        country: form.country || 'US',
        servicePrice: Number(form.servicePrice) || 0,
        productPrice: Number(form.productPrice) || 0,
        pmValue: Number(form.pmValue) || 0,
        partnerPayment: Number(form.partnerPayment) || 0,
        validFrom: form.validFrom || new Date().toISOString().split('T')[0],
      } as ServiceRate)
      toast({ title: t('common.success') || 'Success' })
    }
    setIsAddOpen(false)
    setEditingRecord(null)
    setForm(defaultForm)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteGenericServiceRate(deleteId)
      toast({ title: t('common.delete_success') || 'Deleted successfully' })
      setDeleteId(null)
    }
  }

  const currentCurrency = countryToCurrency[form.country || 'US'] || 'USD'
  const currentLocale = countryToLocale[form.country || 'US'] || 'en-US'

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('service_pricing.title')}
          </h1>
          <p className="text-muted-foreground">{t('service_pricing.desc')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t('common.search') || 'Search...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm(defaultForm)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white">
                <Plus className="h-4 w-4" /> {t('common.add') || 'Add'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord
                    ? t('common.edit') || 'Edit'
                    : t('common.add') || 'Add'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>{t('common.country')}</Label>
                  <Select
                    value={form.country || 'US'}
                    onValueChange={(val: any) =>
                      setForm({ ...form, country: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.select_country')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">
                        {t('common.country_us')}
                      </SelectItem>
                      <SelectItem value="BR">
                        {t('common.country_br')}
                      </SelectItem>
                      <SelectItem value="ES">
                        {t('common.country_es')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('service_pricing.service_name')}</Label>
                  <Input
                    value={form.serviceName}
                    onChange={(e) =>
                      setForm({ ...form, serviceName: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('service_pricing.cost_price')}</Label>
                    <CurrencyInput
                      value={form.servicePrice}
                      onChange={(val) =>
                        setForm({ ...form, servicePrice: val })
                      }
                      currency={currentCurrency}
                      locale={currentLocale}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('service_pricing.product_price')}</Label>
                    <CurrencyInput
                      value={form.productPrice}
                      onChange={(val) =>
                        setForm({ ...form, productPrice: val })
                      }
                      currency={currentCurrency}
                      locale={currentLocale}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-trust-blue text-white"
                >
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('service_pricing.service_name')}</TableHead>
                <TableHead>{t('common.country')}</TableHead>
                <TableHead>{t('service_pricing.cost_price')}</TableHead>
                <TableHead className="text-right">
                  {t('service_pricing.product_price')}
                </TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRates.map((service) => {
                const cur = countryToCurrency[service.country || 'US'] || 'USD'
                const formatOpts = {
                  style: 'currency',
                  currency: cur,
                }
                return (
                  <TableRow key={service.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      <DataMask>{service.serviceName}</DataMask>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{service.country || 'US'}</Badge>
                    </TableCell>
                    <TableCell>
                      <DataMask>
                        {new Intl.NumberFormat(
                          countryToLocale[service.country || 'US'] || 'en-US',
                          formatOpts,
                        ).format(service.servicePrice)}
                      </DataMask>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <DataMask>
                        {new Intl.NumberFormat(
                          countryToLocale[service.country || 'US'] || 'en-US',
                          formatOpts,
                        ).format(service.productPrice)}
                      </DataMask>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingRecord(service)
                              setForm(service)
                              setIsAddOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />{' '}
                            {t('common.edit') || 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setDeleteId(service.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete') || 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredRates.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty') || 'No records found.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('common.confirm_delete') || 'Confirm Delete'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.delete_desc') || 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel') || 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('common.delete') || 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
