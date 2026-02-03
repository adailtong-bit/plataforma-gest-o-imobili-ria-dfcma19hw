import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Trash2, Plus, Building, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import usePropertyStore from '@/stores/usePropertyStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'
import useAuthStore from '@/stores/useAuthStore'
import { hasPermission } from '@/lib/permissions'
import { User, Property } from '@/lib/types'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { DataMask } from '@/components/DataMask'
import { applyZipCodeMask, isGenericOrPlaceholder } from '@/lib/utils'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import { VisuallyHidden } from '@/components/ui/visually-hidden'

export default function Properties() {
  const { properties, addProperty, deleteProperty } = usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { currentUser } = useAuthStore()
  const { t, language } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState<
    'all' | 'long_term' | 'short_term'
  >('all')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  // State for property being created country
  const [selectedCountry, setSelectedCountry] = useState('US')

  // Initial state without default profileType to force user selection
  const [newProp, setNewProp] = useState<Partial<Property>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    additionalInfo: '',
    neighborhood: '',
    country: 'US', // Initial default
    type: 'House',
    profileType: undefined, // Must be selected manually
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    ownerId: '',
    agentId: '',
    condominiumId: '',
    image: '',
    listingPrice: 0,
    hoaValue: 0,
  })

  // Filter properties based on user permissions
  const accessibleProperties = properties.filter((p) => {
    if (
      currentUser.allowedProfileTypes &&
      !currentUser.allowedProfileTypes.includes(p.profileType)
    ) {
      return false
    }
    return true
  })

  const filteredProperties = accessibleProperties.filter((p) => {
    const matchesFilter =
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.address.toLowerCase().includes(filter.toLowerCase()) ||
      condominiums
        .find((c) => c.id === p.condominiumId)
        ?.name.toLowerCase()
        .includes(filter.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesProfile =
      profileFilter === 'all' || p.profileType === profileFilter
    return matchesFilter && matchesStatus && matchesProfile
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rented':
      case 'occupied':
        return 'bg-green-100 text-green-800 border-green-300 font-bold'
      case 'available':
      case 'vacant':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
      case 'suspended':
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-bold'
      case 'sold':
        return 'bg-gray-100 text-gray-800 border-gray-300 font-bold'
      case 'sale_pending':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 font-bold'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const handleAddressSelect = (addr: AddressData) => {
    const mappedCountry =
      addr.country === 'Brazil'
        ? 'BR'
        : addr.country === 'Spain'
          ? 'ES'
          : addr.country === 'USA'
            ? 'US'
            : selectedCountry

    setSelectedCountry(mappedCountry)

    setNewProp((prev) => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: applyZipCodeMask(addr.zipCode, mappedCountry),
      country: mappedCountry,
    }))
  }

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = applyZipCodeMask(e.target.value, selectedCountry)
    setNewProp({ ...newProp, zipCode: val })
  }

  const handleAddProperty = () => {
    // Strict Validation
    if (!newProp.name?.trim()) {
      toast({
        title: t('properties.validation_error'),
        description: t('properties.name_required'),
        variant: 'destructive',
      })
      return
    }
    if (isGenericOrPlaceholder(newProp.name)) {
      toast({
        title: t('properties.validation_error'),
        description: 'Invalid Name.',
        variant: 'destructive',
      })
      return
    }

    if (!newProp.address?.trim()) {
      toast({
        title: t('properties.validation_error'),
        description: t('properties.address_required'),
        variant: 'destructive',
      })
      return
    }
    // Check mandatory Zip Code
    if (!newProp.zipCode?.trim()) {
      toast({
        title: t('properties.validation_error'),
        description: t('properties.zip_required'),
        variant: 'destructive',
      })
      return
    }
    if (isGenericOrPlaceholder(newProp.zipCode)) {
      toast({
        title: t('properties.validation_error'),
        description: 'Invalid Zip Code.',
        variant: 'destructive',
      })
      return
    }

    if (!newProp.city?.trim() || !newProp.state?.trim()) {
      toast({
        title: t('properties.validation_error'),
        description: t('properties.city_state_required'),
        variant: 'destructive',
      })
      return
    }
    // Check mandatory Profile Type (Rental Type)
    if (!newProp.profileType) {
      toast({
        title: t('properties.validation_error'),
        description: t('properties.profile_required'),
        variant: 'destructive',
      })
      return
    }

    const selectedCondo = condominiums.find(
      (c) => c.id === newProp.condominiumId,
    )
    addProperty({
      id: `prop${Date.now()}`,
      name: newProp.name || '',
      address: newProp.address || '',
      city: newProp.city || '',
      state: newProp.state || '',
      zipCode: newProp.zipCode || '',
      additionalInfo: newProp.additionalInfo || '',
      country: selectedCountry,
      neighborhood: newProp.neighborhood || '',
      type: newProp.type || 'House',
      profileType: newProp.profileType,
      community: selectedCondo
        ? selectedCondo.name
        : newProp.community || 'Independent',
      condominiumId: newProp.condominiumId,
      status: 'available',
      // Ensure default image does not use 'seed' param for /p/ endpoint to prevent errors
      image: newProp.image || 'https://img.usecurling.com/p/400/300?q=house',
      gallery: [],
      bedrooms: newProp.bedrooms || 0,
      bathrooms: newProp.bathrooms || 0,
      guests: newProp.guests || 0,
      wifiSsid: '',
      wifiPassword: '',
      accessCodeBuilding: '',
      accessCodeUnit: '',
      description: { pt: '', en: '', es: '' },
      hoaRules: { pt: '', en: '', es: '' },
      documents: [],
      ownerId: newProp.ownerId || 'owner1',
      agentId: newProp.agentId,
      fixedExpenses: [],
      listingPrice: newProp.listingPrice || 0,
      hoaValue: newProp.hoaValue || 0,
    } as Property)

    toast({
      title: t('properties.property_added'),
      description: `${newProp.name} ${t('common.completed').toLowerCase()}.`,
    })
    setOpen(false)
    setNewProp({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      additionalInfo: '',
      neighborhood: '',
      country: 'US',
      type: 'House',
      profileType: undefined,
      bedrooms: 3,
      bathrooms: 2,
      guests: 6,
      image: '',
      listingPrice: 0,
      hoaValue: 0,
    })
    setSelectedCountry('US')
  }

  const handleDelete = (id: string) => {
    try {
      deleteProperty(id)
      toast({ title: t('properties.delete_success') })
    } catch (e: any) {
      toast({
        title: t('common.error'),
        description:
          e.message === 'error_active_tenant'
            ? t('common.delete_active_tenant_error')
            : t('properties.error_delete'),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {t('properties.title')}
          </h1>
          <p className="text-black font-medium">{t('properties.subtitle')}</p>
        </div>

        {hasPermission(currentUser as User, 'properties', 'create') && (
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v)
              if (!v) {
                // Reset state on close
                setNewProp({
                  name: '',
                  country: 'US',
                  type: 'House',
                  profileType: undefined,
                  bedrooms: 3,
                  bathrooms: 2,
                  guests: 6,
                  listingPrice: 0,
                  hoaValue: 0,
                })
                setSelectedCountry('US')
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-trust-blue hover:bg-blue-700 gap-2">
                <Plus className="h-4 w-4" /> {t('properties.new_property')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t('properties.add_title')}</DialogTitle>
                <DialogDescription>
                  <VisuallyHidden>
                    {t(
                      'properties.add_description',
                      'Fill in the form to create a new property.',
                    )}
                  </VisuallyHidden>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {/* Manual Rental Type Selection */}
                <div className="grid gap-3 p-4 border rounded-md bg-white">
                  <Label className="text-base font-bold text-black">
                    {t('properties.rental_type')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={newProp.profileType}
                    onValueChange={(val: any) =>
                      setNewProp({ ...newProp, profileType: val })
                    }
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="short_term"
                        id="str"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="str"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50 cursor-pointer"
                      >
                        <Home className="mb-2 h-6 w-6 text-black" />
                        <span className="font-bold text-black">
                          {t('properties.profile_short')}
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="long_term"
                        id="ltr"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="ltr"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-blue-50 cursor-pointer"
                      >
                        <Building className="mb-2 h-6 w-6 text-black" />
                        <span className="font-bold text-black">
                          {t('properties.profile_long')}
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Country Selection Priority */}
                <div className="grid gap-2">
                  <Label className="text-black font-bold">
                    {t('common.country')}
                  </Label>
                  <Select
                    value={selectedCountry}
                    onValueChange={(val) => {
                      setSelectedCountry(val)
                      setNewProp((prev) => ({ ...prev, zipCode: '' }))
                    }}
                  >
                    <SelectTrigger className="text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States (USA)</SelectItem>
                      <SelectItem value="BR">Brazil (Brasil)</SelectItem>
                      <SelectItem value="ES">Spain (España)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-black font-bold">
                    {t('common.name')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={newProp.name}
                    onChange={(e) =>
                      setNewProp({ ...newProp, name: e.target.value })
                    }
                    placeholder={t('properties.search_placeholder')}
                    className="text-black"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-black font-bold">Search Address</Label>
                  <AddressInput onAddressSelect={handleAddressSelect} />
                </div>

                <div className="grid gap-2">
                  <Label className="text-black font-bold">
                    {t('common.address')}{' '}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={newProp.address}
                    onChange={(e) =>
                      setNewProp({ ...newProp, address: e.target.value })
                    }
                    placeholder={t('properties.address_placeholder')}
                    className="text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label className="text-xs text-black font-bold">
                      {t('properties.zip_code')}{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={newProp.zipCode}
                      onChange={handleZipCodeChange}
                      placeholder={
                        selectedCountry === 'BR' ? '00000-000' : '00000'
                      }
                      className="text-black"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-black font-bold">
                      {t('properties.info_label')}
                    </Label>
                    <Input
                      value={newProp.additionalInfo}
                      onChange={(e) =>
                        setNewProp({
                          ...newProp,
                          additionalInfo: e.target.value,
                        })
                      }
                      placeholder="Apto, Bloco, etc."
                      className="text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label className="text-xs text-black font-bold">
                      {t('properties.city_placeholder')}
                    </Label>
                    <Input
                      placeholder={t('properties.city_placeholder')}
                      value={newProp.city}
                      onChange={(e) =>
                        setNewProp({ ...newProp, city: e.target.value })
                      }
                      className="text-black"
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-black font-bold">
                      {t('properties.state_placeholder')}
                    </Label>
                    <Input
                      placeholder={t('properties.state_placeholder')}
                      value={newProp.state}
                      onChange={(e) =>
                        setNewProp({ ...newProp, state: e.target.value })
                      }
                      className="text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-black font-bold">
                      {t('properties.property_value')} ($)
                    </Label>
                    <CurrencyInput
                      value={newProp.listingPrice}
                      onChange={(val) =>
                        setNewProp({ ...newProp, listingPrice: val })
                      }
                      placeholder="0.00"
                      locale={
                        language === 'pt'
                          ? 'pt-BR'
                          : language === 'es'
                            ? 'es-ES'
                            : 'en-US'
                      }
                      className="text-black"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-black font-bold">
                      {t('properties.hoa_fee')} ($)
                    </Label>
                    <CurrencyInput
                      value={newProp.hoaValue}
                      onChange={(val) =>
                        setNewProp({ ...newProp, hoaValue: val })
                      }
                      placeholder="0.00"
                      locale={
                        language === 'pt'
                          ? 'pt-BR'
                          : language === 'es'
                            ? 'es-ES'
                            : 'en-US'
                      }
                      className="text-black"
                    />
                    <span className="text-[10px] text-black font-medium">
                      {t('properties.hoa_auto_hint')}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-black font-bold">
                    {t('properties.cover_image')}
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setNewProp({
                          ...newProp,
                          image: URL.createObjectURL(e.target.files[0]),
                        })
                      }
                    }}
                    className="text-black"
                  />
                  {!newProp.image && (
                    <p className="text-xs text-black italic">
                      {t('properties.no_image_selected')}
                    </p>
                  )}
                  {newProp.image && (
                    <img
                      src={newProp.image}
                      className="h-20 w-auto object-cover rounded"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg'
                        e.currentTarget.onerror = null
                      }}
                    />
                  )}
                </div>

                <Button
                  onClick={handleAddProperty}
                  className="bg-trust-blue w-full"
                >
                  {t('common.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <Input
          placeholder={t('properties.search_placeholder')}
          className="md:w-[300px] text-black bg-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px] border-slate-300 text-black">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="rented">{t('status.rented')}</SelectItem>
            <SelectItem value="available">{t('status.available')}</SelectItem>
            <SelectItem value="sold">{t('common.sold')}</SelectItem>
            <SelectItem value="sale_pending">
              {t('common.sale_pending')}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={profileFilter}
          onValueChange={(v: any) => setProfileFilter(v)}
        >
          <SelectTrigger className="w-full md:w-[200px] border-slate-300 text-black">
            <SelectValue placeholder={t('properties.profile_filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('properties.all_profiles')}</SelectItem>
            <SelectItem value="short_term">
              {t('properties.profile_short')}
            </SelectItem>
            <SelectItem value="long_term">
              {t('properties.profile_long')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProperties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group relative bg-white"
          >
            <div className="relative h-48 w-full bg-slate-200">
              {property.image ? (
                <DataMask className="w-full h-full block rounded-none">
                  <img
                    src={property.image}
                    alt={property.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg'
                      e.currentTarget.onerror = null
                    }}
                  />
                </DataMask>
              ) : (
                <div className="flex items-center justify-center h-full text-black font-medium">
                  {t('properties.no_image')}
                </div>
              )}
              <Badge
                className={`absolute top-2 right-2 ${getStatusColor(property.status)}`}
              >
                {t(`status.${property.status}`)}
              </Badge>
              <Badge className="absolute bottom-2 left-2 bg-black text-white border-none font-bold">
                {property.profileType === 'short_term' ? 'STR' : 'LTR'}
              </Badge>

              {hasPermission(currentUser as User, 'properties', 'delete') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t('common.delete_title')}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('common.delete_desc')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        {t('common.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(property.id)
                        }}
                      >
                        {t('common.delete')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-black">
                <DataMask>{property.name}</DataMask>
              </CardTitle>
              <p className="text-xs text-black mt-1 font-medium">
                <DataMask>{property.community}</DataMask>
              </p>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <div className="flex items-center gap-1 text-sm text-black mb-4">
                <MapPin className="h-3 w-3 text-black" />
                <span className="truncate font-medium">
                  <DataMask>{property.address}</DataMask>
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-white">
              <Link to={`/properties/${property.id}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full text-black border-slate-300 font-medium"
                >
                  {t('properties.view_details')}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
