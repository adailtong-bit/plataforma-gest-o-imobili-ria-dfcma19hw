import { Property, PropertyStatus } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
  const { t } = useLanguageStore()

  // Health Score Color
  const score = data.healthScore || 80

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle className="text-black">{t('properties.overview')}</CardTitle>
        <Badge
          variant="outline"
          className="flex items-center gap-1 px-3 py-1 bg-white border-slate-200"
        >
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span className="text-black">{t('gamification.health_score')}:</span>
          <span
            className={`ml-1 font-bold ${score >= 90 ? 'text-green-600' : 'text-yellow-600'}`}
          >
            {score}/100
          </span>
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>{t('common.name')}</Label>
          <DataMask className="w-full block">
            <Input
              value={data.name}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={!canEdit}
              placeholder={t('properties.search_placeholder')}
              className="text-black bg-white border-slate-300"
            />
          </DataMask>
        </div>
        <div className="grid gap-2">
          <Label>{t('properties.profile_filter')}</Label>
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
                {t('properties.profile_short')}
              </SelectItem>
              <SelectItem value="long_term" className="text-black">
                {t('properties.profile_long')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{t('common.type')}</Label>
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
                {t('properties.house')}
              </SelectItem>
              <SelectItem value="Condo" className="text-black">
                {t('properties.condo')}
              </SelectItem>
              <SelectItem value="Townhouse" className="text-black">
                {t('properties.townhouse')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{t('common.status')}</Label>
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
                {t('status.interested')}
              </SelectItem>
              <SelectItem value="rented" className="text-black">
                {t('status.rented')}
              </SelectItem>
              <SelectItem value="available" className="text-black">
                {t('status.available')}
              </SelectItem>
              <SelectItem value="in_registration" className="text-black">
                {t('status.in_registration')}
              </SelectItem>
              <SelectItem value="suspended" className="text-black">
                {t('status.suspended')}
              </SelectItem>
              <SelectItem value="released" className="text-black">
                {t('status.released')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{t('properties.marketing')}</Label>
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
                {t('properties.publish_portals')}
              </SelectItem>
              <SelectItem value="unlisted" className="text-black">
                {t('common.inactive')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label>{t('properties.cover_image')}</Label>
          <div className="space-y-2">
            {data.image ? (
              <div className="relative w-full aspect-video rounded-md overflow-hidden bg-slate-100 border border-slate-200">
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
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition-colors"
                    onClick={() => onChange('image', '')}
                  >
                    {t('common.delete')}
                  </button>
                )}
              </div>
            ) : (
              <FileUpload
                value={data.image}
                onChange={(url) => onChange('image', url)}
                disabled={!canEdit}
                label={t('properties.upload_image')}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
