import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import useLanguageStore from '@/stores/useLanguageStore'

export function CommunicationSettings() {
  const { t } = useLanguageStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('short_term.auto_replies')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t('short_term.send_welcome')}</Label>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <Label>{t('short_term.send_checkout_instr')}</Label>
          <Switch />
        </div>
      </CardContent>
    </Card>
  )
}
