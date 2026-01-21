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
import { Checkbox } from '@/components/ui/checkbox'
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
          <CardDescription>High quality images for portals.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {data.gallery?.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-video rounded-md overflow-hidden group"
              >
                <img
                  src={img}
                  className="w-full h-full object-cover"
                  alt={`Gallery ${idx}`}
                />
                {canEdit && (
                  <button
                    onClick={() => handleGalleryRemove(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    X
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
