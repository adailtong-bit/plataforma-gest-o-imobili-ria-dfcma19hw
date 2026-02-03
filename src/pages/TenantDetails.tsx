import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Mail,
  Save,
  User,
  Edit,
  X,
  Home,
  History,
  TrendingUp,
  CheckSquare,
  FileText,
  Link as LinkIcon,
  Unlink,
  Plus,
} from 'lucide-react'
import useTenantStore from '@/stores/useTenantStore'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DocumentVault } from '@/components/documents/DocumentVault'
import { Tenant, InventoryInspection, Property } from '@/lib/types'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InventoryInspectionModal } from '@/components/inventory/InventoryInspectionModal'
import { InventoryReportViewer } from '@/components/inventory/InventoryReportViewer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  isPhoneValid,
  applyZipCodeMask,
  isGenericOrPlaceholder,
} from '@/lib/utils'

export default function TenantDetails() {
  const { id } = useParams()
  const { tenants, updateTenant } = useTenantStore()
  const { properties, updateProperty } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const navigate = useNavigate()

  const tenant = tenants.find((t) => t.id === id)
  const property = properties.find((p) => p.id === tenant?.propertyId)
  const owner = owners.find((o) => o.id === property?.ownerId)

  const [formData, setFormData] = useState<Tenant | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Explicit country state management for editing validation
  const [phoneCountry, setPhoneCountry] = useState<'US' | 'BR' | 'ES'>('US')

  // Inspection Modal State
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false)
  const [inspectionType, setInspectionType] = useState<
    'check_in' | 'check_out'
  >('check_in')

  // Report Viewer State
  const [reportViewerOpen, setReportViewerOpen] = useState(false)
  const [selectedInspection, setSelectedInspection] =
    useState<InventoryInspection | null>(null)

  // Property Linking
  const [linkPropertyOpen, setLinkPropertyOpen] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('')

  // Referral Contact State
  const [newReferral, setNewReferral] = useState({
    name: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    if (tenant) {
      setFormData({ ...tenant })
      if (
        tenant.country === 'BR' ||
        tenant.country === 'ES' ||
        tenant.country === 'US'
      ) {
        setPhoneCountry(tenant.country)
      }
    }
  }, [tenant])

  if (!formData || !tenant)
    return (
      <div className="p-8 text-center text-black font-medium">
        Tenant Not Found
      </div>
    )

  const handleSave = () => {
    if (!formData) return

    if (isGenericOrPlaceholder(formData.name)) {
      toast({
        title: t('common.error'),
        description: 'Invalid name.',
        variant: 'destructive',
      })
      return
    }

    if (formData.phone && !isPhoneValid(formData.phone, phoneCountry)) {
      toast({
        title: t('common.error'),
        description: `Invalid phone format for ${phoneCountry}.`,
        variant: 'destructive',
      })
      return
    }

    updateTenant(formData)
    setIsEditing(false)
    toast({ title: 'Perfil atualizado com sucesso' })
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleAddressSelect = (addr: AddressData) => {
    const mappedCountry =
      addr.country === 'Brazil'
        ? 'BR'
        : addr.country === 'Spain'
          ? 'ES'
          : addr.country === 'USA'
            ? 'US'
            : phoneCountry

    setPhoneCountry(mappedCountry)

    setFormData((prev: any) => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: applyZipCodeMask(addr.zipCode, mappedCountry),
      country: mappedCountry,
    }))
  }

  const handleDocsUpdate = (docs: any) => {
    const updatedTenant = { ...formData, documents: docs }
    setFormData(updatedTenant)
    updateTenant(updatedTenant)
  }

  const handleSendMessage = () => {
    navigate(`/messages?contactId=${formData.id}`)
  }

  const handleInspectionSave = (inspection: InventoryInspection) => {
    const updatedInspections = [...(formData.inspections || []), inspection]
    const updatedTenant = { ...formData, inspections: updatedInspections }
    setFormData(updatedTenant)
    updateTenant(updatedTenant)
    toast({ title: 'Inspection Completed', description: 'Records updated.' })
  }

  const startInspection = (type: 'check_in' | 'check_out') => {
    if (!property?.inventory || property.inventory.length === 0) {
      toast({
        title: 'No Inventory',
        description: 'Property has no master inventory configured.',
        variant: 'destructive',
      })
      return
    }
    setInspectionType(type)
    setInspectionModalOpen(true)
  }

  const viewReport = (inspection: InventoryInspection) => {
    setSelectedInspection(inspection)
    setReportViewerOpen(true)
  }

  const handleLinkProperty = () => {
    if (!selectedPropertyId) return

    const selectedProp = properties.find((p) => p.id === selectedPropertyId)
    if (selectedProp) {
      updateProperty({ ...selectedProp, status: 'reserved' })
      const updatedTenant = { ...formData, propertyId: selectedPropertyId }
      setFormData(updatedTenant)
      updateTenant(updatedTenant)
      setLinkPropertyOpen(false)
      toast({
        title: 'Property Linked',
        description: `Linked to ${selectedProp.name}. Status set to Reserved.`,
      })
    }
  }

  const handleUnlinkProperty = () => {
    if (!property) return
    if (
      confirm('Unlink property? This will set property status to Available.')
    ) {
      updateProperty({ ...property, status: 'available' })
      const updatedTenant = { ...formData, propertyId: undefined }
      setFormData(updatedTenant)
      updateTenant(updatedTenant)
      toast({ title: 'Unlinked', description: 'Property association removed.' })
    }
  }

  const addReferralContact = () => {
    if (!newReferral.name) return
    const referrals = [...(formData.referralContacts || []), { ...newReferral }]
    setFormData({ ...formData, referralContacts: referrals })
    setNewReferral({ name: '', phone: '', email: '' })
  }

  const removeReferralContact = (index: number) => {
    const referrals = [...(formData.referralContacts || [])]
    referrals.splice(index, 1)
    setFormData({ ...formData, referralContacts: referrals })
  }

  const hasCheckIn = formData.inspections?.some((i) => i.type === 'check_in')
  const hasCheckOut = formData.inspections?.some((i) => i.type === 'check_out')

  const availableProperties = properties.filter(
    (p) => p.status === 'available' || p.status === 'interested',
  )

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-black font-medium bg-white p-2 rounded-md border w-fit shadow-sm">
          <Link to="/tenants" className="hover:text-black hover:underline">
            Inquilinos
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-black">{formData.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/tenants">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-black hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black">
                {formData.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-black font-medium mt-1">
                <Mail className="h-3 w-3" /> {formData.email}
                <span className="text-slate-400">•</span>
                <Badge
                  variant={
                    formData.status === 'active' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {formData.status === 'active' ? 'Ativo' : 'Outro'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-trust-blue"
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSendMessage} variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" /> Mensagem
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="default"
                  size="sm"
                >
                  <Edit className="mr-2 h-4 w-4" /> Editar Dados
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          {formData.status === 'active' && !hasCheckIn && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex justify-between items-center rounded-r-md">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-yellow-600" />
                <div>
                  <h3 className="font-bold text-yellow-900">
                    Mandatory Check-in Inspection
                  </h3>
                  <p className="text-sm text-yellow-800 font-medium">
                    This tenant is active but no check-in inventory record
                    exists.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => startInspection('check_in')}
              >
                Perform Check-in
              </Button>
            </div>
          )}

          {formData.status === 'past' && !hasCheckOut && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 flex justify-between items-center rounded-r-md">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-bold text-red-900">
                    Missing Check-out Inspection
                  </h3>
                  <p className="text-sm text-red-800 font-medium">
                    Tenant has left but no check-out inventory verification
                    found.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => startInspection('check_out')}
              >
                Perform Check-out
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <User className="h-5 w-5 text-trust-blue" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-black font-bold">
                        {t('common.country')}
                      </Label>
                      <Select
                        value={phoneCountry}
                        onValueChange={(val: any) => {
                          setPhoneCountry(val)
                          handleChange('country', val)
                          handleChange('zipCode', '') // Clear zip on country change
                        }}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="text-black font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">
                            United States (USA)
                          </SelectItem>
                          <SelectItem value="BR">Brazil (Brasil)</SelectItem>
                          <SelectItem value="ES">Spain (España)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-black font-bold">
                        Nome Completo
                      </Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        disabled={!isEditing}
                        className="text-black font-medium"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-black font-bold">Email</Label>
                      <Input
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="text-black font-medium"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-black font-bold">Telefone</Label>
                      {isEditing ? (
                        <PhoneInput
                          value={formData.phone || ''}
                          onChange={(e) =>
                            handleChange('phone', e.target.value)
                          }
                          country={phoneCountry}
                          onCountryChange={setPhoneCountry}
                          className="text-black"
                        />
                      ) : (
                        <Input
                          value={formData.phone || ''}
                          disabled
                          className="text-black font-medium"
                        />
                      )}
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label className="text-black font-bold">
                        Buscar Endereço
                      </Label>
                      <AddressInput
                        onAddressSelect={handleAddressSelect}
                        disabled={!isEditing}
                        className="text-black"
                      />
                    </div>
                    <div className="grid gap-2 col-span-2">
                      <Label className="text-black font-bold">
                        Endereço Completo
                      </Label>
                      <Input
                        value={formData.address || ''}
                        onChange={(e) =>
                          handleChange('address', e.target.value)
                        }
                        disabled={!isEditing}
                        className="text-black font-medium"
                      />
                    </div>
                  </div>

                  <Separator />
                  <h3 className="font-bold text-sm text-black">Documentação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label className="text-black font-bold">ID / RG</Label>
                      <Input
                        value={formData.idNumber || ''}
                        onChange={(e) =>
                          handleChange('idNumber', e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="RG / ID"
                        className="text-black font-medium"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-black font-bold">Passport</Label>
                      <Input
                        value={formData.passport || ''}
                        onChange={(e) =>
                          handleChange('passport', e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="Passport No."
                        className="text-black font-medium"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-black font-bold">
                        SSN (Social Security)
                      </Label>
                      <Input
                        value={formData.socialSecurity || ''}
                        onChange={(e) =>
                          handleChange('socialSecurity', e.target.value)
                        }
                        disabled={!isEditing}
                        placeholder="xxx-xx-xxxx"
                        className="text-black font-medium"
                      />
                    </div>
                  </div>

                  <Separator />
                  <h3 className="font-bold text-sm text-black">
                    Referral Contacts
                  </h3>
                  <div className="space-y-2">
                    {formData.referralContacts?.map((ref, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-center bg-slate-50 border border-slate-200 p-2 rounded"
                      >
                        <div className="flex-1 text-sm font-bold text-black">
                          {ref.name}
                        </div>
                        <div className="flex-1 text-sm text-black font-medium">
                          {ref.phone}
                        </div>
                        <div className="flex-1 text-sm text-black font-medium">
                          {ref.email}
                        </div>
                        {isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={() => removeReferralContact(idx)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="grid grid-cols-3 gap-2 items-end">
                        <Input
                          placeholder="Name"
                          value={newReferral.name}
                          onChange={(e) =>
                            setNewReferral({
                              ...newReferral,
                              name: e.target.value,
                            })
                          }
                          className="h-8 text-black"
                        />
                        <Input
                          placeholder="Phone"
                          value={newReferral.phone}
                          onChange={(e) =>
                            setNewReferral({
                              ...newReferral,
                              phone: e.target.value,
                            })
                          }
                          className="h-8 text-black"
                        />
                        <div className="flex gap-2">
                          <Input
                            placeholder="Email"
                            value={newReferral.email}
                            onChange={(e) =>
                              setNewReferral({
                                ...newReferral,
                                email: e.target.value,
                              })
                            }
                            className="h-8 flex-1 text-black"
                          />
                          <Button
                            size="sm"
                            onClick={addReferralContact}
                            className="h-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Automatic Adjustment Section */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-black">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Automatic Contract Adjustment
                  </CardTitle>
                  <CardDescription className="text-black">
                    Configure automatic rent increases for contract renewal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-black font-bold">
                      Adjustment Type
                    </Label>
                    <Select
                      value={
                        formData.rentAdjustmentConfig?.type || 'percentage'
                      }
                      onValueChange={(v: any) =>
                        setFormData({
                          ...formData,
                          rentAdjustmentConfig: {
                            ...formData.rentAdjustmentConfig!,
                            type: v,
                          },
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="text-black font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          Percentage (%)
                        </SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-black font-bold">Value</Label>
                    <Input
                      type="number"
                      value={formData.rentAdjustmentConfig?.value || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rentAdjustmentConfig: {
                            ...formData.rentAdjustmentConfig!,
                            value: parseFloat(e.target.value),
                          },
                        })
                      }
                      disabled={!isEditing}
                      className="text-black font-medium"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-black font-bold">Frequency</Label>
                    <Select
                      value={
                        formData.rentAdjustmentConfig?.frequency || 'yearly'
                      }
                      onValueChange={(v: any) =>
                        setFormData({
                          ...formData,
                          rentAdjustmentConfig: {
                            ...formData.rentAdjustmentConfig!,
                            frequency: v,
                          },
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="text-black font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Inspections List */}
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="flex flex-col space-y-1.5">
                    <CardTitle className="flex items-center gap-2 text-base text-black">
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                      Inventory Inspections
                    </CardTitle>
                    <CardDescription className="text-black">
                      Record of check-in and check-out property states.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!hasCheckIn && property && (
                      <Button
                        size="sm"
                        onClick={() => startInspection('check_in')}
                      >
                        Start Check-in
                      </Button>
                    )}
                    {hasCheckIn && !hasCheckOut && property && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startInspection('check_out')}
                      >
                        Start Check-out
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold text-black">
                          Type
                        </TableHead>
                        <TableHead className="font-bold text-black">
                          Date
                        </TableHead>
                        <TableHead className="font-bold text-black">
                          By
                        </TableHead>
                        <TableHead className="font-bold text-black">
                          Items Checked
                        </TableHead>
                        <TableHead className="text-right font-bold text-black">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!formData.inspections ||
                      formData.inspections.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-6 text-black"
                          >
                            No inspections performed.
                          </TableCell>
                        </TableRow>
                      ) : (
                        formData.inspections.map((insp) => (
                          <TableRow
                            key={insp.id}
                            className="bg-white hover:bg-slate-50"
                          >
                            <TableCell className="capitalize font-bold text-black">
                              {insp.type.replace('_', ' ')}
                            </TableCell>
                            <TableCell className="text-black font-medium">
                              {format(new Date(insp.date), 'PP')}
                            </TableCell>
                            <TableCell className="text-black font-medium">
                              {insp.performedBy}
                            </TableCell>
                            <TableCell className="text-black font-medium">
                              {insp.items.length}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-black"
                                onClick={() => viewReport(insp)}
                              >
                                <FileText className="h-3 w-3" /> View Report
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Property & Lease */}
            <div className="space-y-6">
              {property ? (
                <Card className="bg-white border-slate-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg flex items-center gap-2 text-black">
                        <Home className="h-5 w-5 text-slate-500" /> Propriedade
                      </CardTitle>
                      {isEditing && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleUnlinkProperty}
                          title="Unlink"
                        >
                          <Unlink className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Link
                        to={`/properties/${property.id}`}
                        className="font-bold text-lg hover:underline text-primary"
                      >
                        {property.name}
                      </Link>
                      <p className="text-sm text-black font-medium">
                        {property.address}
                      </p>
                      {property.status === 'reserved' && (
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold">
                          Reserved
                        </Badge>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-black font-bold">Aluguel:</span>
                        <span className="font-bold text-black">
                          ${formData.rentValue}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-black font-bold">Início:</span>
                        <span className="font-medium text-black">
                          {formData.leaseStart
                            ? new Date(formData.leaseStart).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-black font-bold">Fim:</span>
                        <span className="font-bold text-orange-600">
                          {formData.leaseEnd
                            ? new Date(formData.leaseEnd).toLocaleDateString()
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-4">
                    <Home className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-black font-medium">
                      Nenhuma propriedade vinculada.
                    </p>
                    {isEditing && (
                      <Dialog
                        open={linkPropertyOpen}
                        onOpenChange={setLinkPropertyOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="gap-2 text-black"
                          >
                            <LinkIcon className="h-4 w-4" /> Link Property
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Link to Property</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <Label className="font-bold">
                              Select Property (Available/Interested)
                            </Label>
                            <Select
                              onValueChange={setSelectedPropertyId}
                              value={selectedPropertyId}
                            >
                              <SelectTrigger className="text-black font-medium">
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availableProperties.map((p) => (
                                  <SelectItem
                                    key={p.id}
                                    value={p.id}
                                    className="text-black"
                                  >
                                    {p.name} ({p.status})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              onClick={handleLinkProperty}
                              disabled={!selectedPropertyId}
                              className="w-full"
                            >
                              Confirm Link (Set Reserved)
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="animate-fade-in">
          <DocumentVault
            documents={formData.documents || []}
            onUpdate={handleDocsUpdate}
            canEdit={true}
            title="Documentos do Inquilino"
            description="Contratos, Identificações e Comprovantes."
            entityContext={{
              id: formData.id,
              name: formData.name,
              type: 'tenant',
            }}
          />
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <History className="h-5 w-5" /> Histórico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-3 space-y-6 pb-2">
                {formData.negotiationLogs?.map((log, index) => (
                  <div key={index} className="ml-6 relative">
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-blue-500 ring-4 ring-background" />
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className="font-bold text-black">{log.action}</p>
                      <span className="text-xs text-black font-medium">
                        {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-black font-medium mt-1">
                      {log.note}
                    </p>
                    <p className="text-xs text-black mt-1 italic">
                      Por: {log.user}
                    </p>
                  </div>
                ))}
                <div className="ml-6 relative">
                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-slate-300 ring-4 ring-background" />
                  <p className="font-bold text-black">Cadastro Criado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Inspection Modal */}
      {property && (
        <InventoryInspectionModal
          isOpen={inspectionModalOpen}
          onClose={() => setInspectionModalOpen(false)}
          onSave={handleInspectionSave}
          propertyId={property.id}
          type={inspectionType}
          title={
            inspectionType === 'check_in'
              ? 'Tenant Check-in Inspection'
              : 'Tenant Check-out Inspection'
          }
          performedBy="Manager"
          isOptional={false}
        />
      )}

      {/* Report Viewer */}
      <InventoryReportViewer
        isOpen={reportViewerOpen}
        onClose={() => setReportViewerOpen(false)}
        inspection={selectedInspection}
        title={
          selectedInspection
            ? `${selectedInspection.type === 'check_in' ? 'Check-in' : 'Check-out'} Report`
            : undefined
        }
      />
    </div>
  )
}
