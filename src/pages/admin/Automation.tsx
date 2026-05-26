import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'

export default function Automation() {
  const { t } = useDbTranslations()

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {t('automation.title', 'Automation Rules')}
        </h1>
        <p className="text-slate-500">
          {t(
            'automation.subtitle',
            'Configure system automation triggers and actions.',
          )}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('automation.rules', 'Rules')}</CardTitle>
          <CardDescription>
            {t('automation.rules_desc', 'Active automation rules')}
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
