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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

  const handleShare = () => {
    if (data.status !== 'available' && data.status !== 'released') {
      toast({
        title: 'Compartilhamento Restrito',
        description: 'A propriedade deve estar Disponível ou Liberada.',
        variant: 'destructive',
      })
      return
    }

    const shareText = `Confira este imóvel: ${data.name}. ${data.listingPrice ? `Por apenas ${data.listingPrice}` : ''}`
    navigator.clipboard.writeText(shareText)
    toast({
      title: 'Link Copiado',
      description:
        'Texto de compartilhamento copiado para a área de transferência.',
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('properties.marketing')}</CardTitle>
            <CardDescription>{t('properties.marketing_desc')}</CardDescription>
          </div>
          <Button onClick={handleShare} className="gap-2 bg-blue-600">
            <Share2 className="h-4 w-4" /> Compartilhar
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
    </div>
  )
}
