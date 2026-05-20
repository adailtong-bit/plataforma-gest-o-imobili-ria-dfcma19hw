import { Property } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import useLanguageStore from '@/stores/useLanguageStore'

interface Props {
  data: Property
  onChange: (f: keyof Property, v: any) => void
  canEdit: boolean
  ownerDetails?: any
}

export function PropertyOverview({
  data,
  onChange,
  canEdit,
  ownerDetails,
}: Props) {
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
          <div className="space-y-2">
            <Label>{t('common.community') || 'Community'}</Label>
            <Input
              value={data.community || ''}
              onChange={(e) => onChange('community', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.floor') || 'Floor'}</Label>
            <Input
              value={data.floor || ''}
              onChange={(e) => onChange('floor', e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('common.room_number') || 'Room Number'}</Label>
            <Input
              value={data.roomNumber || data.room_number || ''}
              onChange={(e) => onChange('roomNumber', e.target.value)}
              disabled={!canEdit}
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

        {ownerDetails && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm mb-4 text-slate-900">
              {t('properties.owner_contact', 'Owner Contact Info')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('common.name', 'Owner Name')}</Label>
                <Input value={ownerDetails.name || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>{t('common.email', 'Email')}</Label>
                <Input value={ownerDetails.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label>{t('common.phone', 'Phone')}</Label>
                <Input value={ownerDetails.phone || ''} disabled />
              </div>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-4 text-slate-900">
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
                value={data.zipCode || data.zip_code || ''}
                onChange={(e) => onChange('zipCode', e.target.value)}
                disabled={!canEdit}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('common.country', 'Country')}</Label>
              <Input
                value={data.country || ''}
                onChange={(e) => onChange('country', e.target.value)}
                disabled={!canEdit}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
