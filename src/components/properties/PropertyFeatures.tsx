import { Property, Condominium } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Lock, Key, Waves } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

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
              <Input
                value={data.wifiSsid || ''}
                onChange={(e) => onChange('wifiSsid', e.target.value)}
                disabled={!canEdit}
                placeholder="Ex: MinhaCasa_5G"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.features.password')}</Label>
              <Input
                value={data.wifiPassword || ''}
                onChange={(e) => onChange('wifiPassword', e.target.value)}
                disabled={!canEdit}
                placeholder="********"
              />
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
              <Input
                value={data.accessCodeUnit || ''}
                onChange={(e) => onChange('accessCodeUnit', e.target.value)}
                disabled={!canEdit}
                placeholder="Ex: 1234"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.features.building_code')}</Label>
              <Input
                value={data.accessCodeBuilding || ''}
                onChange={(e) => onChange('accessCodeBuilding', e.target.value)}
                disabled={!canEdit}
                placeholder="Ex: #5566"
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.features.pool_code')}</Label>
              <div className="relative">
                <Input
                  value={data.accessCodePool || ''}
                  onChange={(e) => onChange('accessCodePool', e.target.value)}
                  disabled={!canEdit}
                  placeholder="Ex: 9090"
                  className="pl-8"
                />
                <Waves className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('properties.features.staff_code')}</Label>
              <Input
                value={data.accessCodeCleaning || ''}
                onChange={(e) => onChange('accessCodeCleaning', e.target.value)}
                disabled={!canEdit}
                placeholder="Uso interno"
              />
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
                      <div className="font-mono text-sm font-semibold">
                        {val}
                      </div>
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
