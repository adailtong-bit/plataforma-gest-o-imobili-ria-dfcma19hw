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
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('common.name') || 'Name'}</Label>
            <Input
              value={data.name}
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
      </CardContent>
    </Card>
  )
}
