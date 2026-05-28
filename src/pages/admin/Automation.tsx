import { useDbTranslations } from '@/hooks/use-db-translations'
import { Card, CardContent } from '@/components/ui/card'

export default function Automation() {
  const { t } = useDbTranslations()
  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('menu.system.automation_rules', 'Automation Rules')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'automation.desc',
              'Configure workflows and automated tasks for your operations.',
            )}
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center min-h-[400px]">
          <h2 className="text-xl font-bold text-slate-700 mb-2 mt-12">
            {t('common.coming_soon', 'Coming Soon')}
          </h2>
          <p className="text-slate-500 max-w-md">
            {t(
              'automation.empty_state',
              'Automation rules engine is currently under development. Check back later for updates.',
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
