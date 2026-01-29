import { Property, Condominium } from '@/lib/types'
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
import { MapPin } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

interface PropertyLocationProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
  condominiums: Condominium[]
}

export function PropertyLocation({
  data,
  onChange,
  canEdit,
  condominiums,
}: PropertyLocationProps) {
  const { t } = useLanguageStore()

  // Construct a full address string for the map query to be more precise
  const fullAddress = [
    data.address,
    data.additionalInfo,
    data.neighborhood,
    data.city,
    data.state,
    data.zipCode,
    data.country,
  ]
    .filter(Boolean)
    .join(', ')

  const encodedAddress = encodeURIComponent(fullAddress)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('properties.location.address')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>
              {t('properties.location.address')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              value={data.address}
              onChange={(e) => onChange('address', e.target.value)}
              disabled={!canEdit}
              placeholder="Rua, Número"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                {t('properties.zip_code')}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                value={data.zipCode || ''}
                onChange={(e) => onChange('zipCode', e.target.value)}
                disabled={!canEdit}
                required
                className={!data.zipCode ? 'border-red-300' : ''}
                placeholder="00000-000"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.info_label')}</Label>
              <Input
                value={data.additionalInfo || ''}
                onChange={(e) => onChange('additionalInfo', e.target.value)}
                disabled={!canEdit}
                placeholder="Apto, Bloco, Referência"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('properties.location.neighborhood')}</Label>
              <Input
                value={data.neighborhood || ''}
                onChange={(e) => onChange('neighborhood', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.location.community')}</Label>
              <Input
                value={data.community}
                onChange={(e) => onChange('community', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('properties.city_placeholder')}</Label>
              <Input
                value={data.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.state_placeholder')}</Label>
              <Input
                value={data.state || ''}
                onChange={(e) => onChange('state', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t('common.country')}</Label>
            <Input
              value={data.country || ''}
              onChange={(e) => onChange('country', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t('properties.location.linked_condo')}</Label>
            <Select
              value={data.condominiumId || 'none'}
              onValueChange={(v) =>
                onChange('condominiumId', v === 'none' ? undefined : v)
              }
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                {condominiums.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('properties.location.map_title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-square bg-muted rounded-lg flex flex-col items-center justify-center relative overflow-hidden border">
            {data.address && data.city ? (
              <iframe
                title="Property Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
                allowFullScreen
              ></iframe>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {t('properties.location.map_hint')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
