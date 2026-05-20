import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import useLanguageStore from '@/stores/useLanguageStore'

interface Props {
  data: Property
  onChange: (f: keyof Property, v: any) => void
  canEdit: boolean
}

export function PropertyOverview({ data, onChange, canEdit }: Props) {
  const { t } = useLanguageStore()
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>{t('properties.tabs.overview') || 'Overview'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('common.name') || 'Name'}</Label>
            <Input
              value={data.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.type') || 'Type'}</Label>
            <Input
              value={data.type || ''}
              onChange={(e) => onChange('type', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('properties.rental_type') || 'Rental Type'}</Label>
            <Input
              value={
                data.profileType === 'short_term'
                  ? t('properties.profile_short') || 'Short Term'
                  : t('properties.profile_long') || 'Long Term'
              }
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.status') || 'Status'}</Label>
            <Input
              className="capitalize"
              value={t(`status.${data.status}`, data.status || '')}
              disabled
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-4">
            {t('common.property_details', 'Property Details')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t('common.area', 'Area')}</Label>
              <Input
                type="number"
                value={data.area || ''}
                onChange={(e) => onChange('area', parseFloat(e.target.value))}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.bedrooms', 'Bedrooms')}</Label>
              <Input
                type="number"
                value={data.bedrooms || ''}
                onChange={(e) =>
                  onChange('bedrooms', parseInt(e.target.value, 10))
                }
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.bathrooms', 'Bathrooms')}</Label>
              <Input
                type="number"
                value={data.bathrooms || ''}
                onChange={(e) =>
                  onChange('bathrooms', parseInt(e.target.value, 10))
                }
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.guests', 'Guests')}</Label>
              <Input
                type="number"
                value={data.guests || ''}
                onChange={(e) =>
                  onChange('guests', parseInt(e.target.value, 10))
                }
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.price', 'Listing Price')}</Label>
              <Input
                type="number"
                value={data.listingPrice || ''}
                onChange={(e) =>
                  onChange('listingPrice', parseFloat(e.target.value))
                }
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('properties.hoa_fee', 'HOA Fee')}</Label>
              <Input
                type="number"
                value={data.hoaValue || ''}
                onChange={(e) =>
                  onChange('hoaValue', parseFloat(e.target.value))
                }
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-4">
            {t('common.address', 'Location / Address')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>{t('common.address', 'Address')}</Label>
              <Input
                value={data.address || ''}
                onChange={(e) => onChange('address', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.number', 'Number')}</Label>
              <Input
                value={data.number || ''}
                onChange={(e) => onChange('number', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.neighborhood', 'Neighborhood')}</Label>
              <Input
                value={data.neighborhood || ''}
                onChange={(e) => onChange('neighborhood', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.city', 'City')}</Label>
              <Input
                value={data.city || ''}
                onChange={(e) => onChange('city', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.state', 'State')}</Label>
              <Input
                value={data.state || ''}
                onChange={(e) => onChange('state', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.zip_code', 'Zip Code')}</Label>
              <Input
                value={data.zipCode || ''}
                onChange={(e) => onChange('zipCode', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
