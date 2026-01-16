import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, BedDouble, Bath } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import usePropertyStore from '@/stores/usePropertyStore'
import useOwnerStore from '@/stores/useOwnerStore'
import usePartnerStore from '@/stores/usePartnerStore'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import useLanguageStore from '@/stores/useLanguageStore'

export default function Properties() {
  const { properties, addProperty } = usePropertyStore()
  const { owners } = useOwnerStore()
  const { partners } = usePartnerStore()
  const { t } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { toast } = useToast()

  const realtors = partners.filter((p) => p.type === 'agent')

  const [newProp, setNewProp] = useState({
    name: '',
    address: '',
    type: 'House',
    bedrooms: '3',
    bathrooms: '2',
    guests: '6',
    ownerId: '',
    agentId: '',
  })

  const filteredProperties = properties.filter(
    (p) =>
      (p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.address.toLowerCase().includes(filter.toLowerCase())) &&
      (statusFilter === 'all' || p.status === statusFilter),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'vacant':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddProperty = () => {
    addProperty({
      id: `prop${Date.now()}`,
      name: newProp.name,
      address: newProp.address,
      type: newProp.type,
      community: 'New Community',
      status: 'vacant',
      image: 'https://img.usecurling.com/p/400/300?q=house',
      bedrooms: parseInt(newProp.bedrooms),
      bathrooms: parseInt(newProp.bathrooms),
      guests: parseInt(newProp.guests),
      accessCode: 'Pending',
      wifi: 'Pending',
      ownerId: newProp.ownerId || 'owner1',
      agentId: newProp.agentId,
    })
    toast({
      title: t('properties.property_added'),
      description: `${newProp.name} ${t('properties.property_added_desc')}`,
    })
    setNewProp({
      name: '',
      address: '',
      type: 'House',
      bedrooms: '3',
      bathrooms: '2',
      guests: '6',
      ownerId: '',
      agentId: '',
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-navy">
            {t('properties.title')}
          </h1>
          <p className="text-muted-foreground">{t('properties.subtitle')}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-trust-blue hover:bg-blue-700">
              {t('properties.new_property')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('properties.add_title')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>{t('common.name')}</Label>
                <Input
                  value={newProp.name}
                  onChange={(e) =>
                    setNewProp({ ...newProp, name: e.target.value })
                  }
                  placeholder="Ex: Villa Bella"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('common.address')}</Label>
                <Input
                  value={newProp.address}
                  onChange={(e) =>
                    setNewProp({ ...newProp, address: e.target.value })
                  }
                  placeholder="Ex: 123 Main St"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('properties.owner')}</Label>
                  <Select
                    value={newProp.ownerId}
                    onValueChange={(val) =>
                      setNewProp({ ...newProp, ownerId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('properties.select_owner')} />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t('properties.agent')}</Label>
                  <Select
                    value={newProp.agentId}
                    onValueChange={(val) =>
                      setNewProp({ ...newProp, agentId: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('properties.select_agent')} />
                    </SelectTrigger>
                    <SelectContent>
                      {realtors.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.companyName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('common.type')}</Label>
                  <Select
                    value={newProp.type}
                    onValueChange={(val) =>
                      setNewProp({ ...newProp, type: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="House">
                        {t('properties.house')}
                      </SelectItem>
                      <SelectItem value="Condo">
                        {t('properties.condo')}
                      </SelectItem>
                      <SelectItem value="Townhouse">
                        {t('properties.townhouse')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{t('properties.guests')}</Label>
                  <Input
                    type="number"
                    value={newProp.guests}
                    onChange={(e) =>
                      setNewProp({ ...newProp, guests: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>{t('properties.beds')}</Label>
                  <Input
                    type="number"
                    value={newProp.bedrooms}
                    onChange={(e) =>
                      setNewProp({ ...newProp, bedrooms: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>{t('properties.baths')}</Label>
                  <Input
                    type="number"
                    value={newProp.bathrooms}
                    onChange={(e) =>
                      setNewProp({ ...newProp, bathrooms: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleAddProperty}>{t('common.save')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
        <Input
          placeholder={t('properties.search_placeholder')}
          className="md:w-[300px]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="occupied">{t('common.occupied')}</SelectItem>
            <SelectItem value="vacant">{t('common.vacant')}</SelectItem>
            <SelectItem value="maintenance">
              {t('common.maintenance')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProperties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            <div className="relative h-48 w-full">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
              <Badge
                className={`absolute top-2 right-2 ${getStatusColor(property.status)} hover:${getStatusColor(property.status)}`}
              >
                {t(`common.${property.status}`)}
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {property.community}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{property.address}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
                  <BedDouble className="h-4 w-4 mb-1 text-primary" />
                  <span className="font-semibold">
                    {property.bedrooms} {t('properties.beds')}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
                  <Bath className="h-4 w-4 mb-1 text-primary" />
                  <span className="font-semibold">
                    {property.bathrooms} {t('properties.baths')}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 bg-secondary/50 rounded-md">
                  <Users className="h-4 w-4 mb-1 text-primary" />
                  <span className="font-semibold">
                    {property.guests} {t('properties.guests')}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/20">
              <Link to={`/properties/${property.id}`} className="w-full">
                <Button
                  variant="outline"
                  className="w-full hover:bg-primary hover:text-white transition-colors"
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
