import { useState } from 'react'
import usePartnerStore from '@/stores/usePartnerStore'
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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
  User,
  Phone,
  MapPin,
  Briefcase,
} from 'lucide-react'
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'
import { Partner } from '@/lib/types'
import { Link } from 'react-router-dom'
import { AddressInput } from '@/components/ui/address-input'

export default function Partners() {
  const { partners, addPartner, updatePartner, deletePartner } =
    usePartnerStore()

  const { t } = useLanguageStore()
  const { toast } = useToast()

  const [search, setSearch] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Partner | null>(null)

  const initialFormState: Partial<Partner> = {
    name: '',
    companyName: '',
    type: '',
    entityType: 'company',
    email: '',
    phone: '',
    cpfCnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  }
  const [form, setForm] = useState<Partial<Partner>>(initialFormState)

  const filteredPartners = partners.filter((p) => {
    const term = search.toLowerCase()
    return (
      (p?.name || '').toLowerCase().includes(term) ||
      (p?.companyName || '').toLowerCase().includes(term) ||
      (p?.type || '').toLowerCase().includes(term) ||
      (p?.entityType || '').toLowerCase().includes(term)
    )
  })

  const handleAdd = () => {
    if (!form.name || !form.type) {
      toast({
        title: t('common.validation_error') || 'Validation Error',
        description: 'Name and Function are required.',
        variant: 'destructive',
      })
      return
    }

    if (addPartner) {
      addPartner({
        id: `partner-${Date.now()}`,
        name: form.name,
        companyName: form.companyName || '',
        type: form.type,
        entityType: form.entityType || 'company',
        email: form.email || '',
        phone: form.phone || '',
        cpfCnpj: form.cpfCnpj || '',
        address: form.address || '',
        city: form.city || '',
        state: form.state || '',
        zipCode: form.zipCode || '',
        status: 'active',
        role: 'partner',
        serviceRates: [],
        employees: [],
      } as Partner)
    }

    setIsAddOpen(false)
    setForm(initialFormState)
    toast({
      title: t('common.success') || 'Success',
      description: 'Partner successfully added.',
    })
  }

  const handleEdit = () => {
    if (!form.name || !form.type) {
      toast({
        title: t('common.validation_error') || 'Validation Error',
        description: 'Name and Function are required.',
        variant: 'destructive',
      })
      return
    }

    if (editingRecord && updatePartner) {
      updatePartner({
        ...editingRecord,
        name: form.name,
        companyName: form.companyName || '',
        type: form.type,
        entityType: form.entityType || 'company',
        email: form.email || '',
        phone: form.phone || '',
        cpfCnpj: form.cpfCnpj || '',
        address: form.address || '',
        city: form.city || '',
        state: form.state || '',
        zipCode: form.zipCode || '',
      } as Partner)
    }
    setEditingRecord(null)
    setIsAddOpen(false)
    toast({
      title: t('common.success') || 'Success',
      description: 'Partner successfully updated.',
    })
  }

  const handleDelete = (id: string) => {
    if (deletePartner) {
      deletePartner(id)
      toast({
        title: t('common.delete_success') || 'Deleted',
        description: 'The partner has been removed.',
      })
    }
  }

  const openEdit = (partner: Partner) => {
    setEditingRecord(partner)
    setForm({
      name: partner.name,
      companyName: partner.companyName || '',
      type: partner.type || '',
      entityType: partner.entityType || 'company',
      email: partner.email || '',
      phone: partner.phone || '',
      cpfCnpj: partner.cpfCnpj || '',
      address: partner.address || '',
      city: partner.city || '',
      state: partner.state || '',
      zipCode: partner.zipCode || '',
    })
    setIsAddOpen(true)
  }

  const handleAddressSelect = (addr: any) => {
    setForm((prev) => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: addr.zipCode,
    }))
  }

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('sidebar.partners') || 'Partners'}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'partners.subtitle',
              'Manage service providers, functions, and teams.',
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search') || 'Search...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <Dialog
            open={isAddOpen}
            onOpenChange={(v) => {
              setIsAddOpen(v)
              if (!v) {
                setEditingRecord(null)
                setForm(initialFormState)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue gap-2 text-white shrink-0">
                <Plus className="h-4 w-4" /> {t('common.add') || 'Add Partner'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord
                    ? t('common.edit') || 'Edit Partner'
                    : t('common.add') || 'Add Partner'}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label>Type</Label>
                  <RadioGroup
                    value={form.entityType}
                    onValueChange={(val) =>
                      setForm({
                        ...form,
                        entityType: val as 'individual' | 'company',
                      })
                    }
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="company" id="company" />
                      <Label
                        htmlFor="company"
                        className="font-normal flex items-center gap-1 cursor-pointer"
                      >
                        <Building2 className="h-4 w-4" /> Company
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label
                        htmlFor="individual"
                        className="font-normal flex items-center gap-1 cursor-pointer"
                      >
                        <User className="h-4 w-4" /> Individual
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>
                    {form.entityType === 'company'
                      ? 'Company/Trade Name'
                      : 'Full Name'}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                {form.entityType === 'company' && (
                  <div className="space-y-2">
                    <Label>Legal/Corporate Name</Label>
                    <Input
                      placeholder="Corporate Name"
                      value={form.companyName}
                      onChange={(e) =>
                        setForm({ ...form, companyName: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    Tax ID (CPF/CNPJ/EIN){' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Tax ID"
                    value={form.cpfCnpj}
                    onChange={(e) =>
                      setForm({ ...form, cpfCnpj: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Function / Category <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Cleaning, Maintenance, Plumbing"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('common.email') || 'Email'}</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('common.phone') || 'Phone'}</Label>
                  <Input
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2 col-span-2 mt-2">
                  <Label className="font-semibold text-base border-b pb-1 mb-2 block">
                    Address
                  </Label>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Search Address</Label>
                  <AddressInput onAddressSelect={handleAddressSelect} />
                </div>

                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Street</Label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Zip Code</Label>
                  <Input
                    value={form.zipCode}
                    onChange={(e) =>
                      setForm({ ...form, zipCode: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                  {t('common.cancel') || 'Cancel'}
                </Button>
                <Button
                  onClick={editingRecord ? handleEdit : handleAdd}
                  className="bg-trust-blue text-white"
                >
                  {t('common.save') || 'Save'}
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
                <TableHead>{t('common.name') || 'Name'}</TableHead>
                <TableHead>{t('partners.table.type', 'Type')}</TableHead>
                <TableHead>
                  {t('partners.table.function', 'Function')}
                </TableHead>
                <TableHead>{t('partners.table.contact', 'Contact')}</TableHead>
                <TableHead>{t('common.status') || 'Status'}</TableHead>
                <TableHead className="text-right">
                  {t('common.actions') || 'Actions'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners.map((partner) => (
                <TableRow key={partner?.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      {partner.entityType === 'individual' ? (
                        <User className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Building2 className="h-4 w-4 text-slate-400" />
                      )}
                      <DataMask>{partner?.name}</DataMask>
                    </div>
                    {partner.companyName && (
                      <div className="text-xs text-muted-foreground ml-6">
                        <DataMask>{partner.companyName}</DataMask>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">
                    {partner.entityType || 'company'}
                  </TableCell>
                  <TableCell className="capitalize">
                    <div className="flex flex-col items-start gap-1">
                      <Badge
                        variant="outline"
                        className="font-normal bg-slate-50"
                      >
                        {partner?.type || 'unknown'}
                      </Badge>
                      {(partner as any).origin === 'tenant_promotion' && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Promoted Tenant
                        </Badge>
                      )}
                      {(partner as any).origin === 'opporjob' && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 h-4 bg-indigo-50 text-indigo-700 border-indigo-200"
                        >
                          Opporjob
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm text-slate-600">
                      {partner.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />{' '}
                          <DataMask>{partner.phone}</DataMask>
                        </span>
                      )}
                      {partner.city && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />{' '}
                          <DataMask>
                            {partner.city}, {partner.state}
                          </DataMask>
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        partner?.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {partner?.status || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/partners/${partner?.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-slate-700"
                        >
                          {t('common.view') || 'View'}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(partner)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />{' '}
                        {t('common.edit') || 'Edit'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />{' '}
                            {t('common.delete') || 'Delete'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('common.confirm_delete') || 'Confirm Deletion'}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('common.delete_desc') ||
                                'This action cannot be undone.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t('common.cancel') || 'Cancel'}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(partner?.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {t('common.delete') || 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPartners.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
    </div>
  )
}
