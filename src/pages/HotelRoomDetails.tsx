import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react'
import usePropertyStore from '@/stores/usePropertyStore'
import useHotelStore from '@/stores/useHotelStore'
import useLanguageStore from '@/stores/useLanguageStore'
import useFinancialStore from '@/stores/useFinancialStore'
import { useToast } from '@/hooks/use-toast'
import { DataMask } from '@/components/DataMask'
import { Property, PropertyStatus } from '@/lib/types'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { CurrencyInput } from '@/components/ui/currency-input'

export default function HotelRoomDetails() {
  const { hotelId, towerId, roomId } = useParams()
  const { properties, updateProperty } = usePropertyStore()
  const { hotels, towers } = useHotelStore()
  const { t, language } = useLanguageStore()
  const { currency } = useFinancialStore()
  const { toast } = useToast()

  const room = properties.find((p) => p.id === roomId)
  const hotel = hotels.find((h) => h.id === hotelId)
  const tower = towers.find((t) => t.id === towerId)

  const [formData, setFormData] = useState<Property | null>(
    room ? { ...room } : null,
  )
  const [newImageUrl, setNewImageUrl] = useState('')

  if (!room || !formData || !hotel) return <div>Room not found</div>

  const handleSave = () => {
    updateProperty(formData)
    toast({ title: t('common.success'), description: 'Room details updated.' })
  }

  const handleChange = (field: keyof Property, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleCharacteristicChange = (field: string, value: any) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            roomCharacteristics: {
              ...prev.roomCharacteristics!,
              [field]: value,
            },
          }
        : null,
    )
  }

  const addImage = () => {
    if (newImageUrl) {
      const gallery = [...(formData.gallery || []), newImageUrl]
      handleChange('gallery', gallery)
      setNewImageUrl('')
    }
  }

  const backLink = tower
    ? `/hotels/${hotel.id}/towers/${tower.id}`
    : `/hotels/${hotel.id}`

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Breadcrumb / Header */}
      <div className="flex items-center gap-4">
        <Link to={backLink}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            Room <DataMask>{formData.roomNumber}</DataMask>
            <Badge variant="outline" className="text-lg font-normal ml-2">
              {formData.status}
            </Badge>
          </h1>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/hotels" className="hover:underline">
              {t('hotels.title')}
            </Link>
            <span>/</span>
            <Link to={`/hotels/${hotel.id}`} className="hover:underline">
              <DataMask>{hotel.name}</DataMask>
            </Link>
            {tower && (
              <>
                <span>/</span>
                <Link
                  to={`/hotels/${hotel.id}/towers/${tower.id}`}
                  className="hover:underline"
                >
                  <DataMask>{tower.name}</DataMask>
                </Link>
              </>
            )}
            <span>/</span>
            <span>Room {formData.roomNumber}</span>
          </div>
        </div>
        <div className="ml-auto">
          <Button onClick={handleSave} className="bg-trust-blue gap-2">
            <Save className="h-4 w-4" /> {t('common.save')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Room Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Room Name/Type</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input
                  value={formData.roomNumber}
                  onChange={(e) => handleChange('roomNumber', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) =>
                    handleChange('status', v as PropertyStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Ready</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="cleaning">In Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nightly Rate</Label>
                <CurrencyInput
                  value={formData.listingPrice || 0}
                  onChange={(val) => handleChange('listingPrice', val)}
                  currency={currency}
                  locale={
                    language === 'pt'
                      ? 'pt-BR'
                      : language === 'es'
                        ? 'es-ES'
                        : 'en-US'
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.additionalInfo || ''}
                onChange={(e) => handleChange('additionalInfo', e.target.value)}
                placeholder="Room detailed description..."
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Characteristics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bed Type</Label>
                  <Select
                    value={formData.roomCharacteristics?.bedType}
                    onValueChange={(v) =>
                      handleCharacteristicChange('bedType', v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="King">King</SelectItem>
                      <SelectItem value="Queen">Queen</SelectItem>
                      <SelectItem value="Double">Double</SelectItem>
                      <SelectItem value="Twin">Twin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>View</Label>
                  <Select
                    value={formData.roomCharacteristics?.view}
                    onValueChange={(v) => handleCharacteristicChange('view', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="City View">City View</SelectItem>
                      <SelectItem value="Sea View">Sea View</SelectItem>
                      <SelectItem value="Pool View">Pool View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Occupancy</Label>
                  <Input
                    type="number"
                    value={formData.roomCharacteristics?.maxOccupancy}
                    onChange={(e) =>
                      handleCharacteristicChange(
                        'maxOccupancy',
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Size (Sq Ft)</Label>
                  <Input
                    type="number"
                    value={formData.roomCharacteristics?.sizeSqFt}
                    onChange={(e) =>
                      handleCharacteristicChange(
                        'sizeSqFt',
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="hasBalcony"
                    checked={formData.roomCharacteristics?.hasBalcony}
                    onCheckedChange={(c) =>
                      handleCharacteristicChange('hasBalcony', c as boolean)
                    }
                  />
                  <Label htmlFor="hasBalcony">Has Balcony</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Photo Gallery</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.gallery && formData.gallery.length > 0 ? (
              <Carousel className="w-full max-w-xs mx-auto">
                <CarouselContent>
                  {formData.gallery.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-0 overflow-hidden rounded-md">
                            <img
                              src={img}
                              alt={`Gallery ${index}`}
                              className="w-full h-full object-cover"
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="aspect-video bg-slate-100 flex items-center justify-center rounded-md text-slate-400">
                <ImageIcon className="h-8 w-8" />
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Image URL"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
              />
              <Button size="icon" onClick={addImage}>
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {formData.gallery?.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-md overflow-hidden group border"
                >
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-xs font-bold"
                    onClick={() => {
                      const newG = formData.gallery?.filter(
                        (_, idx) => idx !== i,
                      )
                      handleChange('gallery', newG)
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
