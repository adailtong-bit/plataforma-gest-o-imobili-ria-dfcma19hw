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

  const handleGalleryAdd = (url: string) => {
    onChange('gallery', [...(data.gallery || []), url])
  }

  const handleGalleryRemove = (index: number) => {
    onChange(
      'gallery',
      (data.gallery || []).filter((_, i) => i !== index),
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('properties.marketing')}</CardTitle>
          <CardDescription>{t('properties.marketing_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/20">
            <div className="space-y-0.5">
              <Label className="text-base">
                {t('properties.publish_portals')}
              </Label>
              <p className="text-sm text-muted-foreground">
                Sync listing to Airbnb, Booking.com, Vrbo.
              </p>
            </div>
            <Switch
              checked={data.publishToPortals || false}
              onCheckedChange={(checked) =>
                onChange('publishToPortals', checked)
              }
              disabled={!canEdit}
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
              <Label>Marketing Status</Label>
              <div className="flex items-center gap-2 h-10">
                <Checkbox
                  id="listed"
                  checked={data.marketingStatus === 'listed'}
                  onCheckedChange={(c) =>
                    onChange('marketingStatus', c ? 'listed' : 'unlisted')
                  }
                  disabled={!canEdit}
                />
                <Label htmlFor="listed" className="cursor-pointer">
                  Publicly Listed
                </Label>
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
              placeholder="Enter engaging description..."
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
