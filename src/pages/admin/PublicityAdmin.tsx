import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'

export default function PublicityAdmin() {
  const { t } = useDbTranslations()

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('publicity.title', 'Advertising Admin')}
        </h1>
        <p className="text-slate-500">
          {t(
            'publicity.subtitle',
            'Manage advertising campaigns and placements.',
          )}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('publicity.campaigns', 'Campaigns')}</CardTitle>
          <CardDescription>
            {t('publicity.campaigns_desc', 'Active and pending campaigns')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">
            {t('common.empty', 'No data available.')}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
