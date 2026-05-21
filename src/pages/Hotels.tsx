import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { supabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Eye, X } from 'lucide-react'
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
import { Link } from 'react-router-dom'
import { FileUpload } from '@/components/ui/file-upload'

export default function Hotels() {
  const { t } = useDbTranslations()
  const { toast } = useToast()

  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<any>({})
  const [activeTab, setActiveTab] = useState('general')
  const [paymentDataStr, setPaymentDataStr] = useState('{}')
  const [uploading, setUploading] = useState(false)

  const handleGalleryUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const urls: string[] = form.gallery || []
      for (const file of Array.from(e.target.files)) {
        const fileExt = file.name.split('.').pop()
        const filePath = `${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('hotel-images')
          .upload(filePath, file)
        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('hotel-images')
          .getPublicUrl(filePath)
        urls.push(data.publicUrl)
      }
      setForm({ ...form, gallery: urls })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const fetchHotels = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      setHotels(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHotels()
  }, [])

  const handleOpenAdd = () => {
    setEditingId(null)
    setForm({
      country: 'US',
      gallery: [],
      general_access_code: '',
      pool_access_code: '',
      game_room_access_code: '',
      website_url: '',
    })
    setPaymentDataStr('{}')
    setActiveTab('general')
    setIsOpen(true)
  }

  const handleOpenEdit = (hotel: any) => {
    setEditingId(hotel.id)
    setForm({
      ...hotel,
      gallery: hotel.gallery || [],
      general_access_code: hotel.general_access_code || '',
      pool_access_code: hotel.pool_access_code || '',
      game_room_access_code: hotel.game_room_access_code || '',
      website_url: hotel.website_url || '',
    })
    setPaymentDataStr(JSON.stringify(hotel.payment_data || {}, null, 2))
    setActiveTab('general')
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.city) {
      toast({
        title: 'Error',
        description: 'Name (General tab) and City (Location tab) are required',
        variant: 'destructive',
      })
      if (!form.name) {
        setActiveTab('general')
      } else if (!form.city) {
        setActiveTab('location')
      }
      return
    }

    let websiteUrl = form.website_url
    if (websiteUrl && websiteUrl.trim() !== '') {
      if (!/^https?:\/\//i.test(websiteUrl)) {
        websiteUrl = 'https://' + websiteUrl
      }
      try {
        new URL(websiteUrl)
      } catch (_) {
        toast({
          title: 'Error',
          description: 'Please enter a valid URL for Hotel Website',
          variant: 'destructive',
        })
        setActiveTab('billing')
        return
      }
    }

    let parsedPaymentData = {}
    try {
      parsedPaymentData = JSON.parse(paymentDataStr || '{}')
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Invalid JSON in Payment Data',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      name: form.name,
      city: form.city,
      address: form.address,
      number: form.number,
      neighborhood: form.neighborhood,
      state: form.state,
      zip_code: form.zip_code,
      country: form.country,
      manager_name: form.manager_name,
      manager_email: form.manager_email,
      manager_phone: form.manager_phone,
      tax_id: form.tax_id,
      billing_email: form.billing_email,
      billing_phone: form.billing_phone,
      billing_address: form.billing_address,
      image: form.image,
      gallery: form.gallery,
      payment_data: parsedPaymentData,
      general_access_code: form.general_access_code,
      pool_access_code: form.pool_access_code,
      game_room_access_code: form.game_room_access_code,
      website_url: websiteUrl,
    }

    if (editingId) {
      const { error } = await supabase
        .from('hotels')
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
      const { error } = await supabase.from('hotels').insert([payload])
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
    fetchHotels()
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('hotels').delete().eq('id', id)
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: t('common.success', 'Success') })
      fetchHotels()
    }
  }

  const formatAddress = (hotel: any) => {
    const parts = [
      hotel.address,
      hotel.number,
      hotel.neighborhood,
      hotel.city,
      hotel.state,
      hotel.country,
    ].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('hotels.title', 'Hotels & Resorts')}
          </h1>
          <p className="text-slate-500">
            {t('hotels.subtitle', 'Manage your hotel properties and complexes')}
          </p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-trust-blue text-white gap-2"
        >
          <Plus className="h-4 w-4" /> {t('common.add_hotel', 'Add Hotel')}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle>
              {editingId
                ? t('common.edit_hotel', 'Edit Hotel')
                : t('common.add_hotel', 'Add Hotel')}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="w-full">
              <div className="flex flex-wrap w-full items-center justify-start rounded-md bg-slate-100 p-1 mb-4 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${activeTab === 'general' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t('hotels.tab_general', 'General')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('location')}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${activeTab === 'location' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t('hotels.tab_location', 'Location')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('access')}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${activeTab === 'access' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t('hotels.tab_access', 'Access & Security')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('billing')}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 ${activeTab === 'billing' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {t('hotels.tab_billing', 'Billing & Media')}
                </button>
              </div>

              {activeTab === 'general' && (
                <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {t('common.name', 'Hotel Name')} *
                      </Label>
                      <Input
                        id="name"
                        value={form.name || ''}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="e.g. Grande Hotel Teste"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="manager_name">
                          {t('common.manager_name', 'Manager Name')}
                        </Label>
                        <Input
                          id="manager_name"
                          value={form.manager_name || ''}
                          onChange={(e) =>
                            setForm({ ...form, manager_name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manager_email">
                          {t('common.email', 'Email')}
                        </Label>
                        <Input
                          id="manager_email"
                          type="email"
                          value={form.manager_email || ''}
                          onChange={(e) =>
                            setForm({ ...form, manager_email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manager_phone">
                          {t('common.phone', 'Phone')}
                        </Label>
                        <Input
                          id="manager_phone"
                          value={form.manager_phone || ''}
                          onChange={(e) =>
                            setForm({ ...form, manager_phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">
                        {t('common.tax_id', 'Tax ID')}
                      </Label>
                      <Input
                        id="tax_id"
                        value={form.tax_id || ''}
                        onChange={(e) =>
                          setForm({ ...form, tax_id: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">
                        {t('common.address', 'Street/Address')}
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
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('common.city', 'City')} *</Label>
                      <Input
                        id="city"
                        value={form.city || ''}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                        placeholder="e.g. Orlando"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">
                        {t('common.state', 'State/Province')}
                      </Label>
                      <Input
                        id="state"
                        value={form.state || ''}
                        onChange={(e) =>
                          setForm({ ...form, state: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                  </div>
                </div>
              )}

              {activeTab === 'access' && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-2">
                    <Label htmlFor="general_access_code">
                      {t(
                        'hotels.general_access_code',
                        'Main Access Code/Instructions',
                      )}
                    </Label>
                    <Input
                      id="general_access_code"
                      placeholder="e.g. 1234# or ask at reception"
                      value={form.general_access_code || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          general_access_code: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pool_access_code">
                      {t(
                        'hotels.pool_access_code',
                        'Pool Access Code/Instructions',
                      )}
                    </Label>
                    <Input
                      id="pool_access_code"
                      placeholder="e.g. 5678 or Open 8am-8pm"
                      value={form.pool_access_code || ''}
                      onChange={(e) =>
                        setForm({ ...form, pool_access_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="game_room_access_code">
                      {t(
                        'hotels.game_room_access_code',
                        'Game Room Access Code/Instructions',
                      )}
                    </Label>
                    <Input
                      id="game_room_access_code"
                      placeholder="e.g. 9999 or Ask concierge"
                      value={form.game_room_access_code || ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          game_room_access_code: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billing_email">
                          {t('common.billing_email', 'Billing Email')}
                        </Label>
                        <Input
                          id="billing_email"
                          type="email"
                          value={form.billing_email || ''}
                          onChange={(e) =>
                            setForm({ ...form, billing_email: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billing_phone">
                          {t('common.billing_phone', 'Billing Phone')}
                        </Label>
                        <Input
                          id="billing_phone"
                          value={form.billing_phone || ''}
                          onChange={(e) =>
                            setForm({ ...form, billing_phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing_address">
                        {t('common.billing_address', 'Billing Address')}
                      </Label>
                      <textarea
                        id="billing_address"
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.billing_address || ''}
                        onChange={(e) =>
                          setForm({ ...form, billing_address: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website_url">
                        {t('hotels.website_url', 'Hotel Website')}
                      </Label>
                      <Input
                        id="website_url"
                        type="url"
                        placeholder="https://..."
                        value={form.website_url || ''}
                        onChange={(e) =>
                          setForm({ ...form, website_url: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <FileUpload
                        label={t('hotels.hotel_photo', 'Hotel Photo')}
                        value={form.image}
                        onChange={async (url, file) => {
                          if (file) {
                            try {
                              setUploading(true)
                              const fileExt = file.name.split('.').pop()
                              const filePath = `${Math.random()}.${fileExt}`
                              const { error: uploadError } =
                                await supabase.storage
                                  .from('hotel-images')
                                  .upload(filePath, file)
                              if (uploadError) throw uploadError
                              const { data } = supabase.storage
                                .from('hotel-images')
                                .getPublicUrl(filePath)
                              setForm({ ...form, image: data.publicUrl })
                            } catch (error: any) {
                              toast({
                                title: 'Error',
                                description: error.message,
                                variant: 'destructive',
                              })
                            } finally {
                              setUploading(false)
                            }
                          }
                        }}
                        disabled={uploading}
                        isUploading={uploading}
                        accept="image/*"
                      />
                      {form.image && (
                        <div className="mt-2 relative inline-block">
                          <img
                            src={form.image}
                            alt="Hotel"
                            className="h-24 w-32 object-cover rounded-md border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, image: '' })}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label>{t('common.gallery', 'Gallery')}</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById('gallery-upload')?.click()
                          }
                          disabled={uploading}
                          className="bg-white hover:bg-slate-50 border-slate-200 shadow-sm"
                        >
                          {uploading ? (
                            <>
                              <span className="h-4 w-4 mr-2 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                              {t('common.uploading', 'Uploading...')}
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />{' '}
                              {t('common.add_photos', 'Add Photos')}
                            </>
                          )}
                        </Button>
                        <input
                          id="gallery-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleGalleryUpload}
                          disabled={uploading}
                        />
                      </div>
                      {form.gallery && form.gallery.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {form.gallery.map((url: string, i: number) => (
                            <div key={i} className="relative group">
                              <img
                                src={url}
                                alt={`Gallery ${i}`}
                                className="h-20 w-24 object-cover rounded-md border border-slate-200"
                              />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                                onClick={() => {
                                  const newGallery = [...form.gallery]
                                  newGallery.splice(i, 1)
                                  setForm({ ...form, gallery: newGallery })
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 border-t border-slate-100 pt-4">
                      <Label htmlFor="payment_data">
                        {t('common.payment_data', 'Payment Data (JSON)')}
                      </Label>
                      <textarea
                        id="payment_data"
                        className="flex min-h-[100px] font-mono w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={paymentDataStr}
                        onChange={(e) => setPaymentDataStr(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="p-6 border-t mt-auto">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-trust-blue text-white"
              disabled={uploading}
            >
              {uploading
                ? t('common.uploading', 'Uploading...')
                : t('common.save', 'Save')}
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
                  <TableHead>{t('common.name', 'Hotel Name')}</TableHead>
                  <TableHead>{t('common.address', 'Location')}</TableHead>
                  <TableHead>
                    {t('common.manager', 'Manager Details')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('common.actions', 'Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hotels.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-slate-500"
                    >
                      {t('common.no_data', 'No data available')}
                    </TableCell>
                  </TableRow>
                ) : (
                  hotels.map((hotel) => (
                    <TableRow key={hotel.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                          {hotel.image ? (
                            <img
                              src={hotel.image}
                              alt={hotel.name}
                              className="h-10 w-10 rounded-md object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              <span className="text-xs text-slate-400">
                                N/A
                              </span>
                            </div>
                          )}
                          <span>{hotel.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600 max-w-[250px] truncate">
                        {formatAddress(hotel)}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            {hotel.manager_name ||
                              t('common.unassigned', 'Unassigned')}
                          </span>
                          {hotel.manager_email && (
                            <span className="text-xs text-slate-500">
                              {hotel.manager_email}
                            </span>
                          )}
                          {hotel.manager_phone && (
                            <span className="text-xs text-slate-500">
                              {hotel.manager_phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/hotels/${hotel.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />{' '}
                              {t('common.view', 'Manage')}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(hotel)}
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
                                  {t('common.delete_hotel', 'Delete Hotel')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t(
                                    'common.delete_hotel_desc',
                                    'Are you sure you want to delete this hotel?',
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t('common.cancel', 'Cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(hotel.id)}
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
