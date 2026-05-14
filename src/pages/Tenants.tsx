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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PhoneInput } from '@/components/ui/phone-input'
import { applyDocumentMask, applyZipCodeMask } from '@/lib/utils'
import { DocumentVault } from '@/components/documents/DocumentVault'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tenant } from '@/lib/types'
import { CurrencyInput } from '@/components/ui/currency-input'

export default function Tenants() {
  const { tenants, addTenant, updateTenant, formatAppCurrency, currency } =
    useContext(AppContext)!
  const { t, language } = useLanguageStore()
  const { toast } = useToast()
  const locale = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }[language] || 'en-US'

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Tenant>>({})

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({ country: 'US' })
    setIsOpen(true)
  }
  const handleOpenEdit = (tenant: Tenant) => {
    setEditingId(tenant.id)
    setForm({ country: 'US', ...tenant })
    setIsOpen(true)
  }

  const handleSave = () => {
    if (editingId) {
      updateTenant({ ...form } as Tenant)
      toast({ title: t('common.tenant_updated') })
    } else {
      addTenant({
        ...form,
        id: `tenant-${Date.now()}`,
        name: form.name || t('common.new'),
        status: 'active',
        role: 'tenant',
        rentValue: form.rentValue || 0,
      } as Tenant)
      toast({
        title: t('common.tenant_added'),
        description: form.email
          ? `Invitation email automatically sent to ${form.email} for password setup.`
          : 'Tenant created successfully.',
      })
    }
    setIsOpen(false)
  }

  const ctry = (form.country as 'US' | 'BR' | 'ES') || 'US'

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.tenants')}
          </h1>
          <p className="text-muted-foreground">{t('tenants.subtitle')}</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-trust-blue gap-2 text-white"
        >
          <Plus className="h-4 w-4" /> {t('common.add')}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black">
          <DialogHeader>
            <DialogTitle>
              {editingId ? t('common.edit_tenant') : t('common.add_tenant')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="space-y-1">
              <Label>{t('common.country')}</Label>
              <Select
                value={form.country || 'US'}
                onValueChange={(v) => setForm({ ...form, country: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select_country')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">{t('common.country_us')}</SelectItem>
                  <SelectItem value="BR">{t('common.country_br')}</SelectItem>
                  <SelectItem value="ES">{t('common.country_es')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Tabs defaultValue="personal" className="w-full mt-2">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="personal">
                {t('common.personal_data')}
              </TabsTrigger>
              <TabsTrigger value="contact">
                {t('common.contact_address')}
              </TabsTrigger>
              <TabsTrigger value="documents">
                {t('common.documents')}
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="personal"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-1">
                <Label>{t('common.full_name_label')}</Label>
                <Input
                  value={form.name || ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('common.email')}</Label>
                <Input
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('common.tax_id_label')}</Label>
                <Input
                  maxLength={18}
                  value={form.cpfCnpj || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cpfCnpj: applyDocumentMask(e.target.value, ctry),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>{t('common.rg_id')}</Label>
                <Input
                  value={form.rg || ''}
                  onChange={(e) => setForm({ ...form, rg: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('common.dob')}</Label>
                <Input
                  type="date"
                  value={form.dob || ''}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('common.nationality')}</Label>
                <Input
                  value={form.nationality || ''}
                  onChange={(e) =>
                    setForm({ ...form, nationality: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>{t('common.marital_status')}</Label>
                <Select
                  value={form.maritalStatus || ''}
                  onValueChange={(v) => setForm({ ...form, maritalStatus: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">{t('common.single')}</SelectItem>
                    <SelectItem value="Married">
                      {t('common.married')}
                    </SelectItem>
                    <SelectItem value="Divorced">
                      {t('common.divorced')}
                    </SelectItem>
                    <SelectItem value="Widowed">
                      {t('common.widowed')}
                    </SelectItem>
                    <SelectItem value="Other">{t('common.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('common.profession')}</Label>
                <Input
                  value={form.profession || ''}
                  onChange={(e) =>
                    setForm({ ...form, profession: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>{t('common.monthly_income')}</Label>
                <CurrencyInput
                  value={form.monthlyIncome || 0}
                  onChange={(v) => setForm({ ...form, monthlyIncome: v })}
                  currency={currency}
                  locale={locale}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('common.base_rent')}</Label>
                <CurrencyInput
                  value={form.rentValue || 0}
                  onChange={(v) => setForm({ ...form, rentValue: v })}
                  currency={currency}
                  locale={locale}
                />
              </div>
            </TabsContent>
            <TabsContent value="contact" className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3 border-b pb-2">
                  {t('common.phone')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label>{t('common.phone')}</Label>
                    <PhoneInput
                      value={form.phone || ''}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      country={ctry}
                      onCountryChange={(c) => setForm({ ...form, country: c })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('common.secondary_phone')}</Label>
                    <PhoneInput
                      value={form.secondaryPhone || ''}
                      onChange={(e) =>
                        setForm({ ...form, secondaryPhone: e.target.value })
                      }
                      country={ctry}
                      onCountryChange={(c) => setForm({ ...form, country: c })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t('common.whatsapp')}</Label>
                    <PhoneInput
                      value={form.whatsapp || ''}
                      onChange={(e) =>
                        setForm({ ...form, whatsapp: e.target.value })
                      }
                      country={ctry}
                      onCountryChange={(c) => setForm({ ...form, country: c })}
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-3 border-b pb-2">
                  {t('common.address')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 md:col-span-1">
                    <Label>{t('common.zip_code')}</Label>
                    <Input
                      maxLength={10}
                      value={form.zipCode || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          zipCode: applyZipCodeMask(e.target.value, ctry),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label>{t('common.street')}</Label>
                    <Input
                      value={form.address || ''}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>{t('common.number')}</Label>
                    <Input
                      value={form.addressNumber || ''}
                      onChange={(e) =>
                        setForm({ ...form, addressNumber: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>{t('common.complement')}</Label>
                    <Input
                      value={form.complement || ''}
                      onChange={(e) =>
                        setForm({ ...form, complement: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>{t('common.neighborhood')}</Label>
                    <Input
                      value={form.neighborhood || ''}
                      onChange={(e) =>
                        setForm({ ...form, neighborhood: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>{t('common.city')}</Label>
                    <Input
                      value={form.city || ''}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-1">
                    <Label>{t('common.state')}</Label>
                    <Input
                      value={form.state || ''}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="documents">
              <DocumentVault
                documents={form.documents || []}
                onUpdate={(docs) => setForm({ ...form, documents: docs })}
                canEdit={true}
                entityContext={
                  form.name
                    ? {
                        id: editingId || 'new',
                        name: form.name,
                        type: 'tenant',
                      }
                    : undefined
                }
              />
            </TabsContent>
          </Tabs>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-slate-200 shadow-sm bg-white">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('common.tax_id_label')}</TableHead>
                <TableHead>{t('common.email')}</TableHead>
                <TableHead>{t('common.base_rent')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <DataMask>{tenant.name}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{tenant.cpfCnpj || '-'}</DataMask>
                  </TableCell>
                  <TableCell>
                    <DataMask>{tenant.email}</DataMask>
                  </TableCell>
                  <TableCell>{formatAppCurrency(tenant.rentValue)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`status.${tenant.status}`) || tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(tenant)}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> {t('common.edit')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('common.delete_tenant')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('common.delete_tenant_desc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel')}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                toast({ title: t('common.delete_success') })
                              }
                            >
                              {t('common.confirm')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    {t('common.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
