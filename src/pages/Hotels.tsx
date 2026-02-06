import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Hotel as HotelIcon, Plus, MapPin, Search, Users } from 'lucide-react'
import useHotelStore from '@/stores/useHotelStore'
import useLanguageStore from '@/stores/useLanguageStore'
import usePropertyStore from '@/stores/usePropertyStore'
import { useNavigate, Link } from 'react-router-dom'
import { Hotel, HotelContact } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { AddressInput, AddressData } from '@/components/ui/address-input'
import { applyZipCodeMask } from '@/lib/utils'
import { DataMask } from '@/components/DataMask'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

export default function Hotels() {
  const { hotels, addHotel } = useHotelStore()
  const { properties } = usePropertyStore()
  const { t } = useLanguageStore()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [filter, setFilter] = useState('')
  const [open, setOpen] = useState(false)

  const [newHotel, setNewHotel] = useState<Partial<Hotel>>({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'US',
    zipCode: '',
    description: '',
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    amenities: [],
    policies: [],
    contacts: [],
  })

  // Local state for adding multi-value fields
  const [currentAmenity, setCurrentAmenity] = useState('')
  const [currentPolicy, setCurrentPolicy] = useState('')
  const [currentContact, setCurrentContact] = useState<Partial<HotelContact>>({
    role: '',
    name: '',
    phone: '',
    email: '',
  })

  const filteredHotels = hotels.filter((h) =>
    h.name.toLowerCase().includes(filter.toLowerCase()),
  )

  const handleAddressSelect = (addr: AddressData) => {
    const mappedCountry =
      addr.country === 'Brazil'
        ? 'BR'
        : addr.country === 'Spain'
          ? 'ES'
          : addr.country === 'USA'
            ? 'US'
            : (newHotel.country as any)

    setNewHotel((prev) => ({
      ...prev,
      address: addr.street,
      city: addr.city,
      state: addr.state,
      zipCode: applyZipCodeMask(addr.zipCode, mappedCountry),
      country: mappedCountry,
    }))
  }

  const addAmenity = () => {
    if (currentAmenity.trim()) {
      setNewHotel((prev) => ({
        ...prev,
        amenities: [...(prev.amenities || []), currentAmenity.trim()],
      }))
      setCurrentAmenity('')
    }
  }

  const addPolicy = () => {
    if (currentPolicy.trim()) {
      setNewHotel((prev) => ({
        ...prev,
        policies: [...(prev.policies || []), currentPolicy.trim()],
      }))
      setCurrentPolicy('')
    }
  }

  const addContact = () => {
    if (currentContact.name && currentContact.role) {
      setNewHotel((prev) => ({
        ...prev,
        contacts: [
          ...(prev.contacts || []),
          { ...currentContact, id: `c-${Date.now()}` } as HotelContact,
        ],
      }))
      setCurrentContact({ role: '', name: '', phone: '', email: '' })
    }
  }

  const handleAddHotel = () => {
    if (!newHotel.name || !newHotel.address) {
      toast({
        title: t('common.error'),
        description: t('common.required'),
        variant: 'destructive',
      })
      return
    }

    addHotel({
      id: `hotel-${Date.now()}`,
      name: newHotel.name,
      address: newHotel.address,
      city: newHotel.city || '',
      state: newHotel.state || '',
      country: newHotel.country || 'US',
      zipCode: newHotel.zipCode || '',
      description: newHotel.description,
      managerName: newHotel.managerName,
      managerEmail: newHotel.managerEmail,
      managerPhone: newHotel.managerPhone,
      towers: [],
      amenities: newHotel.amenities || [],
      policies: newHotel.policies || [],
      contacts: newHotel.contacts || [],
    } as Hotel)

    setOpen(false)
    setNewHotel({
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'US',
      zipCode: '',
      description: '',
      managerName: '',
      managerEmail: '',
      managerPhone: '',
      amenities: [],
      policies: [],
      contacts: [],
    })
    toast({ title: t('common.success') })
  }

  const getHotelStats = (hotelId: string) => {
    const rooms = properties.filter((p) => p.hotelId === hotelId)
    const occupied = rooms.filter((r) => r.status === 'occupied').length
    const total = rooms.length
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
    return { total, occupancyRate }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {t('hotels.title')}
          </h1>
          <p className="text-slate-700 font-medium">{t('hotels.subtitle')}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue gap-2">
              <Plus className="h-4 w-4" /> {t('hotels.add_title')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('hotels.new_hotel')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                  Basic Information
                </h3>
                <div className="grid gap-2">
                  <Label>{t('common.name')}</Label>
                  <Input
                    value={newHotel.name}
                    onChange={(e) =>
                      setNewHotel({ ...newHotel, name: e.target.value })
                    }
                    placeholder="Grand Hotel"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.description')}</Label>
                  <Textarea
                    value={newHotel.description}
                    onChange={(e) =>
                      setNewHotel({ ...newHotel, description: e.target.value })
                    }
                    placeholder="Brief description of the property..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('common.address')}</Label>
                  <AddressInput onAddressSelect={handleAddressSelect} />
                  <Input
                    value={newHotel.address}
                    onChange={(e) =>
                      setNewHotel({ ...newHotel, address: e.target.value })
                    }
                    placeholder={t('properties.address_placeholder')}
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('properties.city_placeholder')}</Label>
                    <Input
                      value={newHotel.city}
                      onChange={(e) =>
                        setNewHotel({ ...newHotel, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('properties.state_placeholder')}</Label>
                    <Input
                      value={newHotel.state}
                      onChange={(e) =>
                        setNewHotel({ ...newHotel, state: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>{t('common.country')}</Label>
                    <Select
                      value={newHotel.country}
                      onValueChange={(v) =>
                        setNewHotel({ ...newHotel, country: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="BR">Brazil</SelectItem>
                        <SelectItem value="ES">Spain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>{t('properties.zip_code')}</Label>
                    <Input
                      value={newHotel.zipCode}
                      onChange={(e) =>
                        setNewHotel({ ...newHotel, zipCode: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Amenities & Policies */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                  Amenities & Policies
                </h3>
                <div className="grid gap-2">
                  <Label>Amenities</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentAmenity}
                      onChange={(e) => setCurrentAmenity(e.target.value)}
                      placeholder="e.g. Pool, Wi-Fi"
                    />
                    <Button onClick={addAmenity} type="button" size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newHotel.amenities?.map((am, i) => (
                      <Badge key={i} variant="secondary">
                        {am}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Policies</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentPolicy}
                      onChange={(e) => setCurrentPolicy(e.target.value)}
                      placeholder="e.g. No Pets"
                    />
                    <Button onClick={addPolicy} type="button" size="sm">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    {newHotel.policies?.map((pol, i) => (
                      <span key={i} className="text-sm text-slate-600">
                        • {pol}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Roles */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                  Team Roles
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Role (e.g. Manager)"
                    value={currentContact.role}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        role: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Name"
                    value={currentContact.name}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        name: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Phone"
                    value={currentContact.phone}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        phone: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Email"
                    value={currentContact.email}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <Button
                  onClick={addContact}
                  type="button"
                  size="sm"
                  className="w-full"
                >
                  Add Team Member
                </Button>
                <div className="space-y-2 mt-2">
                  {newHotel.contacts?.map((contact, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded"
                    >
                      <div>
                        <span className="font-bold">{contact.role}:</span>{' '}
                        {contact.name}
                      </div>
                      <div className="text-slate-500">
                        {contact.phone} | {contact.email}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddHotel}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative w-full md:w-1/3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder={t('common.search')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-8 text-black"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg">
            {t('hotels.no_hotels')}
          </div>
        ) : (
          filteredHotels.map((hotel) => {
            const stats = getHotelStats(hotel.id)
            return (
              <Card
                key={hotel.id}
                className="hover:shadow-md transition-shadow flex flex-col"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <HotelIcon className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          <DataMask>{hotel.name}</DataMask>
                        </CardTitle>
                        <CardDescription>
                          <DataMask>{hotel.city}</DataMask>, {hotel.country}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">
                        <DataMask>{hotel.address}</DataMask>
                      </span>
                    </div>
                    {hotel.managerName && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Manager: <DataMask>{hotel.managerName}</DataMask>
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">
                          {stats.total}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Rooms
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {stats.occupancyRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Occupancy
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button asChild className="w-full" variant="outline">
                    <Link to={`/hotels/${hotel.id}`}>
                      {t('common.view')} {t('common.details')}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
