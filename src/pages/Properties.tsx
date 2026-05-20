import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Link } from 'react-router-dom'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ImportPropertiesModal } from '@/components/properties/ImportPropertiesModal'
import { BulkPricingModal } from '@/components/properties/BulkPricingModal'
import { Download, DollarSign } from 'lucide-react'

export default function Properties() {
  const { t } = useDbTranslations()
  const { toast } = useToast()

  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>({})

  const fetchProperties = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({ status: 'available' })
    setIsOpen(true)
  }

  const handleOpenEdit = (property: any) => {
    setEditingId(property.id)
    setForm(property)
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.address) {
      toast({
        title: 'Error',
        description: 'Name and address are required',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      name: form.name,
      address: form.address,
      number: form.number,
      neighborhood: form.neighborhood,
      city: form.city,
      state: form.state,
      zip_code: form.zip_code,
      country: form.country || 'US',
      status: form.status,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
      guests: form.guests ? parseInt(form.guests) : null,
      area: form.area ? parseFloat(form.area) : null,
      listing_price: form.listing_price ? parseFloat(form.listing_price) : null,
      hoa_value: form.hoa_value ? parseFloat(form.hoa_value) : null,
      type: form.type,
      profile_type: form.profile_type,
      community: form.community,
      floor: form.floor,
      room_number: form.room_number,
      image: form.image,
    }

    if (editingId) {
      const { error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', editingId)
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: t('common.success', 'Success') })
      }
    } else {
      const { error } = await supabase.from('properties').insert([payload])
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      } else {
        toast({ title: t('common.success', 'Success') })
      }
    }
    setIsOpen(false)
    fetchProperties()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: t('common.success', 'Success') })
      fetchProperties()
    }
  }

  const formatAddress = (prop: any) => {
    const parts = [
      prop.address,
      prop.number,
      prop.neighborhood,
      prop.city,
      prop.state,
      prop.zip_code || prop.zipCode,
      prop.country,
    ].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('properties.title', 'Properties')}
          </h1>
          <p className="text-slate-500">
            {t('properties.subtitle', 'Manage your properties')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsBulkOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" /> Bulk Pricing
          </Button>
          <Button
            onClick={() => setIsImportOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" /> Import
          </Button>
          <Button
            onClick={handleOpenAdd}
            className="bg-trust-blue text-white gap-2"
          >
            <Plus className="h-4 w-4" />{' '}
            {t('common.add_property', 'Add Property')}
          </Button>
        </div>
      </div>

      <ImportPropertiesModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImported={fetchProperties}
      />
      <BulkPricingModal
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        onUpdated={fetchProperties}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>
              {editingId
                ? t('common.edit_property', 'Edit Property')
                : t('common.add_property', 'Add Property')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('common.name', 'Name')}</Label>
                  <Input
                    id="name"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">{t('common.type', 'Type')}</Label>
                  <Select
                    value={form.type || 'house'}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.type', 'Type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile_type">
                    {t('properties.rental_type', 'Rental Profile')}
                  </Label>
                  <Select
                    value={form.profile_type || 'short_term'}
                    onValueChange={(v) => setForm({ ...form, profile_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'properties.rental_type',
                          'Rental Profile',
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short_term">
                        Short Term (Vacation)
                      </SelectItem>
                      <SelectItem value="long_term">Long Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t('common.status', 'Status')}</Label>
                  <Select
                    value={form.status || 'available'}
                    onValueChange={(v) => setForm({ ...form, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.status', 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">
                        {t('status.available', 'Available')}
                      </SelectItem>
                      <SelectItem value="occupied">
                        {t('status.occupied', 'Occupied')}
                      </SelectItem>
                      <SelectItem value="maintenance">
                        {t('status.maintenance', 'Maintenance')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">
                    {t('common.image_url', 'Image URL')}
                  </Label>
                  <Input
                    id="image"
                    value={form.image || ''}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm border-b pb-2">
                  {t('common.address_info', 'Address Information')}
                </h4>
                <div className="grid grid-cols-4 gap-4 pt-2">
                  <div className="col-span-3 space-y-2">
                    <Label htmlFor="address">
                      {t('common.street', 'Street')}
                    </Label>
                    <Input
                      id="address"
                      value={form.address || ''}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">
                      {t('common.number', 'Number')}
                    </Label>
                    <Input
                      id="number"
                      value={form.number || ''}
                      onChange={(e) =>
                        setForm({ ...form, number: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="neighborhood">
                      {t('common.neighborhood', 'Neighborhood')}
                    </Label>
                    <Input
                      id="neighborhood"
                      value={form.neighborhood || ''}
                      onChange={(e) =>
                        setForm({ ...form, neighborhood: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="city">{t('common.city', 'City')}</Label>
                    <Input
                      id="city"
                      value={form.city || ''}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="state">{t('common.state', 'State')}</Label>
                    <Input
                      id="state"
                      value={form.state || ''}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="zip_code">
                      {t('common.zip_code', 'Zip Code')}
                    </Label>
                    <Input
                      id="zip_code"
                      value={form.zip_code || ''}
                      onChange={(e) =>
                        setForm({ ...form, zip_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="country">
                      {t('common.country', 'Country')}
                    </Label>
                    <Input
                      id="country"
                      value={form.country || ''}
                      onChange={(e) =>
                        setForm({ ...form, country: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="community">
                      {t('common.community', 'Community')}
                    </Label>
                    <Input
                      id="community"
                      value={form.community || ''}
                      onChange={(e) =>
                        setForm({ ...form, community: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="floor">{t('common.floor', 'Floor')}</Label>
                    <Input
                      id="floor"
                      value={form.floor || ''}
                      onChange={(e) =>
                        setForm({ ...form, floor: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room_number">
                      {t('common.room_number', 'Room Number')}
                    </Label>
                    <Input
                      id="room_number"
                      value={form.room_number || ''}
                      onChange={(e) =>
                        setForm({ ...form, room_number: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm border-b pb-2">
                  {t('common.property_details', 'Property Details')}
                </h4>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="area">
                      {t('common.area', 'Area (sq ft/m²)')}
                    </Label>
                    <Input
                      id="area"
                      type="number"
                      value={form.area || ''}
                      onChange={(e) =>
                        setForm({ ...form, area: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">
                      {t('common.bedrooms', 'Bedrooms')}
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={form.bedrooms || ''}
                      onChange={(e) =>
                        setForm({ ...form, bedrooms: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">
                      {t('common.bathrooms', 'Bathrooms')}
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={form.bathrooms || ''}
                      onChange={(e) =>
                        setForm({ ...form, bathrooms: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guests">
                      {t('common.guests', 'Guests')}
                    </Label>
                    <Input
                      id="guests"
                      type="number"
                      value={form.guests || ''}
                      onChange={(e) =>
                        setForm({ ...form, guests: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="listing_price">
                      {t('common.price', 'Listing Price')}
                    </Label>
                    <Input
                      id="listing_price"
                      type="number"
                      value={form.listing_price || ''}
                      onChange={(e) =>
                        setForm({ ...form, listing_price: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoa_value">
                      {t('common.hoa_value', 'HOA / Condo Fee')}
                    </Label>
                    <Input
                      id="hoa_value"
                      type="number"
                      value={form.hoa_value || ''}
                      onChange={(e) =>
                        setForm({ ...form, hoa_value: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="p-6 border-t mt-auto">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} className="bg-trust-blue text-white">
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>{t('common.name', 'Name')}</TableHead>
                  <TableHead>{t('common.address', 'Address')}</TableHead>
                  <TableHead>{t('common.details', 'Details')}</TableHead>
                  <TableHead>{t('common.price', 'Price')}</TableHead>
                  <TableHead>{t('common.status', 'Status')}</TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('common.no_data', 'No data available')}
                    </TableCell>
                  </TableRow>
                ) : (
                  properties.map((property) => (
                    <TableRow
                      key={property.id}
                      className="hover:bg-slate-50/50"
                    >
                      <TableCell>
                        {property.image ? (
                          <img
                            src={property.image}
                            alt={property.name}
                            className="w-12 h-12 rounded object-cover shadow-sm border border-slate-200"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                            No Img
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        {property.name}
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[250px] truncate">
                        {formatAddress(property)}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {property.bedrooms || 0} bd | {property.bathrooms || 0}{' '}
                        ba | {property.area || 0} sqft
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">
                        {property.listing_price
                          ? `$${property.listing_price}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            property.status === 'available'
                              ? 'default'
                              : 'secondary'
                          }
                          className="capitalize"
                        >
                          {t(
                            `status.${property.status}`,
                            property.status || 'Available',
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/properties/${property.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />{' '}
                              {t('common.view', 'View')}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(property)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t(
                                    'common.delete_property',
                                    'Delete Property',
                                  )}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'common.delete_property_desc',
                                    'Are you sure you want to delete this property?',
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel', 'Cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(property.id)}
                                >
                                  {t('common.delete', 'Delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
