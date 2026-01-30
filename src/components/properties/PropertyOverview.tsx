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
import { hasPermission } from '@/lib/permissions'
import useAuthStore from '@/stores/useAuthStore'
import { User } from '@/lib/types'
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
  const { currentUser, isAuthenticated } = useAuthStore()

  // Access Control for Media
  const canViewMedia =
    currentUser.role === 'platform_owner' ||
    currentUser.role === 'property_owner' ||
    currentUser.role === 'software_tenant' ||
    (currentUser.role === 'internal_user' &&
      hasPermission(currentUser as User, 'properties', 'view'))

  // Health Score Color
  const score = data.healthScore || 80

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <CardTitle>{t('properties.overview')}</CardTitle>
          <DataMask className="h-6 w-24" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>{t('common.name')}</Label>
            <DataMask className="h-10 w-full rounded-md" />
          </div>
          <div className="grid gap-2">
            <Label>{t('properties.profile_filter')}</Label>
            <DataMask className="h-10 w-full rounded-md" />
          </div>
          <div className="grid gap-2">
            <Label>{t('common.type')}</Label>
            <DataMask className="h-10 w-full rounded-md" />
          </div>
          <div className="grid gap-2">
            <Label>{t('common.status')}</Label>
            <DataMask className="h-10 w-full rounded-md" />
          </div>
          <div className="grid gap-2">
            <Label>{t('properties.marketing')}</Label>
            <DataMask className="h-10 w-full rounded-md" />
          </div>
          <div className="grid gap-2 col-span-1 md:col-span-2">
            <Label>{t('properties.cover_image')}</Label>
            <DataMask className="w-full aspect-video rounded-md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <CardTitle>{t('properties.overview')}</CardTitle>
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
          <Trophy className="h-3 w-3 text-yellow-500" />
          {t('gamification.health_score')}:
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
          <Input
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={!canEdit}
            placeholder={t('properties.search_placeholder')}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t('properties.profile_filter')}</Label>
          <Select
            value={data.profileType}
            onValueChange={(v) => onChange('profileType', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_term">
                {t('properties.profile_short')}
              </SelectItem>
              <SelectItem value="long_term">
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="House">{t('properties.house')}</SelectItem>
              <SelectItem value="Condo">{t('properties.condo')}</SelectItem>
              <SelectItem value="Townhouse">
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interested">
                {t('status.interested')}
              </SelectItem>
              <SelectItem value="rented">{t('status.rented')}</SelectItem>
              <SelectItem value="available">{t('status.available')}</SelectItem>
              <SelectItem value="in_registration">
                {t('status.in_registration')}
              </SelectItem>
              <SelectItem value="suspended">{t('status.suspended')}</SelectItem>
              <SelectItem value="released">{t('status.released')}</SelectItem>
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="listed">
                {t('properties.publish_portals')}
              </SelectItem>
              <SelectItem value="unlisted">{t('common.inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label>{t('properties.cover_image')}</Label>
          {canViewMedia ? (
            <div className="space-y-2">
              {data.image ? (
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={data.image}
                    alt="Property"
                    className="w-full h-full object-cover"
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
          ) : (
            <div className="p-4 border border-dashed rounded bg-muted text-muted-foreground text-center text-sm">
              {t('properties.image_access_restricted')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
