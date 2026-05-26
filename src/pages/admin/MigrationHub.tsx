import { useDbTranslations } from '@/hooks/use-db-translations'
import { Card, CardContent } from '@/components/ui/card'

export default function MigrationHub() {
  const { t } = useDbTranslations()
  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('menu.system.migration_hub', 'Migration Hub')}
          </h1>
          <p className="text-muted-foreground">
            {t('migration.desc', 'Data import, export and migration tools.')}
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-700 mb-2">
            {t('common.coming_soon', 'Coming Soon')}
          </h2>
          <p className="text-slate-500 max-w-md">
            {t('migration.empty', 'Migration tools will be available soon.')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
