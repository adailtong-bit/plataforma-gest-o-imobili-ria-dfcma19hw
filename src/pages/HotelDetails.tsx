import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Save,
  X,
  Plus,
  Building,
  MapPin,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useHotelStore from '@/stores/useHotelStore'
import useLanguageStore from '@/stores/useLanguageStore'
import { Hotel, Tower } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RoomList } from '@/components/hotels/RoomList'
import { RoomTypesManager } from '@/components/hotels/RoomTypesManager'
import { DataMask } from '@/components/DataMask'
import { supabase } from '@/lib/supabase/client'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'

import { HotelFinancials } from '@/components/hotels/HotelFinancials'
import useAuthStore from '@/stores/useAuthStore'

export default function HotelDetails() {
  const { id, tab } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(tab || 'overview')
  const { hotels, towers, updateHotel, deleteHotel, addTower, deleteTower } =
    useHotelStore()

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab)
    }
  }, [tab])
  const { t } = useLanguageStore()
  const { toast } = useToast()

  // To check if current user is guest or admin
  const { currentUser } = useAuthStore()
  const isAdminOrPM = [
    'master',
    'software_tenant',
    'platform_owner',
    'internal_user',
  ].includes(currentUser?.role || '')

  const [hotel, setHotel] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Hotel | null>(null)
  const [newTowerName, setNewTowerName] = useState('')
  const [isAddTowerOpen, setIsAddTowerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHotel() {
      if (!id) return

      // Attempt to find in store first
      if (hotels.length > 0) {
        const found = hotels.find((h) => h.id === id)
        if (found) {
          if (hotel?.id !== id) {
            setHotel(found)
            setFormData(found)
            setIsLoading(false)
          }
          return
        }
      }

      if (hotel?.id === id) return // Prevent re-fetching if we already have it

      setIsLoading(true)
      // Fallback to direct DB fetch if not in store
      const { data } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', id)
        .single()
      if (data) {
        const h = {
          ...data,
          managerName: data.manager_name,
          managerPhone: data.manager_phone,
          managerEmail: data.manager_email,
          zipCode: data.zip_code,
        }
        setHotel(h)
        setFormData(h)
      }
      setIsLoading(false)
    }
    loadHotel()
  }, [id, hotels, hotel?.id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-trust-blue" />
      </div>
    )
  }

  if (!hotel || !formData) {
    return (
      <div className="p-6 text-center max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {t('hotels.not_found') || 'Hotel Not Found'}
        </h2>
        <Button
          onClick={() => navigate('/hotels')}
          className="bg-trust-blue text-white mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back') || 'Back'}
        </Button>
      </div>
    )
  }

  const handleSave = async () => {
    // Save to DB to persist billing fields, etc.
    const payload = {
      name: formData.name,
      address: formData.address,
      number: formData.number,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode || formData.zip_code,
      country: formData.country,
      manager_name: formData.managerName,
      manager_phone: formData.managerPhone,
      manager_email: formData.managerEmail,
      image: formData.image,
      tax_id: formData.tax_id,
      billing_address: formData.billing_address,
      billing_email: formData.billing_email,
      billing_phone: formData.billing_phone,
      payment_data: formData.payment_data,
      gallery: formData.gallery,
      general_access_code:
        formData.generalAccessCode || formData.general_access_code,
      pool_access_code: formData.poolAccessCode || formData.pool_access_code,
      game_room_access_code:
        formData.gameRoomAccessCode || formData.game_room_access_code,
    }

    const { error } = await supabase
      .from('hotels')
      .update(payload)
      .eq('id', hotel.id)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    updateHotel(formData)
    setHotel(formData)
    setIsEditing(false)
    toast({
      title: t('common.success') || 'Success',
      description: t('hotels.update_success') || 'Hotel updated successfully.',
    })
  }

  const handleDelete = () => {
    deleteHotel(hotel.id)
    toast({
      title: t('common.success') || 'Success',
      description: t('hotels.delete_success') || 'Hotel deleted.',
    })
    navigate('/hotels')
  }

  const handleAddTower = () => {
    if (!newTowerName) return
    addTower({
      hotelId: hotel.id,
      name: newTowerName,
    })
    setNewTowerName('')
    setIsAddTowerOpen(false)
    toast({
      title: t('common.success') || 'Success',
      description: t('hotels.tower_add_success') || 'Tower added successfully.',
    })
  }

  const hotelTowers = towers.filter((t) => t.hotelId === hotel.id)

  return (
    <div className="p-6 flex flex-col gap-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/hotels')}
            className="border-slate-300"
          >
            <ArrowLeft className="h-4 w-4 text-slate-700" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Building className="h-6 w-6 text-trust-blue" />
              <DataMask>{formData.name}</DataMask>
            </h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              <DataMask>
                {formData.address}, {formData.city}
              </DataMask>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setFormData(hotel)
                  setIsEditing(false)
                }}
              >
                <X className="h-4 w-4 mr-2" /> {t('common.cancel') || 'Cancel'}
              </Button>
              <Button onClick={handleSave} className="bg-trust-blue text-white">
                <Save className="h-4 w-4 mr-2" /> {t('common.save') || 'Save'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" /> {t('common.edit') || 'Edit'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />{' '}
                    {t('common.delete') || 'Delete'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t('common.delete_title') || 'Are you sure?'}
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
                      onClick={handleDelete}
                      className="bg-red-600"
                    >
                      {t('common.delete') || 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v)
          navigate(`/hotels/${id}/${v}`, { replace: true })
        }}
        className="w-full"
      >
        <TabsList className="mb-6 flex flex-wrap h-auto bg-slate-100 p-1 rounded-md gap-1 w-full lg:w-fit">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
          >
            {t('properties.tabs.overview') || 'Overview'}
          </TabsTrigger>
          {isAdminOrPM && (
            <>
              <TabsTrigger
                value="towers"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
              >
                {t('hotels.towers') || 'Towers'}
              </TabsTrigger>
              <TabsTrigger
                value="room-types"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
              >
                {t('hotels.room_types') || 'Room Types & Rates'}
              </TabsTrigger>
              <TabsTrigger
                value="rooms"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
              >
                {t('hotels.all_rooms') || 'All Rooms'}
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded"
              >
                {t('properties.tabs.financial') || 'Financial'}
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardContent className="p-0 overflow-hidden relative">
              {formData.image ? (
                <div className="w-full h-[300px]">
                  <img
                    src={formData.image}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-full h-[300px] bg-slate-100 flex items-center justify-center text-slate-400">
                  <span>{t('hotels.no_image') || 'No image available'}</span>
                </div>
              )}
              {isEditing && (
                <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-md shadow flex gap-2 items-center">
                  <Label className="text-xs">Image URL</Label>
                  <Input
                    className="h-8 text-sm"
                    value={formData.image || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('hotels.info') || 'Hotel Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>{t('common.name') || 'Name'}</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                {isAdminOrPM && (
                  <>
                    <div className="space-y-2">
                      <Label>
                        {t('condominiums.manager_name') || 'Manager Name'}
                      </Label>
                      <Input
                        value={formData.managerName || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerName: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>
                        {t('condominiums.manager_email') || 'Manager Email'}
                      </Label>
                      <Input
                        value={formData.managerEmail || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerEmail: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>
                        {t('condominiums.manager_phone') || 'Manager Phone'}
                      </Label>
                      <Input
                        value={formData.managerPhone || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerPhone: e.target.value,
                          })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>{t('common.address') || 'Street/Address'}</Label>
                  <Input
                    value={formData.address || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.number') || 'Number'}</Label>
                  <Input
                    value={formData.number || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.neighborhood') || 'Neighborhood'}</Label>
                  <Input
                    value={formData.neighborhood || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, neighborhood: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.city') || 'City'}</Label>
                  <Input
                    value={formData.city || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.state') || 'State'}</Label>
                  <Input
                    value={formData.state || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('common.zip_code') || 'Zip Code'}</Label>
                  <Input
                    value={formData.zipCode || formData.zip_code || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('common.country') || 'Country'}</Label>
                  <Input
                    value={formData.country || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t('hotels.access_security', 'Access & Security')}
              </CardTitle>
              <CardDescription>
                Credentials and instructions for guests and staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t(
                      'hotels.general_access_code',
                      'Main Access Code/Instructions',
                    )}
                  </Label>
                  <Input
                    value={
                      formData.generalAccessCode ||
                      formData.general_access_code ||
                      ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        generalAccessCode: e.target.value,
                        general_access_code: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="e.g. 1234# or Keycard at reception"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t(
                      'hotels.pool_access_code',
                      'Pool Access Code/Instructions',
                    )}
                  </Label>
                  <Input
                    value={
                      formData.poolAccessCode || formData.pool_access_code || ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        poolAccessCode: e.target.value,
                        pool_access_code: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="e.g. 5678 or Open 8am-8pm"
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label>
                    {t(
                      'hotels.game_room_access_code',
                      'Game Room Access Code/Instructions',
                    )}
                  </Label>
                  <Input
                    value={
                      formData.gameRoomAccessCode ||
                      formData.game_room_access_code ||
                      ''
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gameRoomAccessCode: e.target.value,
                        game_room_access_code: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    placeholder="e.g. 9999 or Ask concierge"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {isAdminOrPM && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t('hotels.billing_data') || 'Billing & Payment Data'}
                </CardTitle>
                <CardDescription>
                  Private billing and tax information for hotel management.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{t('common.tax_id') || 'Tax ID / EIN'}</Label>
                    <Input
                      value={formData.tax_id || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, tax_id: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('common.billing_email') || 'Billing Email'}
                    </Label>
                    <Input
                      type="email"
                      value={formData.billing_email || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billing_email: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('common.billing_phone') || 'Billing Phone'}
                    </Label>
                    <Input
                      value={formData.billing_phone || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billing_phone: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-3">
                    <Label>
                      {t('common.billing_address') || 'Billing Address'}
                    </Label>
                    <Input
                      value={formData.billing_address || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          billing_address: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>{' '}
                  <div className="space-y-2 col-span-2 md:col-span-3">
                    <Label>
                      {t('common.payment_data') || 'Payment Method / Data'}
                    </Label>
                    <Input
                      value={
                        formData.payment_data
                          ? JSON.stringify(formData.payment_data)
                          : ''
                      }
                      onChange={(e) => {
                        try {
                          const parsed = e.target.value
                            ? JSON.parse(e.target.value)
                            : {}
                          setFormData({ ...formData, payment_data: parsed })
                        } catch {
                          // Allow typing partial JSON
                          setFormData({
                            ...formData,
                            payment_data: e.target.value as any,
                          })
                        }
                      }}
                      placeholder='{"method": "Bank Transfer", "bank": "Chase"}'
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle>Photo Gallery</CardTitle>
                <CardDescription>
                  Upload photos for this hotel to be displayed to guests.
                </CardDescription>
              </div>
              {isEditing && (
                <div>
                  <input
                    type="file"
                    id="hotel-gallery-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const fileExt = file.name.split('.').pop()
                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                      const { error } = await supabase.storage
                        .from('hotel_photos')
                        .upload(fileName, file)
                      if (error) {
                        toast({
                          title: 'Error',
                          description: error.message,
                          variant: 'destructive',
                        })
                        return
                      }
                      const {
                        data: { publicUrl },
                      } = supabase.storage
                        .from('hotel_photos')
                        .getPublicUrl(fileName)
                      setFormData({
                        ...formData,
                        gallery: [...(formData.gallery || []), publicUrl],
                      })
                    }}
                  />
                  <Button
                    onClick={() =>
                      document.getElementById('hotel-gallery-upload')?.click()
                    }
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Upload Photo
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {!formData.gallery || formData.gallery.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                    No photos in gallery.
                  </div>
                ) : (
                  formData.gallery.map((url: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-md overflow-hidden border"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${idx}`}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                      {isEditing && (
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newGallery = [...formData.gallery]
                            newGallery.splice(idx, 1)
                            setFormData({ ...formData, gallery: newGallery })
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <HotelFinancials hotelId={hotel.id} />
        </TabsContent>

        <TabsContent value="towers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">
              {t('hotels.towers_wings') || 'Towers & Wings'}
            </h3>
            <Dialog open={isAddTowerOpen} onOpenChange={setIsAddTowerOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-trust-blue text-white">
                  <Plus className="w-4 h-4 mr-2" />{' '}
                  {t('hotels.add_tower') || 'Add Tower'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {t('hotels.add_new_tower') || 'Add New Tower/Wing'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>{t('hotels.tower_name') || 'Tower Name'}</Label>
                    <Input
                      value={newTowerName}
                      onChange={(e) => setNewTowerName(e.target.value)}
                      placeholder="e.g. North Tower"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddTowerOpen(false)}
                  >
                    {t('common.cancel') || 'Cancel'}
                  </Button>
                  <Button onClick={handleAddTower}>
                    {t('common.add') || 'Add'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotelTowers.map((tower) => (
              <Card key={tower.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{tower.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mt-4">
                    <Link to={`/hotels/${hotel.id}/towers/${tower.id}`}>
                      <Button variant="outline" size="sm">
                        {t('hotels.manage_rooms') || 'Manage Rooms'}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => deleteTower(tower.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {hotelTowers.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                {t('hotels.no_towers') || 'No towers or wings defined.'}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="room-types">
          <RoomTypesManager hotelId={hotel.id} />
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <CardTitle>{t('hotels.all_rooms') || 'All Rooms'}</CardTitle>
              <CardDescription>
                Rooms across all towers in this hotel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoomList hotelId={hotel.id} towerId="none" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
