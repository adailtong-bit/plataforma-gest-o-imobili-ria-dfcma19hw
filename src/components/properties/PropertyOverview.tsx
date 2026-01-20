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
  const { currentUser } = useAuthStore()

  // Access Control for Media
  const canViewMedia =
    currentUser.role === 'platform_owner' ||
    currentUser.role === 'property_owner' ||
    currentUser.role === 'software_tenant' ||
    (currentUser.role === 'internal_user' &&
      hasPermission(currentUser as User, 'properties', 'view'))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('properties.overview')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Nome da Propriedade</Label>
          <Input
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            disabled={!canEdit}
            placeholder="Ex: Villa Sol"
          />
        </div>
        <div className="grid gap-2">
          <Label>Perfil da Propriedade</Label>
          <Select
            value={data.profileType}
            onValueChange={(v) => onChange('profileType', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short_term">Curta Duração (STR)</SelectItem>
              <SelectItem value="long_term">Longa Duração (LTR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Tipo de Imóvel</Label>
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
          <Label>Status Marketing</Label>
          <Select
            value={data.marketingStatus || 'unlisted'}
            onValueChange={(v) => onChange('marketingStatus', v)}
            disabled={!canEdit}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="listed">Listado</SelectItem>
              <SelectItem value="unlisted">Não Listado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 col-span-1 md:col-span-2">
          <Label>Imagem Principal</Label>
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
                      Remover
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
