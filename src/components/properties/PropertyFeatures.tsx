import { Property, Condominium } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import useLanguageStore from '@/stores/useLanguageStore'

interface Props {
  data: Property
  onChange: (f: keyof Property, v: any) => void
  canEdit: boolean
  condominium?: Condominium
}

export function PropertyFeatures({ data, onChange, canEdit }: Props) {
  const { t } = useLanguageStore()
  return (
    <Card className="border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle>
          {t('properties.tabs.features') || 'Features & Amenities'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('properties.features.bedrooms') || 'Bedrooms'}</Label>
            <Input
              type="number"
              value={data.bedrooms}
              onChange={(e) => onChange('bedrooms', Number(e.target.value))}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('properties.features.bathrooms') || 'Bathrooms'}</Label>
            <Input
              type="number"
              value={data.bathrooms}
              onChange={(e) => onChange('bathrooms', Number(e.target.value))}
              disabled={!canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('properties.features.guests') || 'Max Guests'}</Label>
            <Input
              type="number"
              value={data.guests}
              onChange={(e) => onChange('guests', Number(e.target.value))}
              disabled={!canEdit}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
