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
import useHotelStore from '@/stores/useHotelStore'
import { Building } from 'lucide-react'

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
  const { hotels, towers } = useHotelStore()

  const selectedCountry = data.country || 'US'
  const isHotelLinked = !!data.hotelId && data.hotelId !== 'none'

  const handleCountryChange = (val: string) => {
    onChange('country', val)
    onChange('zipCode', '')
  }

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = applyZipCodeMask(e.target.value, selectedCountry)
    onChange('zipCode', val)
  }

  const handleHotelChange = (val: string) => {
    if (val === 'none') {
      onChange('hotelId', undefined)
      onChange('towerId', undefined)
    } else {
      const hotel = hotels.find((h) => h.id === val)
      if (hotel) {
        onChange('hotelId', val)
        onChange('towerId', undefined)
        onChange('address', hotel.address || '')
        onChange('number', hotel.number || '')
        onChange('neighborhood', hotel.neighborhood || '')
        onChange('city', hotel.city || '')
        onChange('state', hotel.state || '')
        onChange('zipCode', hotel.zipCode || '')
        onChange('country', hotel.country || 'US')
      }
    }
  }

  const isZipInvalid = !data.zipCode || isGenericOrPlaceholder(data.zipCode)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" /> Hierarchy & Associations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Parent Hotel Link</Label>
              <Select
                value={data.hotelId || 'none'}
                onValueChange={handleHotelChange}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Hotel (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isHotelLinked && (
              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="grid gap-2">
                  <Label>Tower / Wing</Label>
                  <Select
                    value={data.towerId || 'none'}
                    onValueChange={(v) =>
                      onChange('towerId', v === 'none' ? undefined : v)
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {towers
                        .filter((t) => t.hotelId === data.hotelId)
                        .map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Floor</Label>
                  <Input
                    value={data.floor || ''}
                    onChange={(e) => onChange('floor', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. 5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Room / Suite</Label>
                  <Input
                    value={data.roomNumber || ''}
                    onChange={(e) => onChange('roomNumber', e.target.value)}
                    disabled={!canEdit}
                    placeholder="e.g. 501"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2 mt-2">
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
            <CardTitle>{t('properties.location.address')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t('common.country')}</Label>
              <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
                disabled={!canEdit || isHotelLinked}
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

            <div className="grid grid-cols-4 gap-4">
              <div className="grid gap-2 col-span-3">
                <Label>
                  {t('properties.location.address')}{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <DataMask className="w-full block">
                  <Input
                    value={data.address}
                    onChange={(e) => onChange('address', e.target.value)}
                    disabled={!canEdit || isHotelLinked}
                    placeholder={t('properties.search_placeholder')}
                  />
                </DataMask>
              </div>
              <div className="grid gap-2 col-span-1">
                <Label>No.</Label>
                <DataMask className="w-full block">
                  <Input
                    value={data.number || ''}
                    onChange={(e) => onChange('number', e.target.value)}
                    disabled={!canEdit || isHotelLinked}
                    placeholder="No."
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
                    disabled={!canEdit || isHotelLinked}
                  />
                </DataMask>
              </div>
              <div className="grid gap-2">
                <Label>
                  {t('properties.zip_code')}{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <DataMask className="w-full block">
                  <Input
                    value={data.zipCode || ''}
                    onChange={handleZipChange}
                    disabled={!canEdit || isHotelLinked}
                    required
                    className={isZipInvalid ? 'border-red-300' : ''}
                    placeholder={
                      selectedCountry === 'BR' ? '00000-000' : '00000'
                    }
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
                    disabled={!canEdit || isHotelLinked}
                  />
                </DataMask>
              </div>
              <div className="grid gap-2">
                <Label>{t('properties.state_placeholder')}</Label>
                <DataMask className="w-full block">
                  <Input
                    value={data.state || ''}
                    onChange={(e) => onChange('state', e.target.value)}
                    disabled={!canEdit || isHotelLinked}
                  />
                </DataMask>
              </div>
            </div>

            <div className="grid gap-2 pt-2 border-t mt-2">
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
            <div className="grid gap-2">
              <Label>{t('properties.location.community')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.community}
                  onChange={(e) => onChange('community', e.target.value)}
                  disabled={!canEdit || isHotelLinked}
                />
              </DataMask>
            </div>
          </CardContent>
        </Card>
      </div>

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
