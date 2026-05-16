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
import {
  MapPin,
  Trash2,
  Plus,
  Building,
  Home,
  Pencil,
  LayoutGrid,
  List,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import usePropertyStore from '@/stores/usePropertyStore'
import useCondominiumStore from '@/stores/useCondominiumStore'
import useHotelStore from '@/stores/useHotelStore'
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
  const { properties, addProperty, updateProperty, deleteProperty } =
    usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { hotels, towers } = useHotelStore()
  const { currentUser, hasPermissionSync } = useAuthStore()
  const { t, language } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState<
    'all' | 'long_term' | 'short_term'
  >('all')
  const [hotelFilter, setHotelFilter] = useState('all')
  const [towerFilter, setTowerFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [selectedCountry, setSelectedCountry] = useState('US')

  const isOwner = currentUser?.role === 'property_owner'
  const canCreate = hasPermissionSync(
    currentUser as User,
    'properties',
    'create',
  )
  const canEdit = hasPermissionSync(currentUser as User, 'properties', 'edit')
  const canDelete = hasPermissionSync(
    currentUser as User,
    'properties',
    'delete',
  )

  const [newProp, setNewProp] = useState<Partial<Property>>({
    name: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    additionalInfo: '',
    country: 'US',
    type: 'House',
    profileType: undefined,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    ownerId: '',
    agentId: '',
    condominiumId: '',
    hotelId: undefined,
    towerId: undefined,
    floor: '',
    roomNumber: '',
    image: '',
    listingPrice: 0,
    hoaValue: 0,
    area: 0,
  })

  const accessibleProperties = properties.filter((p) => {
    // Owner data isolation
    if (isOwner) {
      if (p.ownerId !== currentUser?.id) return false
    }
    // Profile type restriction (for normal staff)
    if (
      currentUser &&
      'allowedProfileTypes' in currentUser &&
      Array.isArray((currentUser as any).allowedProfileTypes) &&
      (currentUser as any).allowedProfileTypes.length > 0 &&
      !(currentUser as any).allowedProfileTypes.includes(p.profileType)
    ) {
      return false
    }
    return true
  })

  const filteredProperties = accessibleProperties.filter((p) => {
    const pName = p.name || ''
    const pAddress = p.address || ''
    const condoName =
      condominiums.find((c) => c.id === p.condominiumId)?.name || ''
    const hotelName = hotels.find((h) => h.id === p.hotelId)?.name || ''

    const matchesFilter =
      pName.toLowerCase().includes(filter.toLowerCase()) ||
      pAddress.toLowerCase().includes(filter.toLowerCase()) ||
      condoName.toLowerCase().includes(filter.toLowerCase()) ||
      hotelName.toLowerCase().includes(filter.toLowerCase())

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesProfile =
      profileFilter === 'all' || p.profileType === profileFilter
    const matchesHotel = hotelFilter === 'all' || p.hotelId === hotelFilter
    const matchesTower = towerFilter === 'all' || p.towerId === towerFilter

    return (
      matchesFilter &&
      matchesStatus &&
      matchesProfile &&
      matchesHotel &&
      matchesTower
    )
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

  const handleAddProperty = async () => {
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
        description: t('common.name_required'),
        variant: 'destructive',
      })
      return
    }
    const selectedCondo = condominiums.find(
      (c) => c.id === newProp.condominiumId,
    )
    const selectedHotel = hotels.find((h) => h.id === newProp.hotelId)

    const isHotelLinkedLocal = !!newProp.hotelId && newProp.hotelId !== 'none'
    const isCondoLinkedLocal =
      !!newProp.condominiumId && newProp.condominiumId !== 'none'

    const finalAddress = isHotelLinkedLocal
      ? selectedHotel?.address || selectedHotel?.name || ''
      : isCondoLinkedLocal
        ? selectedCondo?.address || newProp.address || ''
        : newProp.address || ''
    const finalZipCode = isHotelLinkedLocal
      ? selectedHotel?.zipCode || '00000'
      : isCondoLinkedLocal
        ? selectedCondo?.zipCode || newProp.zipCode || ''
        : newProp.zipCode || ''
    const finalCity = isHotelLinkedLocal
      ? selectedHotel?.city || 'City'
      : isCondoLinkedLocal
        ? selectedCondo?.city || newProp.city || ''
        : newProp.city || ''
    const finalState = isHotelLinkedLocal
      ? selectedHotel?.state || 'ST'
      : isCondoLinkedLocal
        ? selectedCondo?.state || newProp.state || ''
        : newProp.state || ''
    const finalCountry = isHotelLinkedLocal
      ? selectedHotel?.country || 'US'
      : isCondoLinkedLocal
        ? selectedCondo?.country || selectedCountry
        : selectedCountry

    if (!isHotelLinkedLocal) {
      if (!finalAddress?.trim()) {
        toast({
          title: t('properties.validation_error'),
          description: t('properties.address_required'),
          variant: 'destructive',
        })
        return
      }
      if (!finalZipCode?.trim() || isGenericOrPlaceholder(finalZipCode)) {
        toast({
          title: t('properties.validation_error'),
          description: t('properties.zip_required'),
          variant: 'destructive',
        })
        return
      }
      if (!finalCity?.trim() || !finalState?.trim()) {
        toast({
          title: t('properties.validation_error'),
          description: t('properties.city_state_required'),
          variant: 'destructive',
        })
        return
      }
    }

    if (!newProp.profileType) {
      toast({
        title: t('properties.validation_error'),
        description: t('properties.profile_required'),
        variant: 'destructive',
      })
      return
    }

    let comm = newProp.community || t('properties.independent_community')
    if (selectedHotel) comm = selectedHotel.name
    else if (selectedCondo) comm = selectedCondo.name

    let finalOwnerId = newProp.ownerId || undefined
    if (isOwner && currentUser) {
      finalOwnerId = currentUser.id
    }

    if (editingId) {
      const existing = properties.find((p) => p.id === editingId)
      if (existing) {
        const { error } = await updateProperty({
          ...existing,
          name: newProp.name || '',
          address: finalAddress,
          number: newProp.number || '',
          neighborhood: newProp.neighborhood || '',
          city: finalCity,
          state: finalState,
          zipCode: finalZipCode,
          additionalInfo: newProp.additionalInfo || '',
          country: finalCountry,
          profileType: newProp.profileType,
          condominiumId: newProp.condominiumId,
          hotelId: newProp.hotelId,
          towerId: newProp.towerId,
          floor: newProp.floor,
          roomNumber: newProp.roomNumber,
          community: comm,
          listingPrice: newProp.listingPrice || 0,
          hoaValue: newProp.hoaValue || 0,
          area: newProp.area || 0,
          image: newProp.image || existing.image,
          gallery: newProp.gallery || existing.gallery,
        } as Property)

        if (error) {
          toast({
            title: t('common.error'),
            description: error.message,
            variant: 'destructive',
          })
          return
        }

        toast({
          title: t('properties.property_updated') || 'Propriedade alterada',
        })
      }
    } else {
      const { error } = await addProperty({
        name: newProp.name || '',
        address: finalAddress,
        number: newProp.number || '',
        neighborhood: newProp.neighborhood || '',
        city: finalCity,
        state: finalState,
        zipCode: finalZipCode,
        additionalInfo: newProp.additionalInfo || '',
        country: finalCountry,
        type: newProp.type || 'House',
        profileType: newProp.profileType,
        community: comm,
        condominiumId: newProp.condominiumId,
        hotelId: newProp.hotelId,
        towerId: newProp.towerId,
        floor: newProp.floor || '',
        roomNumber: newProp.roomNumber || '',
        status: 'available',
        image: newProp.image || 'https://img.usecurling.com/p/400/300?q=house',
        gallery: newProp.gallery || [],
        bedrooms: newProp.bedrooms || 0,
        bathrooms: newProp.bathrooms || 0,
        guests: newProp.guests || 0,
        description: { pt: '', en: '', es: '' },
        hoaRules: { pt: '', en: '', es: '' },
        documents: [],
        ownerId: finalOwnerId,
        agentId: newProp.agentId,
        fixedExpenses: [],
        listingPrice: newProp.listingPrice || 0,
        hoaValue: newProp.hoaValue || 0,
        area: newProp.area || 0,
      } as Property)

      if (error) {
        toast({
          title: t('common.error'),
          description: error.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: t('properties.property_added'),
        description: `${newProp.name} ${t('common.done').toLowerCase()}.`,
      })
    }

    setOpen(false)
    setEditingId(null)
    setNewProp({
      name: '',
      address: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
      additionalInfo: '',
      country: 'US',
      type: 'House',
      profileType: undefined,
      bedrooms: 3,
      bathrooms: 2,
      guests: 6,
      hotelId: undefined,
      towerId: undefined,
      floor: '',
      roomNumber: '',
      gallery: [],
      image: '',
      listingPrice: 0,
      hoaValue: 0,
    })
    setSelectedCountry('US')
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await deleteProperty(id)
      if (error) throw error
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

  const handleEditClick = (e: React.MouseEvent, prop: Property) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(prop.id)
    setNewProp(prop)
    setSelectedCountry(prop.country || 'US')
    setOpen(true)
  }

  const handleHotelChange = (val: string) => {
    if (val === 'none') {
      setNewProp({ ...newProp, hotelId: undefined, towerId: undefined })
    } else {
      const hotel = hotels.find((h) => h.id === val)
      if (hotel) {
        setNewProp({
          ...newProp,
          hotelId: val,
          towerId: undefined,
          address: hotel.address || '',
          number: hotel.number || '',
          neighborhood: hotel.neighborhood || '',
          city: hotel.city || '',
          state: hotel.state || '',
          zipCode: hotel.zipCode || '',
          country: hotel.country || 'US',
        })
        setSelectedCountry(hotel.country || 'US')
      }
    }
  }

  const isHotelLinked = !!newProp.hotelId && newProp.hotelId !== 'none'

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {t('properties.title')}
          </h1>
          <p className="text-black font-medium">{t('properties.subtitle')}</p>
        </div>

        {canCreate && (
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v)
              if (!v) {
                setEditingId(null)
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
                  area: 0,
                  gallery: [],
                  image: '',
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>
                  {editingId
                    ? 'Alterar Propriedade'
                    : t('properties.add_title')}
                </DialogTitle>
                <DialogDescription>
                  <VisuallyHidden>
                    {t('properties.add_description')}
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

                {/* Hotel Link */}
                <div className="grid gap-4 p-4 border rounded-md bg-slate-50">
                  <div className="grid gap-2">
                    <Label className="font-bold text-black flex items-center gap-2">
                      <Building className="h-4 w-4" /> Vínculo com Hotel
                    </Label>
                    <Select
                      value={newProp.hotelId || 'none'}
                      onValueChange={handleHotelChange}
                    >
                      <SelectTrigger className="text-black bg-white">
                        <SelectValue placeholder="Selecionar Hotel (Opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {hotels.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {isHotelLinked && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
                      <div className="grid gap-2">
                        <Label className="text-xs text-black font-bold">
                          Torre / Ala
                        </Label>
                        <Select
                          value={newProp.towerId || 'none'}
                          onValueChange={(v) =>
                            setNewProp({
                              ...newProp,
                              towerId: v === 'none' ? undefined : v,
                            })
                          }
                        >
                          <SelectTrigger className="text-black bg-white">
                            <SelectValue placeholder="Selecionar..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {towers
                              .filter((t) => t.hotelId === newProp.hotelId)
                              .map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                  {t.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs text-black font-bold">
                          Andar
                        </Label>
                        <Input
                          value={newProp.floor || ''}
                          onChange={(e) =>
                            setNewProp({ ...newProp, floor: e.target.value })
                          }
                          className="bg-white text-black"
                          placeholder="Ex: 5"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-xs text-black font-bold">
                          Quarto/Suíte
                        </Label>
                        <Input
                          value={newProp.roomNumber || ''}
                          onChange={(e) =>
                            setNewProp({
                              ...newProp,
                              roomNumber: e.target.value,
                            })
                          }
                          className="bg-white text-black"
                          placeholder="Ex: 501"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Condominium Link */}
                <div className="grid gap-4 p-4 border rounded-md bg-slate-50">
                  <div className="grid gap-2">
                    <Label className="font-bold text-black flex items-center gap-2">
                      <Building className="h-4 w-4" />{' '}
                      {t('properties.condominium_link', 'Condominium Link')}
                    </Label>
                    <Select
                      value={newProp.condominiumId || 'none'}
                      onValueChange={(val) => {
                        if (val === 'none') {
                          setNewProp({ ...newProp, condominiumId: undefined })
                        } else {
                          const condo = condominiums.find((c) => c.id === val)
                          setNewProp({
                            ...newProp,
                            condominiumId: val,
                            hotelId: undefined,
                            address: condo?.address || newProp.address,
                            number: condo?.number || newProp.number,
                            neighborhood:
                              condo?.neighborhood || newProp.neighborhood,
                            city: condo?.city || newProp.city,
                            state: condo?.state || newProp.state,
                            zipCode: condo?.zipCode || newProp.zipCode,
                          })
                        }
                      }}
                    >
                      <SelectTrigger className="text-black bg-white">
                        <SelectValue
                          placeholder={t(
                            'properties.select_condominium',
                            'Select Condominium',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          {t('common.none', 'None')}
                        </SelectItem>
                        {condominiums.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {newProp.condominiumId &&
                      newProp.condominiumId !== 'none' && (
                        <p className="text-xs text-slate-500">
                          {t(
                            'properties.condo_inherited_info',
                            'Access and contact details will be inherited.',
                          )}
                        </p>
                      )}
                  </div>
                </div>

                {/* Main Inputs */}
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
                    disabled={isHotelLinked}
                  >
                    <SelectTrigger className="text-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">Estados Unidos (EUA)</SelectItem>
                      <SelectItem value="BR">Brasil</SelectItem>
                      <SelectItem value="ES">Espanha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="text-black font-bold">
                    {t(
                      'properties.property_nickname',
                      'Property Nickname / Name',
                    )}{' '}
                    <span className="text-red-500">*</span>
                  </Label>{' '}
                  <Input
                    value={newProp.name}
                    onChange={(e) =>
                      setNewProp({ ...newProp, name: e.target.value })
                    }
                    placeholder={t(
                      'properties.nickname_placeholder',
                      'E.g. Villa Sunshine',
                    )}
                    className="text-black"
                  />
                </div>

                {!isHotelLinked && (
                  <div className="grid gap-2">
                    <Label className="text-black font-bold">
                      {t('common.search_address')}
                    </Label>
                    <AddressInput onAddressSelect={handleAddressSelect} />
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <div className="grid gap-2 col-span-3">
                    <Label className="text-black font-bold">
                      {t('common.address')}{' '}
                      {!isHotelLinked && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Input
                      value={newProp.address}
                      onChange={(e) =>
                        setNewProp({ ...newProp, address: e.target.value })
                      }
                      placeholder={t('properties.address_placeholder')}
                      className="text-black"
                      disabled={isHotelLinked}
                    />
                  </div>
                  <div className="grid gap-2 col-span-1">
                    <Label className="text-black font-bold">Nº</Label>
                    <Input
                      value={newProp.number || ''}
                      onChange={(e) =>
                        setNewProp({ ...newProp, number: e.target.value })
                      }
                      placeholder="Número"
                      className="text-black"
                      disabled={isHotelLinked}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1">
                    <Label className="text-xs text-black font-bold">
                      Bairro
                    </Label>
                    <Input
                      value={newProp.neighborhood || ''}
                      onChange={(e) =>
                        setNewProp({ ...newProp, neighborhood: e.target.value })
                      }
                      placeholder="Bairro"
                      className="text-black"
                      disabled={isHotelLinked}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label className="text-xs text-black font-bold">
                      {t('properties.zip_code')}{' '}
                      {!isHotelLinked && (
                        <span className="text-red-500">*</span>
                      )}
                    </Label>
                    <Input
                      value={newProp.zipCode}
                      onChange={handleZipCodeChange}
                      placeholder={
                        selectedCountry === 'BR' ? '00000-000' : '00000'
                      }
                      className="text-black"
                      disabled={isHotelLinked}
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
                      disabled={isHotelLinked}
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
                      disabled={isHotelLinked}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-black font-bold">Área (m²)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newProp.area || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        if (isNaN(val) || val < 0) {
                          setNewProp({ ...newProp, area: 0 })
                          return
                        }
                        setNewProp({ ...newProp, area: val })
                      }}
                      className="text-black bg-white"
                      placeholder="Ex: 150"
                    />
                  </div>
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
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-black font-bold">
                    {t('properties.photos', 'Photos (Select cover)')}
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const files = Array.from(e.target.files)
                        const newImages = files.map((file) =>
                          URL.createObjectURL(file),
                        )
                        const currentGallery = newProp.gallery || []
                        const updatedGallery = [...currentGallery, ...newImages]

                        setNewProp({
                          ...newProp,
                          gallery: updatedGallery,
                          image: newProp.image || updatedGallery[0] || '',
                        })
                      }
                    }}
                    className="text-black"
                  />
                  {newProp.gallery && newProp.gallery.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto py-2">
                      {newProp.gallery.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative w-24 h-24 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${newProp.image === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-slate-300'}`}
                          onClick={() => setNewProp({ ...newProp, image: img })}
                        >
                          <img
                            src={img}
                            className="w-full h-full object-cover"
                          />
                          {newProp.image === img && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Badge className="bg-primary text-white text-[10px]">
                                {t('properties.cover', 'Cover')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleAddProperty}
                  className="bg-trust-blue w-full mt-4"
                >
                  {t('common.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center flex-wrap bg-white p-4 rounded-lg border shadow-sm">
        <Input
          placeholder={t('properties.search_placeholder')}
          className="md:w-[250px] text-black bg-white"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[150px] border-slate-300 text-black">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="rented">{t('status.rented')}</SelectItem>
            <SelectItem value="available">{t('status.available')}</SelectItem>
            <SelectItem value="sold">{t('status.sold')}</SelectItem>
            <SelectItem value="sale_pending">
              {t('status.sale_pending')}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={profileFilter}
          onValueChange={(v: any) => setProfileFilter(v)}
        >
          <SelectTrigger className="w-full md:w-[160px] border-slate-300 text-black">
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

        <Select
          value={hotelFilter}
          onValueChange={(v) => {
            setHotelFilter(v)
            setTowerFilter('all')
          }}
        >
          <SelectTrigger className="w-full md:w-[180px] border-slate-300 text-black">
            <SelectValue placeholder="Hotel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Hotéis</SelectItem>
            {hotels.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hotelFilter !== 'all' && (
          <Select value={towerFilter} onValueChange={setTowerFilter}>
            <SelectTrigger className="w-full md:w-[180px] border-slate-300 text-black">
              <SelectValue placeholder="Torre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Torres</SelectItem>
              {towers
                .filter((t) => t.hotelId === hotelFilter)
                .map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex-1" />

        <div className="flex items-center bg-slate-100 p-1 rounded-md gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-black' : 'hover:bg-slate-200 text-slate-500'}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'hover:bg-slate-200 text-slate-500'}`}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {viewMode === 'list' && (
        <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 font-bold text-black w-[80px]">
                  Foto
                </th>
                <th className="px-4 py-3 font-bold text-black">
                  Nome / Identificação
                </th>
                <th className="px-4 py-3 font-bold text-black">
                  Hotel / Condomínio
                </th>
                <th className="px-4 py-3 font-bold text-black">
                  Torre / Andar / Quarto
                </th>
                <th className="px-4 py-3 font-bold text-black">Perfil</th>
                <th className="px-4 py-3 font-bold text-black">Status</th>
                <th className="px-4 py-3 font-bold text-black text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProperties.map((property) => {
                const hotel = hotels.find((h) => h.id === property.hotelId)
                const condo = condominiums.find(
                  (c) => c.id === property.condominiumId,
                )
                const tower = towers.find((t) => t.id === property.towerId)

                return (
                  <tr
                    key={property.id}
                    className="hover:bg-slate-50 transition-colors bg-white"
                  >
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-200">
                        {property.image ? (
                          <img
                            src={property.image}
                            alt={property.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg'
                            }}
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-slate-400">
                            <Home className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-black">
                        <DataMask>{property.name}</DataMask>
                      </div>
                      <div
                        className="text-xs text-slate-500 max-w-[200px] truncate"
                        title={property.address}
                      >
                        <DataMask>{property.address}</DataMask>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {hotel ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          <Building className="w-3 h-3 mr-1" /> {hotel.name}
                        </Badge>
                      ) : condo ? (
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700 border-purple-200"
                        >
                          <Home className="w-3 h-3 mr-1" /> {condo.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">
                          Independente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-black flex flex-col gap-1">
                        {tower && <span>Torre: {tower.name}</span>}
                        {property.floor && (
                          <span className="text-slate-600">
                            Andar: {property.floor}
                          </span>
                        )}
                        {property.roomNumber && (
                          <span className="text-slate-600">
                            Quarto: {property.roomNumber}
                          </span>
                        )}
                        {!tower && !property.floor && !property.roomNumber && (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-black text-white border-none font-bold">
                        {property.profileType === 'short_term' ? 'STR' : 'LTR'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={getStatusColor(
                          property.status || 'available',
                        )}
                      >
                        {t(`status.${property.status || 'available'}`)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleEditClick(e, property)}
                            title="Alterar"
                          >
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Excluir"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
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
                                <AlertDialogCancel
                                  onClick={(e) => e.stopPropagation()}
                                >
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
                        <Link to={`/properties/${property.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 font-medium"
                          >
                            Ver
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredProperties.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground border-dashed bg-slate-50"
                  >
                    {t('common.empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group relative bg-white"
            >
              <div className="relative h-48 w-full bg-slate-200">
                {property.image ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full text-black font-medium">
                    {t('properties.no_image')}
                  </div>
                )}
                <Badge
                  className={`absolute top-2 right-2 ${getStatusColor(property.status || 'available')}`}
                >
                  {t(`status.${property.status || 'available'}`)}
                </Badge>
                <Badge className="absolute bottom-2 left-2 bg-black text-white border-none font-bold">
                  {property.profileType === 'short_term' ? 'STR' : 'LTR'}
                </Badge>
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
                <div className="flex items-center gap-1 text-sm text-black mb-2">
                  <MapPin className="h-3 w-3 text-black shrink-0" />
                  <span className="truncate font-medium">
                    <DataMask>
                      {property.address}
                      {property.number ? `, ${property.number}` : ''}
                    </DataMask>
                  </span>
                </div>
                {(property.hotelId ||
                  property.towerId ||
                  property.roomNumber) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {property.hotelId && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]"
                      >
                        <Building className="w-3 h-3 mr-1" />
                        {hotels.find((h) => h.id === property.hotelId)?.name ||
                          'Hotel'}
                      </Badge>
                    )}
                    {property.towerId && (
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]"
                      >
                        Torre:{' '}
                        {towers.find((t) => t.id === property.towerId)?.name}
                      </Badge>
                    )}
                    {property.roomNumber && (
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-700 border-slate-200 text-[10px]"
                      >
                        Q: {property.roomNumber}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4 border-t bg-white flex flex-col gap-2 z-10 relative">
                <Link to={`/properties/${property.id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full text-black border-slate-300 font-medium"
                  >
                    {t('properties.view_details')}
                  </Button>
                </Link>
                <div className="flex w-full gap-2">
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-black font-medium"
                      onClick={(e) => handleEditClick(e, property)}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Alterar
                    </Button>
                  )}
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
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
                          <AlertDialogCancel
                            onClick={(e) => e.stopPropagation()}
                          >
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
              </CardFooter>
            </Card>
          ))}
          {filteredProperties.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground border rounded-lg bg-slate-50 border-dashed">
              {t('common.empty')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
