import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'

export default function Automation() {
  const { t } = useDbTranslations()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {t('menu.system.automation_rules', 'Automation Rules')}
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>Automation settings are being updated.</CardContent>
      </Card>
    </div>
  )
}
