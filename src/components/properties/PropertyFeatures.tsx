import { Property, Condominium } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Lock, Key, Waves } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'
import { DataMask } from '@/components/DataMask'

interface PropertyFeaturesProps {
  data: Property
  onChange: (field: keyof Property, value: any) => void
  canEdit: boolean
  condominium?: Condominium
}

export function PropertyFeatures({
  data,
  onChange,
  canEdit,
  condominium,
}: PropertyFeaturesProps) {
  const { t } = useLanguageStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('properties.tabs.features')}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Features */}
        <div className="grid gap-2">
          <Label>{t('properties.features.bedrooms')}</Label>
          <Input
            type="number"
            value={data.bedrooms}
            onChange={(e) => onChange('bedrooms', Number(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t('properties.features.bathrooms')}</Label>
          <Input
            type="number"
            value={data.bathrooms}
            onChange={(e) => onChange('bathrooms', Number(e.target.value))}
            disabled={!canEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label>{t('properties.features.guests')}</Label>
          <Input
            type="number"
            value={data.guests}
            onChange={(e) => onChange('guests', Number(e.target.value))}
            disabled={!canEdit}
          />
        </div>

        <div className="md:col-span-3 border-t pt-4 mt-2">
          <h3 className="font-semibold text-sm mb-4">
            {t('properties.features.wifi_connectivity')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>{t('properties.features.ssid')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.wifiSsid || ''}
                  onChange={(e) => onChange('wifiSsid', e.target.value)}
                  disabled={!canEdit}
                  placeholder="SSID"
                />
              </DataMask>
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.features.password')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.wifiPassword || ''}
                  onChange={(e) => onChange('wifiPassword', e.target.value)}
                  disabled={!canEdit}
                  placeholder="********"
                />
              </DataMask>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 border-t pt-4 mt-2">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Key className="h-4 w-4" /> {t('properties.features.access_codes')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>{t('properties.features.unit_code')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.accessCodeUnit || ''}
                  onChange={(e) => onChange('accessCodeUnit', e.target.value)}
                  disabled={!canEdit}
                  placeholder="1234"
                />
              </DataMask>
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.features.building_code')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.accessCodeBuilding || ''}
                  onChange={(e) =>
                    onChange('accessCodeBuilding', e.target.value)
                  }
                  disabled={!canEdit}
                  placeholder="#5566"
                />
              </DataMask>
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.features.pool_code')}</Label>
              <DataMask className="w-full block relative">
                <Input
                  value={data.accessCodePool || ''}
                  onChange={(e) => onChange('accessCodePool', e.target.value)}
                  disabled={!canEdit}
                  placeholder="9090"
                  className="pl-8"
                />
                <Waves className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              </DataMask>
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.features.staff_code')}</Label>
              <DataMask className="w-full block">
                <Input
                  value={data.accessCodeCleaning || ''}
                  onChange={(e) =>
                    onChange('accessCodeCleaning', e.target.value)
                  }
                  disabled={!canEdit}
                  placeholder="Internal use"
                />
              </DataMask>
            </div>
          </div>
        </div>

        {/* Mirrored Condo Access */}
        {condominium && condominium.accessCredentials && (
          <div className="md:col-span-3 border-t pt-4 mt-4 bg-muted/20 p-4 rounded-lg">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground mb-3">
              <Lock className="h-4 w-4" />{' '}
              {t('properties.features.condo_read_only')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(condominium.accessCredentials).map(
                ([key, val]) =>
                  val && (
                    <div key={key}>
                      <Label className="text-xs text-muted-foreground uppercase">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <DataMask blur className="block">
                        <div className="font-mono text-sm font-semibold">
                          {val}
                        </div>
                      </DataMask>
                    </div>
                  ),
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              {t('properties.features.condo_hint', { condo: condominium.name })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
