import { useDbTranslations } from '@/hooks/use-db-translations'
import { Card, CardContent } from '@/components/ui/card'

export default function Analytics() {
  const { t } = useDbTranslations()
  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('menu.system.advanced_analytics', 'Advanced Analytics')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'analytics.desc',
              'Deep dive into your property management metrics and KPIs.',
            )}
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            {t('common.coming_soon', 'Coming Soon')}
          </h2>
          <p className="text-slate-500 max-w-md">
            {t(
              'analytics.empty',
              'Advanced analytics dashboard is currently under development.',
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
