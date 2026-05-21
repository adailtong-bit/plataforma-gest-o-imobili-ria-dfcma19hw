import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import useAuthStore from '@/stores/useAuthStore'
import { BasicTab } from './BasicTab'
import { LocationTab } from './LocationTab'
import { MediaTab } from './MediaTab'

export function PropertyFormModal({
  open,
  onOpenChange,
  property,
  onSaved,
}: any) {
  const { toast } = useToast()
  const { currentUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('basic')
  const [form, setForm] = useState<any>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [owners, setOwners] = useState<any[]>([])
  const [hotels, setHotels] = useState<any[]>([])
  const [condos, setCondos] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      setActiveTab('basic')
      setForm(
        property || {
          status: 'available',
          type: 'house',
          profile_type: 'short_term',
          country: 'US',
        },
      )
      setImageFile(null)
      fetchData()
    }
  }, [open, property])

  const fetchData = async () => {
    const [oRes, hRes, cRes] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('hotels').select('*'),
      supabase.from('condominiums' as any).select('*'),
    ])
    if (oRes.data) setOwners(oRes.data)
    if (hRes.data) setHotels(hRes.data)
    if (cRes.data) setCondos(cRes.data)
  }

  const handleSave = async () => {
    if (!form.name || !form.address) {
      return toast({
        title: 'Error',
        description: 'Name and Address are required.',
        variant: 'destructive',
      })
    }

    if (form.area && parseFloat(form.area) < 0) {
      return toast({
        title: 'Validation Error',
        description: 'Area cannot be negative.',
        variant: 'destructive',
      })
    }

    if (form.listing_price && parseFloat(form.listing_price) < 0) {
      return toast({
        title: 'Validation Error',
        description: 'Listing price cannot be negative.',
        variant: 'destructive',
      })
    }

    if (form.type === 'room' && (!form.hotel_id || form.hotel_id === 'none')) {
      return toast({
        title: 'Error',
        description: 'You must associate the room with a Hotel.',
        variant: 'destructive',
      })
    }

    if (
      form.type !== 'room' &&
      (!form.condominium_id || form.condominium_id === 'none')
    ) {
      return toast({
        title: 'Error',
        description: 'You must associate the property with a Condominium.',
        variant: 'destructive',
      })
    }

    setIsUploading(true)
    let imageUrl = form.image
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fn = `${Math.random().toString(36).substring(2, 15)}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('property-images')
        .upload(fn, imageFile)
      if (upErr) {
        toast({
          title: 'Upload Error',
          description: upErr.message,
          variant: 'destructive',
        })
        setIsUploading(false)
        return
      }
      imageUrl = supabase.storage.from('property-images').getPublicUrl(fn)
        .data.publicUrl
    }

    const payload = {
      ...form,
      image: imageUrl,
      pm_id: property ? form.pm_id : currentUser?.id,
    }

    if (payload.type === 'room') {
      payload.condominium_id = null
    } else {
      payload.hotel_id = null
    }

    if (payload.bedrooms) payload.bedrooms = parseInt(payload.bedrooms)
    if (payload.bathrooms) payload.bathrooms = parseInt(payload.bathrooms)
    if (payload.guests) payload.guests = parseInt(payload.guests)
    if (payload.area) payload.area = parseFloat(payload.area)
    if (payload.listing_price)
      payload.listing_price = parseFloat(payload.listing_price)
    if (payload.hoa_value) payload.hoa_value = parseFloat(payload.hoa_value)

    const { error } = property
      ? await supabase
          .from('properties')
          .update(payload as any)
          .eq('id', property.id)
      : await supabase.from('properties').insert([payload as any])

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Success', description: 'Property saved successfully.' })
      onSaved()
      onOpenChange(false)
    }
    setIsUploading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>
            {property ? 'Edit Property' : 'Add Property'}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">
                General Info & Associations
              </TabsTrigger>
              <TabsTrigger value="location">Location & Access</TabsTrigger>
              <TabsTrigger value="media">Connectivity & Media</TabsTrigger>
            </TabsList>
            <TabsContent value="basic">
              <BasicTab
                form={form}
                setForm={setForm}
                owners={owners}
                hotels={hotels}
                condos={condos}
              />
            </TabsContent>
            <TabsContent value="location">
              <LocationTab form={form} setForm={setForm} />
            </TabsContent>
            <TabsContent value="media">
              <MediaTab
                form={form}
                setForm={setForm}
                setImageFile={setImageFile}
              />
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter className="p-6 border-t mt-auto">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-trust-blue text-white"
            disabled={isUploading}
          >
            {isUploading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
