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
import useLanguageStore from '@/stores/useLanguageStore'
import { applyZipCodeMask, isGenericOrPlaceholder } from '@/lib/utils'
import { LocationMap } from '@/components/ui/location-map'
import { DataMask } from '@/components/DataMask'

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

  // Ensure selected country defaults to US if not set
  const selectedCountry = data.country || 'US'

  const handleCountryChange = (val: string) => {
    onChange('country', val)
    // Re-validate zip code if country changes by clearing it or re-masking
    onChange('zipCode', '')
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = applyZipCodeMask(e.target.value, selectedCountry)
    onChange('zipCode', val)
  }

  const handleAddressSelect = (addr: any) => {
    const mappedCountry =
      addr.country === 'Brazil'
        ? 'BR'
        : addr.country === 'Spain'
          ? 'ES'
          : addr.country === 'USA'
            ? 'US'
            : selectedCountry

    onChange('country', mappedCountry)
    onChange('address', addr.street)
    onChange('city', addr.city)
    onChange('state', addr.state)
    onChange('zipCode', applyZipCodeMask(addr.zipCode, mappedCountry))
  }

  const isZipInvalid = !data.zipCode || isGenericOrPlaceholder(data.zipCode)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('properties.location.address')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>{t('common.country')}</Label>
            <Select
              value={selectedCountry}
              onValueChange={handleCountryChange}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">
                  {t('properties.location.country_us')}
                </SelectItem>
                <SelectItem value="BR">
                  {t('properties.location.country_br')}
                </SelectItem>
                <SelectItem value="ES">
                  {t('properties.location.country_es')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>
              {t('properties.location.address')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <DataMask className="w-full block">
              <Input
                value={data.address}
                onChange={(e) => onChange('address', e.target.value)}
                disabled={!canEdit}
                placeholder={t('properties.search_placeholder')}
              />
            </DataMask>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>
                {t('properties.zip_code')}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <DataMask className="w-full block">
                <Input
                  value={data.zipCode || ''}
                  onChange={handleZipChange}
                  disabled={!canEdit}
                  required
                  className={isZipInvalid ? 'border-red-300' : ''}
                  placeholder={selectedCountry === 'BR' ? '00000-000' : '00000'}
                />
              </DataMask>
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.info_label')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.additionalInfo || ''}
                  onChange={(e) => onChange('additionalInfo', e.target.value)}
                  disabled={!canEdit}
                  placeholder={t('properties.location.complement_placeholder')}
                />
              </DataMask>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('properties.location.neighborhood')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.neighborhood || ''}
                  onChange={(e) => onChange('neighborhood', e.target.value)}
                  disabled={!canEdit}
                />
              </DataMask>
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.location.community')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.community}
                  onChange={(e) => onChange('community', e.target.value)}
                  disabled={!canEdit}
                />
              </DataMask>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('properties.city_placeholder')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.city || ''}
                  onChange={(e) => onChange('city', e.target.value)}
                  disabled={!canEdit}
                />
              </DataMask>
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.state_placeholder')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.state || ''}
                  onChange={(e) => onChange('state', e.target.value)}
                  disabled={!canEdit}
                />
              </DataMask>
            </div>
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

      <LocationMap
        address={data.address}
        city={data.city}
        state={data.state}
        zipCode={data.zipCode}
        country={selectedCountry}
      />
    </div>
  )
}
