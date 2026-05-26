import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import useLanguageStore from '@/stores/useLanguageStore'
import { MarketingAutomation } from '@/components/marketing/MarketingAutomation'

export default function Automation() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('automation_admin.title', 'Automation Rules')}
        </h1>
        <p className="text-muted-foreground">
          {t(
            'automation_admin.subtitle',
            'Configure system-wide triggers, logic builders, and notifications.',
          )}
        </p>
      </div>

      <div className="grid gap-6">
        <MarketingAutomation />

        <Card>
          <CardHeader>
            <CardTitle>
              {t('automation_admin.system_rules', 'System Automation Rules')}
            </CardTitle>
            <CardDescription>
              {t(
                'automation_admin.system_rules_desc',
                'Internal operational logic.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground py-8 text-center bg-slate-50 rounded-md border">
            {t(
              'automation_admin.no_system_rules',
              'No system automation rules configured.',
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
