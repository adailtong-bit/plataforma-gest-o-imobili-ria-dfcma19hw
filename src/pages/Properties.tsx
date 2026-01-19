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
import { MapPin, Trash2 } from 'lucide-react'
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

export default function Properties() {
  const { properties, addProperty, deleteProperty } = usePropertyStore()
  const { condominiums } = useCondominiumStore()
  const { currentUser } = useAuthStore()
  const { t } = useLanguageStore()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState<
    'all' | 'long_term' | 'short_term'
  >('all')
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const [newProp, setNewProp] = useState<Partial<Property>>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    type: 'House',
    profileType: 'short_term',
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    ownerId: '',
    agentId: '',
    condominiumId: '',
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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'available':
      case 'vacant':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'suspended':
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddProperty = () => {
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
      type: newProp.type || 'House',
      profileType: newProp.profileType || 'short_term',
      community: selectedCondo ? selectedCondo.name : 'Independent',
      condominiumId: newProp.condominiumId,
      status: 'available',
      image: 'https://img.usecurling.com/p/400/300?q=house',
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
    } as Property)
    toast({
      title: t('properties.property_added'),
      description: `${newProp.name} ${t('properties.property_added_desc')}`,
    })
    setOpen(false)
  }

  const handleDelete = (id: string) => {
    try {
      deleteProperty(id)
      toast({ title: 'Propriedade excluída com sucesso.' })
    } catch (e: any) {
      toast({
        title: t('common.error'),
        description:
          e.message === 'error_active_tenant'
            ? t('common.delete_active_tenant_error')
            : 'Erro ao excluir.',
        variant: 'destructive',
      })
    }
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

        {hasPermission(currentUser as User, 'properties', 'create') && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-trust-blue hover:bg-blue-700">
                {t('properties.new_property')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="City"
                    value={newProp.city}
                    onChange={(e) =>
                      setNewProp({ ...newProp, city: e.target.value })
                    }
                  />
                  <Input
                    placeholder="State"
                    value={newProp.state}
                    onChange={(e) =>
                      setNewProp({ ...newProp, state: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Zip"
                    value={newProp.zipCode}
                    onChange={(e) =>
                      setNewProp({ ...newProp, zipCode: e.target.value })
                    }
                  />
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
                    <Label>Perfil</Label>
                    <Select
                      value={newProp.profileType}
                      onValueChange={(val: any) =>
                        setNewProp({ ...newProp, profileType: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short_term">
                          Short Term (STR)
                        </SelectItem>
                        <SelectItem value="long_term">
                          Long Term (LTR)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleAddProperty} className="bg-trust-blue">
                  {t('common.save')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
            <SelectItem value="rented">{t('status.rented')}</SelectItem>
            <SelectItem value="available">{t('status.available')}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={profileFilter}
          onValueChange={(v: any) => setProfileFilter(v)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Perfis</SelectItem>
            <SelectItem value="short_term">Short Term</SelectItem>
            <SelectItem value="long_term">Long Term</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProperties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col group relative"
          >
            <div className="relative h-48 w-full">
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
              <Badge
                className={`absolute top-2 right-2 ${getStatusColor(property.status)}`}
              >
                {t(`status.${property.status}`)}
              </Badge>
              <Badge className="absolute bottom-2 left-2 bg-black/50 text-white">
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
              <CardTitle className="text-lg">{property.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {property.community}
              </p>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{property.address}</span>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t bg-muted/20">
              <Link to={`/properties/${property.id}`} className="w-full">
                <Button variant="outline" className="w-full">
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
