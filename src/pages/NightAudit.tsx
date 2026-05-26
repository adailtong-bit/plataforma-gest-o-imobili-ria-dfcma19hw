import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayCircle, CheckCircle2 } from 'lucide-react'
import useLanguageStore from '@/stores/useLanguageStore'

export default function NightAudit() {
  const { t } = useLanguageStore()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t('night_audit.title', 'Night Audit')}
        </h1>
        <p className="text-muted-foreground">
          {t(
            'night_audit.subtitle',
            'Run daily financial closures and post room charges.',
          )}
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm bg-white max-w-2xl">
        <CardHeader>
          <CardTitle>{t('night_audit.run_title', 'Run Night Audit')}</CardTitle>
          <CardDescription>
            {t(
              'night_audit.run_desc',
              "This process will post all pending room charges, taxes, and finalize the day's transactions.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-green-600" />{' '}
              {t('night_audit.checkins_complete', 'All check-ins complete')}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-green-600" />{' '}
              {t('night_audit.pos_closed', 'POS batches closed')}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-green-600" />{' '}
              {t('night_audit.no_pending', 'No pending balances')}
            </div>
          </div>

          <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 gap-2 font-bold text-white">
            <PlayCircle className="h-4 w-4" />{' '}
            {t('night_audit.start_button', 'Start Night Audit Process')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
