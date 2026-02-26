import { Property, PropertyStatus } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import useLanguageStore from '@/stores/useLanguageStore'
import { Badge } from '@/components/ui/badge'
import { Trophy } from 'lucide-react'
import { DataMask } from '@/components/DataMask'

interface PropertyOverviewProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
}

export function PropertyOverview({
  data,
  onChange,
  canEdit,
}: PropertyOverviewProps) {
  const { t, language } = useLanguageStore()
  const score = data.healthScore || 80

  const locale =
    language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle className="text-black">
          {t('properties.overview') || 'Overview'}
        </CardTitle>
        <Badge
          variant="outline"
          className="flex items-center gap-1 px-3 py-1 bg-white border-slate-200"
        >
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span className="text-black">
            {t('gamification.health_score') || 'Health Score'}:
          </span>
          <span
            className={`ml-1 font-bold ${score >= 90 ? 'text-green-600' : 'text-yellow-600'}`}
          >
            {score}/100
          </span>
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid gap-2">
          <Label>{t('common.name') || 'Name'}</Label>
          <DataMask className="w-full block">
            <Input
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={!canEdit}
              placeholder={
                t('properties.search_placeholder') || 'Property Name'
              }
              className="text-black bg-white border-slate-300"
            />
          </DataMask>
        </div>
        <div className="grid gap-2">
          <Label>{t('properties.property_value') || 'Listing Price'} ($)</Label>
          <DataMask className="w-full block">
            <CurrencyInput
              value={data.listingPrice || 0}
              onChange={(val) => onChange('listingPrice', val)}
              disabled={!canEdit}
              locale={locale}
              className="text-black bg-white border-slate-300"
            />
          </DataMask>
        </div>
        <div className="grid gap-2">
          <Label>{t('properties.profile_filter') || 'Profile Type'}</Label>
          <Select
            value={data.profileType}
            onValueChange={(v) => onChange('profileType', v)}
            disabled={!canEdit}
          >
            <SelectTrigger className="text-black bg-white border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="short_term" className="text-black">
                {t('properties.profile_short') || 'Short Term'}
              </SelectItem>
              <SelectItem value="long_term" className="text-black">
                {t('properties.profile_long') || 'Long Term'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{t('common.type') || 'Property Type'}</Label>
          <Select
            value={data.type}
            onValueChange={(v) => onChange('type', v)}
            disabled={!canEdit}
          >
            <SelectTrigger className="text-black bg-white border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="House" className="text-black">
                {t('properties.house') || 'House'}
              </SelectItem>
              <SelectItem value="Condo" className="text-black">
                {t('properties.condo') || 'Condo'}
              </SelectItem>
              <SelectItem value="Townhouse" className="text-black">
                {t('properties.townhouse') || 'Townhouse'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{t('common.status') || 'Status'}</Label>
          <Select
            value={data.status}
            onValueChange={(v) => onChange('status', v as PropertyStatus)}
            disabled={!canEdit}
          >
            <SelectTrigger className="text-black bg-white border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="interested" className="text-black">
                {t('status.interested') || 'Interested'}
              </SelectItem>
              <SelectItem value="rented" className="text-black">
                {t('status.rented') || 'Rented'}
              </SelectItem>
              <SelectItem value="available" className="text-black">
                {t('status.available') || 'Available'}
              </SelectItem>
              <SelectItem value="in_registration" className="text-black">
                {t('status.in_registration') || 'In Registration'}
              </SelectItem>
              <SelectItem value="suspended" className="text-black">
                {t('status.suspended') || 'Suspended'}
              </SelectItem>
              <SelectItem value="released" className="text-black">
                {t('status.released') || 'Released'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{t('properties.marketing') || 'Marketing Status'}</Label>
          <Select
            value={data.marketingStatus || 'unlisted'}
            onValueChange={(v) => onChange('marketingStatus', v)}
            disabled={!canEdit}
          >
            <SelectTrigger className="text-black bg-white border-slate-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="listed" className="text-black">
                {t('properties.publish_portals') || 'Listed'}
              </SelectItem>
              <SelectItem value="unlisted" className="text-black">
                {t('common.inactive') || 'Unlisted'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label>{t('properties.info_label') || 'Description'}</Label>
          <DataMask className="w-full block">
            <Textarea
              value={data.additionalInfo || ''}
              onChange={(e) => onChange('additionalInfo', e.target.value)}
              disabled={!canEdit}
              placeholder={
                t('properties.additional_info_placeholder') ||
                'Additional details...'
              }
              className="text-black bg-white border-slate-300 min-h-[100px]"
            />
          </DataMask>
        </div>
        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label>{t('properties.cover_image') || 'Cover Image'}</Label>
          <div className="space-y-2">
            {data.image ? (
              <div className="relative w-full max-w-md aspect-video rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={data.image}
                  alt="Property"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg'
                    e.currentTarget.onerror = null
                  }}
                />
                {canEdit && (
                  <button
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition-colors shadow-sm font-medium"
                    onClick={() => onChange('image', '')}
                    title="Remove Cover Image"
                  >
                    Delete Image
                  </button>
                )}
              </div>
            ) : (
              <div className="max-w-md">
                <FileUpload
                  value={data.image}
                  onChange={(url) => onChange('image', url)}
                  disabled={!canEdit}
                  label={t('properties.upload_image') || 'Upload Image'}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
