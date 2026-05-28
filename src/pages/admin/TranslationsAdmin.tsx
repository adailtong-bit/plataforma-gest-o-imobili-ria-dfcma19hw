import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDbTranslations } from '@/hooks/use-db-translations'

export default function TranslationsAdmin() {
  const { t } = useDbTranslations()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          {t('sidebar.translations', 'Translations')}
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Translation Keys</CardTitle>
        </CardHeader>
        <CardContent>Manage localization strings.</CardContent>
      </Card>
    </div>
  )
}
