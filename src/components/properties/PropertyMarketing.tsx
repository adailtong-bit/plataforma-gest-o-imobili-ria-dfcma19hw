import { useState } from 'react'
import { Property } from '@/lib/types'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import useLanguageStore from '@/stores/useLanguageStore'
import { Button } from '@/components/ui/button'
import {
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Video,
  Copy,
  Download,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface PropertyMarketingProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyMarketing({
  data,
  onChange,
  canEdit,
}: PropertyMarketingProps) {
  const { t } = useLanguageStore()
  const { toast } = useToast()
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)

  const handleGalleryAdd = (url: string) => {
    onChange('gallery', [...(data.gallery || []), url])
  }

  const handleGalleryRemove = (index: number) => {
    onChange(
      'gallery',
      (data.gallery || []).filter((_, i) => i !== index),
    )
  }

  const handleSocialChange = (platform: string, value: string) => {
    onChange('socialMedia', { ...data.socialMedia, [platform]: value })
  }

  const handlePublishClick = () => {
    if (data.status !== 'available' && data.status !== 'released') {
      toast({
        title: 'Publicação Restrita',
        description: 'A propriedade deve estar Disponível ou Liberada.',
        variant: 'destructive',
      })
      return
    }
    setPublishDialogOpen(true)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `https://platform.com/listing/${data.id || 'preview'}`,
    )
    toast({ title: 'Link copiado para a área de transferência.' })
  }

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setZoomLevel(1)
    setLightboxOpen(true)
  }

  const nextImage = () => {
    if (data.gallery && data.gallery.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % data.gallery!.length)
      setZoomLevel(1)
    }
  }

  const prevImage = () => {
    if (data.gallery && data.gallery.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? data.gallery!.length - 1 : prev - 1,
      )
      setZoomLevel(1)
    }
  }

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3))
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 1))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('properties.marketing')}</CardTitle>
            <CardDescription>{t('properties.marketing_desc')}</CardDescription>
          </div>
          <Button onClick={handlePublishClick} className="gap-2 bg-blue-600">
            <Share2 className="h-4 w-4" /> Publish / Share
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base">
                {t('properties.publish_portals')}
              </Label>
              <p className="text-sm text-muted-foreground">
                Sincronizar com Airbnb, Booking, Vrbo.
              </p>
            </div>
            <Switch
              checked={data.publishToPortals || false}
              onCheckedChange={(checked) =>
                onChange('publishToPortals', checked)
              }
              disabled={
                !canEdit ||
                (data.status !== 'available' && data.status !== 'released')
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t('properties.listing_price')} (Base Nightly)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  className="pl-6"
                  value={data.listingPrice || ''}
                  onChange={(e) =>
                    onChange('listingPrice', Number(e.target.value))
                  }
                  disabled={!canEdit}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Lead Contact (Email)</Label>
              <Input
                value={data.leadContact || ''}
                onChange={(e) => onChange('leadContact', e.target.value)}
                placeholder="sales@agency.com"
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Redes Sociais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <Input
                  placeholder="Facebook URL"
                  value={data.socialMedia?.facebook || ''}
                  onChange={(e) =>
                    handleSocialChange('facebook', e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-pink-600" />
                <Input
                  placeholder="Instagram URL"
                  value={data.socialMedia?.instagram || ''}
                  onChange={(e) =>
                    handleSocialChange('instagram', e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center gap-2">
                <Linkedin className="h-5 w-5 text-blue-700" />
                <Input
                  placeholder="LinkedIn URL"
                  value={data.socialMedia?.linkedin || ''}
                  onChange={(e) =>
                    handleSocialChange('linkedin', e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                <Input
                  placeholder="YouTube URL"
                  value={data.socialMedia?.youtube || ''}
                  onChange={(e) =>
                    handleSocialChange('youtube', e.target.value)
                  }
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-black" />
                <Input
                  placeholder="TikTok URL"
                  value={data.socialMedia?.tiktok || ''}
                  onChange={(e) => handleSocialChange('tiktok', e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Other URL"
                  value={data.socialMedia?.other || ''}
                  onChange={(e) => handleSocialChange('other', e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('properties.public_desc')}</Label>
            <Textarea
              value={data.description?.en || ''}
              onChange={(e) =>
                onChange('description', {
                  ...data.description,
                  en: e.target.value,
                })
              }
              placeholder="Enter engaging description (EN)..."
              rows={5}
              disabled={!canEdit}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('properties.listing_gallery')}</CardTitle>
          <CardDescription>
            High quality images for portals. Click to expand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {data.gallery?.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-md overflow-hidden group cursor-pointer border border-muted hover:shadow-lg transition-all"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={img}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  alt={`Gallery ${idx}`}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-white drop-shadow-md" />
                </div>
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGalleryRemove(idx)
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {canEdit && (
            <FileUpload onChange={handleGalleryAdd} label="Add Photo" />
          )}
        </CardContent>
      </Card>

      {/* Lightbox Overlay */}
      {lightboxOpen && data.gallery && data.gallery.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200">
          <div className="absolute top-4 right-4 flex gap-2 z-50">
            <Button
              variant="secondary"
              size="icon"
              onClick={zoomIn}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={zoomOut}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLightboxOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevImage}
              className="text-white hover:bg-white/20 h-12 w-12 rounded-full"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          </div>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={nextImage}
              className="text-white hover:bg-white/20 h-12 w-12 rounded-full"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          <div
            className="overflow-hidden w-full h-full flex items-center justify-center p-8"
            style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
          >
            <img
              src={data.gallery[currentImageIndex]}
              alt="Fullscreen"
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
            {currentImageIndex + 1} / {data.gallery.length}
          </div>
        </div>
      )}

      {/* Automated Marketing Kit Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Automated Property Marketing Kit</DialogTitle>
            <DialogDescription>
              This kit is automatically generated based on property details. Use
              it for social media and listings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Social Media Post Preview */}
            <div className="border rounded-md p-4 bg-muted/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Share2 className="h-4 w-4" /> Social Media Preview
              </h4>
              <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
                <div className="aspect-video w-full bg-gray-100 rounded-md overflow-hidden">
                  <img
                    src={data.image}
                    alt="Main"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{data.name}</h3>
                  <p className="text-sm text-gray-600">
                    {data.city}, {data.state}
                  </p>
                </div>
                <p className="text-sm text-gray-800">
                  ✨ New Listing! Check out this amazing {data.bedrooms}BR/
                  {data.bathrooms}BA property in {data.community || data.city}.
                  {data.description?.en
                    ? ` ${data.description.en.substring(0, 80)}...`
                    : ''}
                </p>
                <div className="flex gap-2 text-xs text-blue-600 font-medium">
                  <span>#{data.city?.replace(/\s/g, '')}RealEstate</span>
                  <span>#DreamHome</span>
                  <span>#ForRent</span>
                </div>
              </div>
            </div>

            {/* Assets Download Section */}
            <div className="border rounded-md p-4 bg-muted/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Downloadable Assets
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" /> High-Res Photos (ZIP)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" /> PDF Brochure
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" /> Instagram Stories
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" /> Facebook Post
                </Button>
              </div>
            </div>

            {/* Links Section */}
            <div className="border rounded-md p-4 bg-muted/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4" /> Direct Booking Link
              </h4>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`https://platform.com/listing/${data.id || 'preview'}`}
                />
                <Button onClick={handleCopyLink} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPublishDialogOpen(false)}
            >
              Close
            </Button>
            <Button onClick={handleCopyLink} className="bg-trust-blue">
              Copy All Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
