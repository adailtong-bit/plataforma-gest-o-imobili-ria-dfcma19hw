import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDbTranslations } from '@/hooks/use-db-translations'
import { Upload, Database, CheckCircle2 } from 'lucide-react'

export function MigrationWizard() {
  const { t } = useDbTranslations()
  const [step, setStep] = useState(1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border-2 ${
                step >= s
                  ? 'bg-trust-blue border-trust-blue text-white'
                  : 'border-slate-200 text-slate-400 bg-white'
              }`}
            >
              {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            <span
              className={`text-sm font-medium ${
                step >= s ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {s === 1
                ? t('migration.step1', 'Connect')
                : s === 2
                  ? t('migration.step2', 'Map Data')
                  : t('migration.step3', 'Import')}
            </span>
          </div>
        ))}
      </div>

      <div className="min-h-[200px] flex flex-col justify-center">
        {step === 1 && (
          <div className="text-center space-y-4 animate-in fade-in zoom-in-95">
            <Database className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">
              {t('migration.connect_title', 'Connect to Source')}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {t(
                'migration.connect_desc',
                'Select your previous platform to begin the migration process securely.',
              )}
            </p>
          </div>
        )}
        {step === 2 && (
          <div className="text-center space-y-4 animate-in fade-in zoom-in-95">
            <Upload className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">
              {t('migration.map_title', 'Map Data Fields')}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {t(
                'migration.map_desc',
                'Review how your data will be imported into Summerpm.',
              )}
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="text-center space-y-4 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">
              {t('migration.import_title', 'Ready to Import')}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {t(
                'migration.import_desc',
                'All checks passed. Click start to bring your data into the system.',
              )}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          {t('common.back', 'Back')}
        </Button>
        <Button
          className="bg-trust-blue text-white"
          onClick={() => {
            if (step < 3) setStep(step + 1)
          }}
        >
          {step === 3
            ? t('migration.start', 'Start Import')
            : t('common.next', 'Next')}
        </Button>
      </div>
    </div>
  )
}
