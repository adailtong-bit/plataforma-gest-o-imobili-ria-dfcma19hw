import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'

export default function EnvironmentManager() {
  const { t } = useDbTranslations()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {t('sidebar.environment', 'Environment')}
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Environment Settings</CardTitle>
        </CardHeader>
        <CardContent>Manage your configurations here.</CardContent>
      </Card>
    </div>
  )
}
