import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import useLanguageStore from '@/stores/useLanguageStore'
import { MigrationWizard } from '@/components/migration/MigrationWizard'

export default function MigrationHub() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('migration.title', 'Migration Hub')}
          </h1>
          <p className="text-muted-foreground">
            {t(
              'migration.subtitle',
              'Import and migrate your data seamlessly.',
            )}
          </p>
        </div>
      </div>
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>
            {t('migration.wizard_title', 'Migration Wizard')}
          </CardTitle>
          <CardDescription>
            {t(
              'migration.wizard_desc',
              'Follow the steps to map and import your data from external systems.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MigrationWizard />
        </CardContent>
      </Card>
    </div>
  )
}
